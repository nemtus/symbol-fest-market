/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as functions from 'firebase-functions';
import { db, auth } from '../../utils/firebase/admin';

interface VerifyStoreEmailRequest {
  userId: string;
  storeId: string;
  storeEmailSecret: string;
}

interface VerifyStoreEmailResponse {
  storeEmailVerified: boolean;
}

export const httpsOnCallChallengeToVerifyStoreEmail = functions
  .region('asia-northeast1')
  .runWith({ memory: '128MB', timeoutSeconds: 10 })
  .https.onCall(async (data: VerifyStoreEmailRequest, context): Promise<VerifyStoreEmailResponse> => {
    try {
      const userId = context.auth?.uid;
      if (!userId) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
      }
      const authUser = await auth.getUser(userId);
      if (userId !== authUser.uid) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
      }
      const challengedStoreEmailSecret = data.storeEmailSecret;
      if (typeof challengedStoreEmailSecret !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid store email secret');
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
      const storeEmailSecret = storeKycSecretDoc.data()?.storeEmailSecret;
      if (challengedStoreEmailSecret !== storeEmailSecret) {
        throw new functions.https.HttpsError('unauthenticated', 'Wrong secret');
      }

      const { customClaims } = authUser;
      const storeEmailVerified = true;
      const storePhoneNumberVerified = !!customClaims?.storePhoneNumberVerified;
      const storeAddressVerified = !!customClaims?.storeAddressVerified;
      const storeKycVerified = storeEmailVerified || storePhoneNumberVerified || storeAddressVerified;
      await auth.setCustomUserClaims(userId, { storeEmailVerified, storeKycVerified });
      return { storeEmailVerified };
    } catch (error) {
      functions.logger.warn('httpsOnCallChallengeToVerifyStoreEmail', error);
      throw new functions.https.HttpsError('unknown', "Can't verify store email");
    }
  });
