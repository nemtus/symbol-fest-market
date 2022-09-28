import * as functions from 'firebase-functions';
import axios from 'axios';

export interface PriceInfo {
  last: number;
  high: number;
  low: number;
  vwap: number;
  volume: number;
  bid: number;
  ask: number;
}

export const fetchPriceInfoOnZaif = async (ticker: string, currency: string) => {
  const url = `https://api.zaif.jp/api/1/ticker/${ticker}_${currency}`;
  functions.logger.debug('fetchPriceInfoOnZaif', url, { structuredData: true });
  const response = await axios.get<PriceInfo>(url);
  functions.logger.debug('fetchPriceInfoOnZaif', response, { structuredData: true });
  return response.data;
};
