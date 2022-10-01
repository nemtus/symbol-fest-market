import * as functions from 'firebase-functions';
import { db } from '../../utils/firebase/admin';
import { fetchPriceInfoOnZaif, PriceInfo } from '../../utils/price/zaif';

export const priceZaifXymJpyPubSub = functions
  .runWith({ memory: '128MB' })
  .pubsub.schedule('*/5 * * * *')
  .onRun(async (context) => {
    functions.logger.debug('priceZaifXymJpyPubSub', context, { structuredData: true });
    try {
      const priceInfo: PriceInfo = await fetchPriceInfoOnZaif('xym', 'jpy');
      functions.logger.debug('priceZaifXymJpyPubSub', priceInfo, { structuredData: true });
      await db
        .collection('exchanges')
        .doc('zaif')
        .collection('tickers')
        .doc('xym')
        .collection('currencies')
        .doc('jpy')
        .set(priceInfo, { merge: true });
    } catch (error) {
      functions.logger.warn('priceZaifXymJpyPubSub', error, { structuredData: true });
    }
  });
