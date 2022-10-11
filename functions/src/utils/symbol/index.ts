import {
  Configuration,
  NetworkRoutesApi,
  TransactionInfoDTO,
  TransactionRoutesApi,
} from '@nemtus/symbol-sdk-openapi-generator-typescript-axios';

export const SYMBOL_NODES = process.env.SYMBOL_NODES ? process.env.SYMBOL_NODES.split(',') : [];
export const selectRandomNode = () => {
  const randomIndex = Math.floor(Math.random() * SYMBOL_NODES.length);
  return SYMBOL_NODES[randomIndex];
};
export const fetchNetworkCurrencyMosaicId = async (): Promise<string | undefined> => {
  const nodeDomain = selectRandomNode();
  const configurationParameters = {
    basePath: `https://${nodeDomain}:3001`,
  };
  const configuration = new Configuration(configurationParameters);
  const networkRoutesApi = new NetworkRoutesApi(configuration);
  const networkPropertiesDTO = (await networkRoutesApi.getNetworkProperties()).data;
  if (!networkPropertiesDTO) {
    return undefined;
  }
  const networkCurrencyMosaicId = networkPropertiesDTO.chain.currencyMosaicId
    ?.replace(/'/g, '')
    .replace(/0x/g, '')
    .replace(/0X/g, '')
    .toUpperCase();
  return networkCurrencyMosaicId;
};
export const searchUnconfirmedTransactions = async (
  recipientAddress: string,
  transferMosaicId: string,
  fromTransferAmount: string,
  toTransferAmount: string,
  message: string,
): Promise<TransactionInfoDTO[]> => {
  try {
    const nodeDomain = selectRandomNode();
    const configurationParameters = {
      basePath: `https://${nodeDomain}:3001`,
    };
    const configuration = new Configuration(configurationParameters);
    const transactionRoutesApi = new TransactionRoutesApi(configuration);
    const unconfirmedTransactionsWithPage = await transactionRoutesApi.searchUnconfirmedTransactions({
      recipientAddress,
      transferMosaicId,
      fromTransferAmount,
      toTransferAmount,
    });
    const unconfirmedTransactions = unconfirmedTransactionsWithPage.data.data;
    const targetUnconfirmedTransactions = unconfirmedTransactions.filter((transactionInfoDTO: TransactionInfoDTO) => {
      const isTransferTransaction = transactionInfoDTO.transaction.type === 16724;
      const transactionMessage = Buffer.from((transactionInfoDTO.transaction.message ?? '').slice(2), 'hex').toString();
      const isTargetMessage = transactionMessage === message;
      return isTransferTransaction && isTargetMessage;
    });
    return targetUnconfirmedTransactions;
  } catch (error) {
    return [];
  }
};
export const searchConfirmedTransactions = async (
  recipientAddress: string,
  transferMosaicId: string,
  fromTransferAmount: string,
  toTransferAmount: string,
  message: string,
): Promise<TransactionInfoDTO[]> => {
  try {
    const nodeDomain = selectRandomNode();
    const configurationParameters = {
      basePath: `https://${nodeDomain}:3001`,
    };
    const configuration = new Configuration(configurationParameters);
    const transactionRoutesApi = new TransactionRoutesApi(configuration);
    const confirmedTransactionsWithPage = await transactionRoutesApi.searchConfirmedTransactions({
      recipientAddress,
      transferMosaicId,
      fromTransferAmount,
      toTransferAmount,
    });
    const confirmedTransactions = confirmedTransactionsWithPage.data.data;
    const targetConfirmedTransactions = confirmedTransactions.filter((transactionInfoDTO: TransactionInfoDTO) => {
      const isTransferTransaction = transactionInfoDTO.transaction.type === 16724;
      const transactionMessage = Buffer.from((transactionInfoDTO.transaction.message ?? '').slice(2), 'hex').toString();
      const isTargetMessage = transactionMessage === message;
      return isTransferTransaction && isTargetMessage;
    });
    return targetConfirmedTransactions;
  } catch (error) {
    return [];
  }
};
