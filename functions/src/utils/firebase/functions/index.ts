import * as functions from 'firebase-functions';

export const defaultFunctions = functions.region('asia-northeast1').runWith({ memory: '128MB', timeoutSeconds: 60 });
export const defaultFunctionsLogger = functions.logger;
