import * as functions from 'firebase-functions';
import { db, auth } from '../utils/firebase/admin';

export const itemOnCreate = functions
  .runWith({ memory: '128MB' })
  .firestore.document('users/{userId}/stores/{storeId}/items/{itemId}')
  .onCreate(async (data, context): Promise<void> => {
    functions.logger.debug('itemOnCreate', data, { structuredData: true });
    functions.logger.debug('itemOnCreate', context, { structuredData: true });
    try {
      const userId = context.params.userId as string;
      const storeId = context.params.storeId as string;
      const itemId = context.params.itemId as string;
      if (!userId) {
        functions.logger.debug('itemOnUpdate', 'userId is not defined', { structuredData: true });
        return;
      }
      if (!storeId) {
        functions.logger.debug('itemOnUpdate', 'storeId is not defined', { structuredData: true });
        return;
      }
      if (!itemId) {
        functions.logger.debug('itemOnUpdate', 'storeId is not defined', { structuredData: true });
        return;
      }
      const authUser = await auth.getUser(userId);
      if (userId !== authUser.uid) {
        functions.logger.debug('itemOnUpdate', 'User is not authenticated', { structuredData: true });
        return;
      }
      const { customClaims } = authUser;
      if (!customClaims?.userKycVerified || !customClaims?.storeKycVerified) {
        functions.logger.debug('itemOnUpdate', 'kyc is not verified', { structuredData: true });
        return;
      }
      const createdItemData = data.data();
      await db.collection('stores').doc(storeId).collection('items').doc(itemId).set(createdItemData, { merge: true });
    } catch (error) {
      functions.logger.warn('itemOnCreate', error);
    }
  });
