import * as functions from 'firebase-functions';
import { db, auth } from '../utils/firebase/admin';
import { createRandom } from '../utils/random';

export const userOnCreate = functions
  .runWith({ memory: '128MB' })
  .firestore.document('users/{userId}')
  .onCreate(async (data, context): Promise<void> => {
    functions.logger.debug('userOnCreate', data, { structuredData: true });
    functions.logger.debug('userOnCreate', context, { structuredData: true });
    try {
      const userId = context.params.userId as string;
      const storeId = userId;
      const authUser = await auth.getUser(userId);
      const { emailVerified } = authUser;
      const userKycVerified = emailVerified;
      const storeEmailVerified = false;
      const storePhoneNumberVerified = false;
      const storeAddressVerified = false;
      const storeKycVerified = storeEmailVerified && storePhoneNumberVerified && storeAddressVerified;
      const kycStatus = {
        emailVerified,
        userKycVerified,
        storeKycVerified,
        storeEmailVerified,
        storePhoneNumberVerified,
        storeAddressVerified,
      };
      await auth.setCustomUserClaims(userId, kycStatus);

      const storeKycSecretDocRef = db
        .collection('users')
        .doc(userId)
        .collection('stores')
        .doc(storeId)
        .collection('kyc')
        .doc('secret');
      const existSecret = (await storeKycSecretDocRef.get()).exists;
      if (existSecret) {
        functions.logger.debug('userOnCreate', 'kyc secret is already created');
        return;
      }
      const storeEmailSecret = createRandom(6);
      const storePhoneNumberSecret = createRandom(6);
      const storeAddressSecret = createRandom(6);
      const storeKycSecret = { storeEmailSecret, storePhoneNumberSecret, storeAddressSecret };
      await storeKycSecretDocRef.set(storeKycSecret, { merge: true });

      // Note: メール送信機能は未実装
      // await db
      //   .collection('mail')
      //   .add({
      //     to: authUser.email,
      //     message: {
      //       subject: 'ユーザー登録完了のお知らせ',
      //       text: 'ユーザー登録が完了しました。',
      //     },
      //   })
      //   .then(() => {
      //     functions.logger.debug('メール送信完了');
      //   });
    } catch (error) {
      functions.logger.warn('itemOnCreate', error);
    }
  });
