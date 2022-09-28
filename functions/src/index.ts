import * as functions from 'firebase-functions';
import { storeOnCreate as storeOnCreateFunction } from './stores/storeOnCreate';
import { storeOnUpdate as storeOnUpdateFunction } from './stores/storeOnUpdate';
import { itemOnCreate as itemOnCreateFunction } from './items/itemOnCreate';
import { itemOnUpdate as itemOnUpdateFunction } from './items/itemOnUpdate';
import { priceZaifXymJpyPubSub as priceZaifXymJpyPubSubFunction } from './exchanges/zaif';

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from Firebase!');
});

export const storeOnCreate = storeOnCreateFunction;
export const storeOnUpdate = storeOnUpdateFunction;
export const itemOnCreate = itemOnCreateFunction;
export const itemOnUpdate = itemOnUpdateFunction;
export const priceZaifXymJpyPubSub = priceZaifXymJpyPubSubFunction;
