/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as functions from 'firebase-functions';
import WebSocket from 'ws';
import { db, auth } from '../utils/firebase/admin';
import {
  fetchNetworkCurrencyMosaicId,
  searchConfirmedTransactions,
  searchUnconfirmedTransactions,
  selectRandomNode,
} from '../utils/symbol';

export const orderOnUpdate = functions
  .runWith({ memory: '128MB', timeoutSeconds: 540, failurePolicy: true })
  .firestore.document('users/{userId}/orders/{orderId}')
  .onUpdate(async (data, context): Promise<void> => {
    functions.logger.debug('orderOnUpdate', data);
    functions.logger.debug('orderOnUpdate', context);
    try {
      const userId = context.params.userId as string;
      const orderId = context.params.orderId as string;
      const storeId = data.after.data().storeId as string;
      const itemId = data.after.data().itemId as string;
      if (!userId) {
        functions.logger.debug('orderOnUpdate', 'userId is not defined');
        return;
      }
      if (!orderId) {
        functions.logger.debug('orderOnUpdate', 'storeId is not defined');
        return;
      }
      if (!storeId) {
        functions.logger.debug('orderOnUpdate', 'storeId is not defined');
        return;
      }
      if (!itemId) {
        functions.logger.debug('orderOnUpdate', 'itemId is not defined');
        return;
      }
      const authUser = await auth.getUser(userId);
      if (userId !== authUser.uid) {
        functions.logger.debug('orderOnUpdate', 'User is not authenticated');
        return;
      }
      const { customClaims } = authUser;
      if (!customClaims?.userKycVerified) {
        functions.logger.debug('orderOnUpdate', 'kyc is not verified');
        return;
      }

      const storeOrderDocRef = db
        .collection('users')
        .doc(storeId)
        .collection('stores')
        .doc(storeId)
        .collection('orders')
        .doc(orderId);
      await storeOrderDocRef.set(data.after.data(), { merge: true });

      const orderDocRef = db.collection('users').doc(userId).collection('orders').doc(orderId);

      const networkCurrencyMosaicId = await fetchNetworkCurrencyMosaicId();
      functions.logger.debug('orderOnUpdate', networkCurrencyMosaicId);
      if (!networkCurrencyMosaicId) {
        throw Error('networkCurrencyMosaicId is not defined');
      }

      const nodeDomain = selectRandomNode();
      functions.logger.debug('orderOnUpdate', nodeDomain);

      const ws = new WebSocket(`wss://${nodeDomain}:3001/ws`);

      const monitor =
        (data.before.data().orderStatus === 'WAITING_PRICE_INFO' && data.after.data().orderStatus === 'PENDING') ||
        (data.before.data().orderStatus === 'PENDING' && data.after.data().orderStatus === 'UNCONFIRMED');

      if (monitor) {
        ws.on('open', () => {
          functions.logger.debug('orderOnUpdate', 'connection open');
        });

        ws.on('close', () => {
          functions.logger.debug('orderOnUpdate', 'connection closed');
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ws.on('message', (msg: any) => {
          const res = JSON.parse(msg);
          functions.logger.debug('orderOnUpdate', res);

          if ('uid' in res) {
            functions.logger.debug('orderOnUpdate', { uid: res.uid });

            const unconfirmedBody = `{"uid": "${res.uid as string}", "subscribe": "unconfirmedAdded/${
              data.after.data().storeSymbolAddress as string
            }"}`;
            functions.logger.debug('orderOnUpdate', unconfirmedBody);
            ws.send(unconfirmedBody);

            const confirmedBody = `{"uid": "${res.uid as string}", "subscribe": "confirmedAdded/${
              data.after.data().storeSymbolAddress as string
            }"}`;
            functions.logger.debug('orderOnUpdate', confirmedBody);
            ws.send(confirmedBody);

            const blockBody = `{"uid": "${res.uid as string}", "subscribe": "block"}`;
            functions.logger.debug('orderOnUpdate', blockBody);
            ws.send(blockBody);
          }

          if (res.topic === `unconfirmedAdded/${data.after.data().storeSymbolAddress as string}`) {
            functions.logger.info('orderOnUpdate', res.data.transaction.mosaics[0]);
            functions.logger.debug('orderOnUpdate', res);
            const xymAmount = res.data.transaction.mosaics[0].amount as string;
            const xymMosaicId = res.data.transaction.mosaics[0].id as string;
            const orderTotalPriceCC = data.after.data().orderTotalPriceCC as number;
            const txMessageHexString = res.data.transaction.message as string;
            functions.logger.debug('orderOnUpdate', txMessageHexString);
            const txMessage = Buffer.from(txMessageHexString.slice(2), 'hex').toString('utf-8').trim();
            functions.logger.debug('orderOnUpdate', txMessage);
            if (
              xymAmount === Math.round(orderTotalPriceCC * 1000000).toString() &&
              networkCurrencyMosaicId === xymMosaicId &&
              orderId === txMessage
            ) {
              functions.logger.info('orderOnUpdate', 'unconfirmed transaction is found');
              functions.logger.debug('orderOnUpdate', { xymAmount, orderTotalPriceCC });
              const orderTxHash = res.data.meta.hash as string;
              const orderStatus = 'UNCONFIRMED';
              orderDocRef
                .set({ orderTxHash, orderStatus }, { merge: true })
                .then((orderDocRefResponse) => {
                  functions.logger.debug('orderOnUpdate', orderDocRefResponse);
                })
                .catch((err) => {
                  functions.logger.debug('orderOnUpdate', err);
                })
                .finally(() => {
                  ws.close();
                });
            }
          }

          if (res.topic === `confirmedAdded/${data.after.data().storeSymbolAddress as string}`) {
            functions.logger.info('orderOnUpdate', res.data.transaction.mosaics[0]);
            functions.logger.debug('orderOnUpdate', res);
            const xymAmount = res.data.transaction.mosaics[0].amount as string;
            const xymMosaicId = res.data.transaction.mosaics[0].id as string;
            const orderTotalPriceCC = data.after.data().orderTotalPriceCC as number;
            const txMessageHexString = res.data.transaction.message as string;
            functions.logger.debug('orderOnUpdate', txMessageHexString);
            const txMessage = Buffer.from(txMessageHexString.slice(2), 'hex').toString('utf-8').trim();
            functions.logger.debug('orderOnUpdate', txMessage);
            if (
              xymAmount === Math.round(orderTotalPriceCC * 1000000).toString() &&
              networkCurrencyMosaicId === xymMosaicId &&
              orderId === txMessage
            ) {
              functions.logger.info('orderOnUpdate', 'confirmed transaction is found');
              functions.logger.debug('orderOnUpdate', { xymAmount, orderTotalPriceCC });
              const orderTxHash = res.data.meta.hash as string;
              const orderStatus = 'CONFIRMED';
              orderDocRef
                .set({ orderTxHash, orderStatus }, { merge: true })
                .then((orderDocRefResponse) => {
                  functions.logger.debug('orderOnUpdate', orderDocRefResponse, { structuredData: true });
                })
                .catch((err) => {
                  functions.logger.debug('orderOnUpdate', err, { structuredData: true });
                })
                .finally(() => {
                  ws.close();
                });
            }
          }
        });
      }

      if (
        data.after.data().orderStatus === 'WAITING_PRICE_INFO' ||
        data.after.data().orderStatus === 'CONFIRMED' ||
        data.after.data().orderStatus === 'SENT'
      ) {
        return;
      }

      if (!data.after.data().orderTotalPriceCC) {
        return;
      }

      const recipientAddress = data.after.data().storeSymbolAddress as string;
      const transferMosaicId = networkCurrencyMosaicId;
      const fromTransferAmount = Math.round((data.after.data().orderTotalPriceCC as number) * 1000000).toString();
      const toTransferAmount = fromTransferAmount;
      const message = orderId;

      const unconfirmedTransactions = await searchUnconfirmedTransactions(
        recipientAddress,
        transferMosaicId,
        fromTransferAmount,
        toTransferAmount,
        message,
      );
      const confirmedTransactions = await searchConfirmedTransactions(
        recipientAddress,
        transferMosaicId,
        fromTransferAmount,
        toTransferAmount,
        message,
      );
      if (confirmedTransactions.length > 0) {
        functions.logger.info('orderOnUpdate', 'confirmed transaction is found with REST API');
        const orderTxHash = confirmedTransactions[0].meta.hash;
        const orderStatus = 'CONFIRMED';
        await orderDocRef.set({ orderTxHash, orderStatus }, { merge: true });
        return;
      }
      if (unconfirmedTransactions.length > 0) {
        functions.logger.info('orderOnUpdate', 'unconfirmed transaction is found with REST API');
        const orderTxHash = unconfirmedTransactions[0].meta.hash;
        const orderStatus = 'UNCONFIRMED';
        await orderDocRef.set({ orderTxHash, orderStatus }, { merge: true });
      }
    } catch (error) {
      functions.logger.warn('itemOnUpdate', error);
      if ((error as Error).message === 'networkCurrencyMosaicId is not defined') {
        throw error as Error;
      }
    }
  });
