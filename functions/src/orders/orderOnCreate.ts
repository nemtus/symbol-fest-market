import * as functions from 'firebase-functions';
import { db, auth } from '../utils/firebase/admin';

export const orderOnCreate = functions
  .runWith({ memory: '128MB' })
  .firestore.document('users/{userId}/orders/{orderId}')
  .onCreate(async (data, context): Promise<void> => {
    functions.logger.debug('orderOnCreate', data, { structuredData: true });
    functions.logger.debug('orderOnCreate', context, { structuredData: true });
    try {
      const userId = context.params.userId as string;
      const orderId = context.params.orderId as string;
      const storeId = data.data().storeId as string;
      const itemId = data.data().itemId as string;
      if (!userId) {
        functions.logger.debug('orderOnCreate', 'userId is not defined', { structuredData: true });
        return;
      }
      if (!orderId) {
        functions.logger.debug('orderOnCreate', 'storeId is not defined', { structuredData: true });
        return;
      }
      if (!storeId) {
        functions.logger.debug('orderOnCreate', 'storeId is not defined', { structuredData: true });
        return;
      }
      if (!itemId) {
        functions.logger.debug('orderOnCreate', 'itemId is not defined', { structuredData: true });
        return;
      }
      const authUser = await auth.getUser(userId);
      if (userId !== authUser.uid) {
        functions.logger.debug('orderOnCreate', 'User is not authenticated', { structuredData: true });
        return;
      }
      const { customClaims } = authUser;
      if (!customClaims?.userKycVerified) {
        functions.logger.debug('orderOnCreate', 'kyc is not verified', { structuredData: true });
        return;
      }

      const storeOrderDocRef = db
        .collection('users')
        .doc(storeId)
        .collection('stores')
        .doc(storeId)
        .collection('orders')
        .doc(orderId);
      await storeOrderDocRef.set(data.data(), { merge: true });

      const orderDocRef = db.collection('users').doc(userId).collection('orders').doc(orderId);
      await orderDocRef.set({ orderId, orderStatus: 'WAITING_PRICE_INFO' }, { merge: true });

      const priceDocRef = db
        .collection('exchanges')
        .doc('zaif')
        .collection('tickers')
        .doc('xym')
        .collection('currencies')
        .doc('jpy');
      const priceDocSnapshot = await priceDocRef.get();
      const xymPrice = priceDocSnapshot.exists ? (priceDocSnapshot.data()?.vwap as number) : 5;
      functions.logger.debug('orderOnCreate', { xymPrice }, { structuredData: true });
      const itemPrice = data.data().itemPrice as number;
      const orderAmount = data.data().orderAmount as number;
      const orderTotalPrice = itemPrice * orderAmount;
      const orderTotalPriceUnit = data.data().itemPriceUnit as string;
      const orderTotalPriceCC = Math.round((orderTotalPrice / xymPrice) * 1000000) / 1000000;
      const orderTotalPriceCCUnit = 'XYM';
      const orderStatus = 'PENDING';
      await orderDocRef.set(
        { orderTotalPrice, orderTotalPriceUnit, orderTotalPriceCC, orderTotalPriceCCUnit, orderStatus },
        { merge: true },
      );
    } catch (error) {
      functions.logger.warn('itemOnCreate', error);
    }
  });
