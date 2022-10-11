import * as functions from 'firebase-functions';
import { auth } from '../../utils/firebase/admin';

interface VerifyKycRequest {
  userId: string;
  storeId: string;
}

interface VerifyKycResponse {
  emailVerified: boolean;
  userKycVerified: boolean;
  storeEmailVerified: boolean;
  storePhoneNumberVerified: boolean;
  storeAddressVerified: boolean;
  storeKycVerified: boolean;
}

export const httpsOnCallVerifyKyc = functions
  .region('asia-northeast1')
  .runWith({ memory: '128MB', timeoutSeconds: 10 })
  .https.onCall(async (data: VerifyKycRequest, context): Promise<VerifyKycResponse> => {
    try {
      const userId = context.auth?.uid;
      if (!userId) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
      }
      const authUser = await auth.getUser(userId);
      if (userId !== authUser.uid) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
      }
      const { emailVerified, customClaims } = authUser;
      const userKycVerified = emailVerified;
      const storeEmailVerified = !!customClaims?.storeEmailVerified;
      const storePhoneNumberVerified = !!customClaims?.storePhoneNumberVerified;
      const storeAddressVerified = !!customClaims?.storeAddressVerified;
      const storeKycVerified = storeEmailVerified && storePhoneNumberVerified && storeAddressVerified;
      const kyc: VerifyKycResponse = {
        emailVerified,
        userKycVerified,
        storeEmailVerified,
        storePhoneNumberVerified,
        storeAddressVerified,
        storeKycVerified,
      };
      await auth.setCustomUserClaims(userId, kyc);
      return kyc;
    } catch (error) {
      functions.logger.warn('httpsOnCallVerifyKyc', error);
      throw new functions.https.HttpsError('unknown', "Can't verify kyc");
    }
  });
