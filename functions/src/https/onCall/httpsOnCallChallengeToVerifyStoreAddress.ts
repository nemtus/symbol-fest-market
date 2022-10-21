import * as functions from 'firebase-functions';
import { db, auth } from '../../utils/firebase/admin';

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
      const storeKycSecretDoc = await storeKycSecretDocRef.get();
      const storeAddressSecret = storeKycSecretDoc.data()?.storeAddressSecret as string;
      if (challengedStoreAddressSecret !== storeAddressSecret) {
        throw new functions.https.HttpsError('unauthenticated', 'Wrong secret');
      }

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
      throw new functions.https.HttpsError('unknown', "Can't verify store address");
    }
  });
