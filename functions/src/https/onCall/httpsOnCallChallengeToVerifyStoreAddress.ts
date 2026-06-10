import * as functions from 'firebase-functions/v1';
import { db, auth } from '../../utils/firebase/admin';
import { verifyStoreChallenge } from '../../utils/rateLimit';

interface VerifyStoreAddressRequest {
  userId: string;
  storeId: string;
  storeAddressSecret: string;
}

interface VerifyStoreAddressResponse {
  storeAddressVerified: boolean;
}

interface KycStatus {
  emailVerified: boolean;
  userKycVerified: boolean;
  storeEmailVerified: boolean;
  storePhoneNumberVerified: boolean;
  storeAddressVerified: boolean;
  storeKycVerified: boolean;
}

export const httpsOnCallChallengeToVerifyStoreAddress = functions
  .region('asia-northeast1')
  .runWith({ memory: '128MB', timeoutSeconds: 10 })
  .https.onCall(async (data: VerifyStoreAddressRequest, context): Promise<VerifyStoreAddressResponse> => {
    try {
      const userId = context.auth?.uid;
      if (!userId) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
      }
      const authUser = await auth.getUser(userId);
      if (userId !== authUser.uid) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
      }
      const challengedStoreAddressSecret = data.storeAddressSecret;
      if (typeof challengedStoreAddressSecret !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid store address secret');
      }
      const storeId = userId;
      const storeKycSecretDocRef = db
        .collection('users')
        .doc(userId)
        .collection('stores')
        .doc(storeId)
        .collection('kyc')
        .doc('secret');
      await verifyStoreChallenge(storeKycSecretDocRef, 'storeAddress', challengedStoreAddressSecret);

      const { emailVerified, customClaims } = authUser;
      const userKycVerified = emailVerified;
      const storeAddressVerified = true;
      const storeEmailVerified = !!customClaims?.storeEmailVerified;
      const storePhoneNumberVerified = !!customClaims?.storePhoneNumberVerified;
      const storeKycVerified = storeEmailVerified && storePhoneNumberVerified && storeAddressVerified;
      const kycStatus: KycStatus = {
        emailVerified,
        userKycVerified,
        storeEmailVerified,
        storePhoneNumberVerified,
        storeAddressVerified,
        storeKycVerified,
      };
      await auth.setCustomUserClaims(userId, kycStatus);

      // Note: storeKycがOKで、店舗情報が存在するが、店舗情報未公開だった場合、店舗情報を公開する
      if (storeKycVerified) {
        const storeForUserDocRef = db.collection('users').doc(userId).collection('stores').doc(storeId);
        const storeForUserDoc = await storeForUserDocRef.get();
        const storeForUser = storeForUserDoc.data();

        const storeDocRef = db.collection('stores').doc(storeId);
        const storeDoc = await storeDocRef.get();
        const store = storeDoc.data();

        if (!store?.storeId && storeForUser) {
          functions.logger.info(
            'httpsOnCallChallengeToVerifyStoreAddress',
            "storeKyc is verified, but store isn't published",
            { structuredData: true },
          );
          await storeDocRef.create(storeForUser);
        }
      }

      return { storeAddressVerified };
    } catch (error) {
      functions.logger.warn('httpsOnCallChallengeToVerifyStoreAddress', error);
      // ロック中・確認コード誤り等のHttpsErrorは、状態を呼び出し側に伝えるためそのまま投げ直す
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError('unknown', "Can't verify store address");
    }
  });
