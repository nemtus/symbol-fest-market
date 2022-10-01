import * as functions from 'firebase-functions';
import { db } from '../utils/firebase/admin';

export const storeOnCreate = functions
  .runWith({ memory: '128MB' })
  .firestore.document('users/{userId}/stores/{storeId}')
  .onCreate(async (data, context): Promise<void> => {
    functions.logger.debug('storeOnCreate', data, { structuredData: true });
    functions.logger.debug('storeOnCreate', context, { structuredData: true });
    try {
      const createdStoreData = data.data();
      delete createdStoreData.storePhoneNumber;
      await db.collection('stores').doc(data.id).set(createdStoreData, { merge: true });
    } catch (error) {
      functions.logger.warn('storeOnCreate', error);
    }
  });
