import * as functions from 'firebase-functions';
import { db, auth } from '../utils/firebase/admin';

export const storeOnUpdate = functions
  .runWith({ memory: '128MB' })
  .firestore.document('users/{userId}/stores/{storeId}')
  .onUpdate(async (data, context): Promise<void> => {
    functions.logger.debug('storeOnUpdate', data, { structuredData: true });
    functions.logger.debug('storeOnUpdate', context, { structuredData: true });
    try {
      const { userId, storeId } = context.params;
      if (!userId) {
        functions.logger.debug('storeOnUpdate', 'userId is not defined', { structuredData: true });
        return;
      }
      if (!storeId) {
        functions.logger.debug('storeOnUpdate', 'storeId is not defined', { structuredData: true });
        return;
      }
      const authUser = await auth.getUser(userId as string);
      if (userId !== authUser.uid) {
        functions.logger.debug('storeOnUpdate', 'User is not authenticated', { structuredData: true });
        return;
      }
      const { customClaims } = authUser;
      if (!customClaims?.userKycVerified || !customClaims?.storeKycVerified) {
        functions.logger.debug('storeOnUpdate', "storeKyc isn't verified", { structuredData: true });
        return;
      }
      const updatedStoreData = data.after.data();
      delete updatedStoreData.storePhoneNumber;
      await db.collection('stores').doc(data.after.id).set(updatedStoreData, { merge: true });
    } catch (error) {
      functions.logger.warn('storeOnUpdate', error);
    }
  });
