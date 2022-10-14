import { SymbolFacade } from '@nemtus/symbol-sdk-typescript/esm/facade/SymbolFacade';
import { Signature } from '@nemtus/symbol-sdk-typescript/esm/symbol/models';
import { Configuration, NetworkRoutesApi, NodeRoutesApi } from '@nemtus/symbol-sdk-openapi-generator-typescript-axios';

export const SYMBOL_NETWORK_NAME = process.env.REACT_APP_SYMBOL_PREFIX === 'N' ? 'メインネット' : 'テストネット';
export const SYMBOL_PREFIX = process.env.REACT_APP_SYMBOL_PREFIX ?? 'T';
export const SYMBOL_NODES = process.env.REACT_APP_SYMBOL_NODES ? process.env.REACT_APP_SYMBOL_NODES.split(',') : [];
export const selectRandomNode = () => {
  const randomIndex = Math.floor(Math.random() * SYMBOL_NODES.length);
  return SYMBOL_NODES[randomIndex];
};

export const SYMBOL_ADDRESS_REG_EXP_TESTNET = /^T[A-Z0-9]{38}$/;
export const SYMBOL_ADDRESS_REG_EXP_MAINNET = /^N[A-Z0-9]{38}$/;
export const SYMBOL_ADDRESS_REG_EXP =
  SYMBOL_PREFIX === 'N' ? SYMBOL_ADDRESS_REG_EXP_MAINNET : SYMBOL_ADDRESS_REG_EXP_TESTNET;

export const SYMBOL_BLOCK_EXPLORER_URL =
  process.env.REACT_APP_SYMBOL_PREFIX === 'N' ? 'https://symbol.fyi' : 'https://testnet.symbol.fyi';

export const createTransactionPayload = async (
  fromAddress: string,
  toAddress: string,
  amount: number,
  message: string,
): Promise<string | undefined> => {
  // epochAdjustment, networkCurrencyMosaicIdの取得のためNetworkRoutesApi.getNetworkPropertiesを呼び出す
  const nodeDomain = selectRandomNode();
  const configurationParameters = {
    basePath: `https://${nodeDomain}:3001`,
  };
  const configuration = new Configuration(configurationParameters);
  const networkRoutesApi = new NetworkRoutesApi(configuration);
  const networkPropertiesDTO = (await networkRoutesApi.getNetworkProperties()).data;

  // epochAdjustmentのレスポンス値は文字列でsが末尾に含まれるため除去してnumberに変換する
  const epochAdjustmentOriginal = networkPropertiesDTO.network.epochAdjustment;
  if (!epochAdjustmentOriginal) {
    return undefined;
  }
  const epochAdjustment = parseInt(epochAdjustmentOriginal.replace(/s/g, ''), 10);

  // networkCurrencyMosaicIdのレスポンス値はhex文字列で途中に'が含まれるため除去してBigIntに変換する
  const networkCurrencyMosaicIdOriginal = networkPropertiesDTO.chain.currencyMosaicId;
  if (!networkCurrencyMosaicIdOriginal) {
    return undefined;
  }
  const networkCurrencyMosaicId = BigInt(networkCurrencyMosaicIdOriginal.replace(/'/g, ''));

  // facadeの中に指定するtestnet等のネットワーク名を取得するためNetworkRoutesApi.getNetworkTypeを呼び出す
  const networkTypeResponse = await networkRoutesApi.getNetworkType();
  const networkTypeDTO = networkTypeResponse.data;
  if (!networkTypeDTO) {
    return undefined;
  }
  const networkName = networkTypeDTO.name;

  // ネットワーク名を指定してSDKを初期化
  const facade = new SymbolFacade(networkName);

  // deadlineの計算(2時間で設定しているが変更可能、ただし遠すぎるとエラーになる)
  const now = Date.now();
  const deadline = BigInt(now - epochAdjustment * 1000 + 2 * 60 * 60 * 1000);
  const amountBigInt = BigInt(Math.round(amount * 1000000));

  // メッセージの生成
  const messageUint8Array = new TextEncoder().encode(message);
  const plainMessage = [0, ...messageUint8Array];

  // トランザクションのデータ生成
  const transaction = facade.transactionFactory.create({
    type: 'transfer_transaction',
    deadline,
    recipientAddress: toAddress,
    mosaics: [{ mosaicId: networkCurrencyMosaicId, amount: amountBigInt }],
    message: plainMessage,
  });

  // 手数料設定 ... 送信先ノードの設定によるがノードのデフォルト設定値100なら基本的に足りないことはないと思う
  const feeMultiplier = 100;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  (transaction as any).fee.value = BigInt((transaction as any).size * feeMultiplier);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  const signature = new Signature(undefined);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
  const transactionPayload = (facade.transactionFactory.constructor as any).attachSignature(transaction, signature);

  return transactionPayload as string;
};

export const convertFromTransactionPayloadToTransactionUri = (
  transactionPayload: string | undefined,
): string | undefined => {
  if (!transactionPayload) {
    return undefined;
  }
  const json = JSON.parse(transactionPayload) as { payload: string };
  return `web+symbol://transaction?data=${json.payload}`;
};

export interface TransactionQrInterface {
  v: number;
  type: number;
  network_id: number;
  chain_id: string;
  data: {
    payload: string;
  };
}

export const createTransactionQrData = async (transactionPayload: string): Promise<TransactionQrInterface> => {
  const nodeDomain = selectRandomNode();
  const configurationParameters = {
    basePath: `https://${nodeDomain}:3001`,
  };
  const configuration = new Configuration(configurationParameters);
  const nodeRoutesApi = new NodeRoutesApi(configuration);
  const nodeInfoDTO = (await nodeRoutesApi.getNodeInfo()).data;
  const networkId = nodeInfoDTO.networkIdentifier;
  const chainId = nodeInfoDTO.networkGenerationHashSeed;
  const json = JSON.parse(transactionPayload) as { payload: string };
  const { payload } = json;
  return {
    v: 3,
    type: 3,
    network_id: networkId,
    chain_id: chainId,
    data: {
      payload,
    },
  };
};
