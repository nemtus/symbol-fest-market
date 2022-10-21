import * as functions from 'firebase-functions';
import { db, auth } from '../../utils/firebase/admin';

interface VerifyStorePhoneNumberRequest {
  userId: string;
  storeId: string;
  storePhoneNumberSecret: string;
}

interface VerifyStorePhoneNumberResponse {
  storePhoneNumberVerified: boolean;
}

interface KycStatus {
  emailVerified: boolean;
  userKycVerified: boolean;
  storeEmailVerified: boolean;
  storePhoneNumberVerified: boolean;
  storeAddressVerified: boolean;
  storeKycVerified: boolean;
}

export const httpsOnCallChallengeToVerifyStorePhoneNumber = functions
  .region('asia-northeast1')
  .runWith({ memory: '128MB', timeoutSeconds: 10 })
  .https.onCall(async (data: VerifyStorePhoneNumberRequest, context): Promise<VerifyStorePhoneNumberResponse> => {
    try {
      const userId = context.auth?.uid;
      if (!userId) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
      }
      const authUser = await auth.getUser(userId);
      if (userId !== authUser.uid) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
      }
      const challengedStorePhoneNumberSecret = data.storePhoneNumberSecret;
      if (typeof challengedStorePhoneNumberSecret !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid store phone number secret');
      }
      const storeId = userId;
      const storeKycSecretDocRef = db
        .collection('users')
        .doc(userId)
        .collection('stores')
        .doc(storeId)
        .collection('kyc')
        .doc('secret');
      const storeKycSecretDoc = await storeKycSecretDocRef.get();
      const storePhoneNumberSecret = storeKycSecretDoc.data()?.storePhoneNumberSecret as string;
      if (challengedStorePhoneNumberSecret !== storePhoneNumberSecret) {
        throw new functions.https.HttpsError('unauthenticated', 'Wrong secret');
      }

      const { emailVerified, customClaims } = authUser;
      const userKycVerified = emailVerified;
      const storePhoneNumberVerified = true;
      const storeEmailVerified = !!customClaims?.storeEmailVerified;
      const storeAddressVerified = !!customClaims?.storeAddressVerified;
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
            'httpsOnCallChallengeToVerifyStorePhoneNumber',
            "storeKyc is verified, but store isn't published",
            { structuredData: true },
          );
          await storeDocRef.create(storeForUser);
        }
      }

      return { storePhoneNumberVerified };
    } catch (error) {
      functions.logger.warn('httpsOnCallChallengeToVerifyStorePhoneNumber', error);
      throw new functions.https.HttpsError('unknown', "Can't verify store phone number");
    }
  });
