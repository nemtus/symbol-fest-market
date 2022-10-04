import * as functions from 'firebase-functions';
import { db, auth } from '../utils/firebase/admin';

export const itemOnUpdate = functions
  .runWith({ memory: '128MB' })
  .firestore.document('users/{userId}/stores/{storeId}/items/{itemId}')
  .onUpdate(async (data, context): Promise<void> => {
    functions.logger.debug('itemOnUpdate', data, { structuredData: true });
    functions.logger.debug('itemOnUpdate', context, { structuredData: true });
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
      const updatedItemData = data.after.data();
      await db.collection('stores').doc(storeId).collection('items').doc(itemId).set(updatedItemData, { merge: true });
    } catch (error) {
      functions.logger.warn('itemOnUpdate', error);
    }
  });
