/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
      const storePhoneNumberSecret = storeKycSecretDoc.data()?.storePhoneNumberSecret;
      if (challengedStorePhoneNumberSecret !== storePhoneNumberSecret) {
        throw new functions.https.HttpsError('unauthenticated', 'Wrong secret');
      }

      const { customClaims } = authUser;
      const storePhoneNumberVerified = true;
      const storeEmailVerified = !!customClaims?.storeEmailVerified;
      const storeAddressVerified = !!customClaims?.storeAddressVerified;
      const storeKycVerified = storeEmailVerified || storePhoneNumberVerified || storeAddressVerified;
      await auth.setCustomUserClaims(userId, { storePhoneNumberVerified, storeKycVerified });
      return { storePhoneNumberVerified };
    } catch (error) {
      functions.logger.warn('httpsOnCallChallengeToVerifyStorePhoneNumber', error);
      throw new functions.https.HttpsError('unknown', "Can't verify store phone number");
    }
  });
