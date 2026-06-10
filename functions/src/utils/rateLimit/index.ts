import * as functions from 'firebase-functions/v1';
import { db } from '../firebase/admin';

// 店舗KYCのチャレンジ(確認コード)入力に対するブルートフォース対策。
// 確認コードは数字6桁のため、レートリミットが無いと総当たりで突破できてしまう。
// 連続で一定回数失敗するとロックし、ロックを繰り返すごとにロック時間を指数的に延ばす。
// 失敗回数・ロック期限・ロック回数は店舗KYC秘密情報ドキュメント(adminのみ読み書き可)に記録する。
// 同時リクエストによるカウンタのlost update(=ロック回避)を防ぐため、読み込み〜更新は
// Firestoreトランザクションで原子的に行う。

// この回数連続で失敗するとロックする
export const MAX_CHALLENGE_FAILED_COUNT = 5;
// 初回のロック時間(5分)
const BASE_LOCK_DURATION_MS = 5 * 60 * 1000;
// ロック時間の上限(24時間)
const MAX_LOCK_DURATION_MS = 24 * 60 * 60 * 1000;

export type ChallengeKey = 'storeEmail' | 'storePhoneNumber' | 'storeAddress';

type SecretData = FirebaseFirestore.DocumentData | undefined;

const secretFieldName = (key: ChallengeKey): string => `${key}Secret`;
const failedCountFieldName = (key: ChallengeKey): string => `${key}FailedCount`;
const lockedUntilFieldName = (key: ChallengeKey): string => `${key}LockedUntil`;
const lockCountFieldName = (key: ChallengeKey): string => `${key}LockCount`;

const readNumberField = (data: SecretData, fieldName: string): number => {
  const value = data?.[fieldName];
  return typeof value === 'number' ? value : 0;
};

// ロック中であれば例外を投げる。
const assertChallengeNotLocked = (data: SecretData, key: ChallengeKey): void => {
  const lockedUntil = readNumberField(data, lockedUntilFieldName(key));
  const now = Date.now();
  if (lockedUntil > now) {
    const remainingMinutes = Math.ceil((lockedUntil - now) / (60 * 1000));
    throw new functions.https.HttpsError(
      'resource-exhausted',
      `確認コードの連続入力ミスのため一時的にロックされています。約${remainingMinutes}分後に再度お試しください。`,
    );
  }
};

// 確認コード照合に失敗したときの秘密情報ドキュメントの更新値を計算する({ merge: true }で書き込む想定)。
const buildChallengeFailureUpdate = (data: SecretData, key: ChallengeKey): Record<string, number> => {
  const failedCount = readNumberField(data, failedCountFieldName(key)) + 1;
  if (failedCount < MAX_CHALLENGE_FAILED_COUNT) {
    return { [failedCountFieldName(key)]: failedCount };
  }
  // しきい値に達したのでロックする。ロックを繰り返すごとにロック時間を指数的に延ばす。
  const lockCount = readNumberField(data, lockCountFieldName(key)) + 1;
  const lockDuration = Math.min(BASE_LOCK_DURATION_MS * 2 ** (lockCount - 1), MAX_LOCK_DURATION_MS);
  return {
    [failedCountFieldName(key)]: 0,
    [lockedUntilFieldName(key)]: Date.now() + lockDuration,
    [lockCountFieldName(key)]: lockCount,
  };
};

// 確認コード照合に成功したときに失敗回数・ロック状態をリセットする更新値({ merge: true }で書き込む想定)。
const buildChallengeSuccessReset = (key: ChallengeKey): Record<string, number> => ({
  [failedCountFieldName(key)]: 0,
  [lockedUntilFieldName(key)]: 0,
  [lockCountFieldName(key)]: 0,
});

// 確認コードをレートリミット付きで照合する。
// ロック中・確認コード誤りの場合はHttpsErrorを投げ、正しければ何も返さず正常終了する。
// 読み込み・ロック判定・カウンタ更新をトランザクションで原子的に行うため、
// 並列リクエストでカウンタが上書きされてロックを回避されることがない。
export const verifyStoreChallenge = async (
  storeKycSecretDocRef: FirebaseFirestore.DocumentReference,
  key: ChallengeKey,
  challengedSecret: string,
): Promise<void> => {
  // 確認コード誤り時は失敗カウンタの更新をコミットしたいので、トランザクション内では
  // 例外を投げず、照合結果だけを返してトランザクション外で例外を投げる。
  const verified = await db.runTransaction(async (transaction) => {
    const storeKycSecretDoc = await transaction.get(storeKycSecretDocRef);
    const data = storeKycSecretDoc.data();
    // ロック中はカウンタ更新不要のため、ここで投げてトランザクションを中断する。
    assertChallengeNotLocked(data, key);
    const secret = data?.[secretFieldName(key)] as string | undefined;
    if (challengedSecret !== secret) {
      transaction.set(storeKycSecretDocRef, buildChallengeFailureUpdate(data, key), { merge: true });
      return false;
    }
    transaction.set(storeKycSecretDocRef, buildChallengeSuccessReset(key), { merge: true });
    return true;
  });
  if (!verified) {
    // 認証(unauthenticated)ではなく確認コードの誤りを表す状態を返す。
    throw new functions.https.HttpsError('failed-precondition', 'Wrong secret');
  }
};
