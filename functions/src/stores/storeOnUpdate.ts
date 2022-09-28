import * as functions from 'firebase-functions';
import { db } from '../utils/firebase/admin';

export const storeOnUpdate = functions.firestore
  .document('users/{userId}/stores/{storeId}')
  .onUpdate(async (data, context): Promise<void> => {
    functions.logger.debug('storeOnUpdate', data, { structuredData: true });
    functions.logger.debug('storeOnUpdate', context, { structuredData: true });
    const updatedStoreData = data.after.data();
    try {
      await db.collection('stores').doc(data.after.id).set(updatedStoreData, { merge: true });
    } catch (error) {
      functions.logger.warn('storeOnUpdate', error);
    }
  });
