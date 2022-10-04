// Note: Do not use this file
import { useEffect, useState } from 'react';
import { functions, httpsCallable } from '../configs/firebase';

export interface VerifyKycRequest {
  userId: string;
  storeId: string;
}

export interface VerifyKycResponse {
  emailVerified: boolean;
  userKycVerified: boolean;
  storeEmailVerified: boolean;
  storePhoneNumberVerified: boolean;
  storeAddressVerified: boolean;
  storeKycVerified: boolean;
}

export const httpsOnCallVerifyKyc = httpsCallable<VerifyKycRequest, VerifyKycResponse>(
  functions,
  'httpsOnCallVerifyKyc',
);

export const useVerifyKyc = (userId: string, storeId: string) => {
  const [emailVerified, setEmailVerified] = useState(false);
  const [userKycVerified, setUserKycVerified] = useState(false);
  const [storeEmailVerified, setStoreEmailVerified] = useState(false);
  const [storePhoneNumberVerified, setStorePhoneNumberVerified] = useState(false);
  const [storeAddressVerified, setStoreAddressVerified] = useState(false);
  const [storeKycVerified, setStoreKycVerified] = useState(false);
  const [kyc, setKyc] = useState<VerifyKycResponse>({
    emailVerified: false,
    userKycVerified: false,
    storeEmailVerified: false,
    storePhoneNumberVerified: false,
    storeAddressVerified: false,
    storeKycVerified: false,
  });

  httpsOnCallVerifyKyc({ userId, storeId })
    .then((res) => {
      console.log(res);
      setEmailVerified(res.data.emailVerified);
      setUserKycVerified(res.data.userKycVerified);
      setStoreEmailVerified(res.data.storeEmailVerified);
      setStorePhoneNumberVerified(res.data.storePhoneNumberVerified);
      setStoreAddressVerified(res.data.storeAddressVerified);
      setStoreKycVerified(res.data.storeKycVerified);
      setKyc({
        emailVerified,
        userKycVerified,
        storeEmailVerified,
        storePhoneNumberVerified,
        storeAddressVerified,
        storeKycVerified,
      });
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {});

  useEffect(() => {}, [
    setEmailVerified,
    setUserKycVerified,
    setStoreEmailVerified,
    setStorePhoneNumberVerified,
    setStoreAddressVerified,
    setStoreKycVerified,
  ]);

  return [kyc, setKyc];
};
