/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as functions from 'firebase-functions';
import { auth } from '../../utils/firebase/admin';

interface VerifyStoreKycRequest {
  userId: string;
  storeId: string;
}

interface VerifyStoreKycResponse {
  storeEmailVerified: boolean;
  storePhoneNumberVerified: boolean;
  storeAddressVerified: boolean;
  storeKycVerified: boolean;
}

export const httpsOnCallVerifyStoreKyc = functions
  .region('asia-northeast1')
  .runWith({ memory: '128MB', timeoutSeconds: 10 })
  .https.onCall(async (data: VerifyStoreKycRequest, context): Promise<VerifyStoreKycResponse> => {
    try {
      const userId = context.auth?.uid;
      if (!userId) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
      }
      const authUser = await auth.getUser(userId);
      if (userId !== authUser.uid) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
      }
      const { customClaims } = authUser;
      const storeEmailVerified = !!customClaims?.storeEmailVerified;
      const storePhoneNumberVerified = !!customClaims?.storePhoneNumberVerified;
      const storeAddressVerified = !!customClaims?.storeAddressVerified;
      const storeKycVerified = storeEmailVerified || storePhoneNumberVerified || storeAddressVerified;
      const storeKyc: VerifyStoreKycResponse = {
        storeEmailVerified,
        storePhoneNumberVerified,
        storeAddressVerified,
        storeKycVerified,
      };
      await auth.setCustomUserClaims(userId, storeKyc);
      return storeKyc;
    } catch (error) {
      functions.logger.warn('httpsOnCallChallengeToVerifyStoreEmail', error);
      throw new functions.https.HttpsError('unknown', "Can't verify store email");
    }
  });
