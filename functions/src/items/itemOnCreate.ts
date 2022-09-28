import * as functions from 'firebase-functions';
import { db } from '../utils/firebase/admin';

export const itemOnCreate = functions.firestore
  .document('users/{userId}/stores/{storeId}/items/{itemId}')
  .onCreate(async (data, context): Promise<void> => {
    functions.logger.debug('itemOnCreate', data, { structuredData: true });
    functions.logger.debug('itemOnCreate', context, { structuredData: true });
    const createdItemData = data.data();
    const storeId = context.params.storeId as string;
    const itemId = data.id;
    try {
      await db.collection('stores').doc(storeId).collection('items').doc(itemId).set(createdItemData, { merge: true });
      await db.collection('items').doc(data.id).set(createdItemData, { merge: true });
    } catch (error) {
      functions.logger.warn('itemOnCreate', error);
    }
  });
