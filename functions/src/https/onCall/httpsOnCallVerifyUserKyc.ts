import * as functions from 'firebase-functions';
import { auth } from '../../utils/firebase/admin';

interface VerifyUserKycRequest {
  userId: string;
}

interface VerifyUserKycResponse {
  emailVerified: boolean;
  userKycVerified: boolean;
}

export const httpsOnCallVerifyUserKyc = functions
  .region('asia-northeast1')
  .runWith({ memory: '128MB', timeoutSeconds: 10 })
  .https.onCall(async (data: VerifyUserKycRequest, context): Promise<VerifyUserKycResponse> => {
    try {
      const { userId } = data;
      if (typeof userId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'userId must be string');
      }
      const isAdmin = !!context.auth?.token?.admin;
      if (!context.auth?.uid && !isAdmin) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
      }
      if (context.auth?.uid) {
        const authUser = await auth.getUser(context.auth.uid);
        if ((userId !== context.auth.uid || userId !== authUser.uid) && !isAdmin) {
          throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
        }
      }
      const authUser = await auth.getUser(userId);
      const { emailVerified } = authUser;
      const userKycVerified = emailVerified;
      await auth.setCustomUserClaims(userId, { userKycVerified });
      return { emailVerified, userKycVerified };
    } catch (error) {
      functions.logger.warn('httpsOnCallVerifyUserEmail', error);
      throw new functions.https.HttpsError('unknown', "Can't verify user email");
    }
  });
