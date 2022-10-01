import * as functions from 'firebase-functions';
import { db } from '../utils/firebase/admin';

export const itemOnUpdate = functions
  .runWith({ memory: '128MB' })
  .firestore.document('users/{userId}/stores/{storeId}/items/{itemId}')
  .onUpdate(async (data, context): Promise<void> => {
    functions.logger.debug('itemOnUpdate', data, { structuredData: true });
    functions.logger.debug('itemOnUpdate', context, { structuredData: true });
    try {
      const updatedItemData = data.after.data();
      const storeId = context.params.storeId as string;
      const itemId = data.after.id;
      await db.collection('stores').doc(storeId).collection('items').doc(itemId).set(updatedItemData, { merge: true });
    } catch (error) {
      functions.logger.warn('itemOnUpdate', error);
    }
  });
