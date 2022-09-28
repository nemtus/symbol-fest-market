import * as functions from 'firebase-functions';
import { db } from '../utils/firebase/admin';

export const storeOnCreate = functions.firestore
  .document('users/{userId}/stores/{storeId}')
  .onCreate(async (data, context): Promise<void> => {
    functions.logger.debug('storeOnCreate', data, { structuredData: true });
    functions.logger.debug('storeOnCreate', context, { structuredData: true });
    const createdStoreData = data.data();
    try {
      await db.collection('stores').doc(data.id).set(createdStoreData, { merge: true });
    } catch (error) {
      functions.logger.warn('storeOnCreate', error);
    }
  });
