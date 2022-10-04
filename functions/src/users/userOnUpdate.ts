import * as functions from 'firebase-functions';
import { auth } from '../utils/firebase/admin';

export const userOnUpdate = functions
  .runWith({ memory: '128MB' })
  .firestore.document('users/{userId}')
  .onUpdate(async (data, context): Promise<void> => {
    functions.logger.debug('userOnUpdate', data, { structuredData: true });
    functions.logger.debug('userOnUpdate', context, { structuredData: true });
    try {
      const userId = context.params.userId as string;
      const authUser = await auth.getUser(userId);
      const { emailVerified, customClaims } = authUser;
      const userKycVerified = emailVerified;
      const storeEmailVerified = !!customClaims?.storeEmailVerified;
      const storePhoneNumberVerified = !!customClaims?.storePhoneNumberVerified;
      const storeAddressVerified = !!customClaims?.storeAddressVerified;
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
    } catch (error) {
      functions.logger.warn('itemOnCreate', error);
    }
  });
