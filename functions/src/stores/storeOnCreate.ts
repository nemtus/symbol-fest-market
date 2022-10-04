import * as functions from 'firebase-functions';
import { db, auth } from '../utils/firebase/admin';

export const storeOnCreate = functions
  .runWith({ memory: '128MB' })
  .firestore.document('users/{userId}/stores/{storeId}')
  .onCreate(async (data, context): Promise<void> => {
    functions.logger.debug('storeOnCreate', data, { structuredData: true });
    functions.logger.debug('storeOnCreate', context, { structuredData: true });
    try {
      const { userId, storeId } = context.params;
      if (!userId) {
        functions.logger.debug('storeOnCreate', 'userId is not defined', { structuredData: true });
        return;
      }
      if (!storeId) {
        functions.logger.debug('storeOnCreate', 'storeId is not defined', { structuredData: true });
        return;
      }
      const authUser = await auth.getUser(userId as string);
      if (userId !== authUser.uid) {
        functions.logger.debug('storeOnCreate', 'User is not authenticated', { structuredData: true });
        return;
      }
      const { customClaims } = authUser;
      if (!customClaims?.userKycVerified || !customClaims?.storeKycVerified) {
        functions.logger.debug('storeOnCreate', "storeKyc isn't verified", { structuredData: true });
        return;
      }
      const createdStoreData = data.data();
      delete createdStoreData.storePhoneNumber;
      await db.collection('stores').doc(data.id).set(createdStoreData, { merge: true });
    } catch (error) {
      functions.logger.warn('storeOnCreate', error);
    }
  });
