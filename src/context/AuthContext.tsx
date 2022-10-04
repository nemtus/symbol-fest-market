// Note: Do not use this file
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { User } from 'firebase/auth';
import { createContext, useState, useEffect } from 'react';
import { auth, onAuthStateChanged, functions, httpsCallable } from '../configs/firebase';

export interface AuthStatus {
  emailVerified: boolean;
  userKycVerified: boolean;
  storeEmailVerified: boolean;
  storePhoneNumberVerified: boolean;
  storeAddressVerified: boolean;
  storeKycVerified: boolean;
  user: User | null;
}

export const AuthStatusContext = createContext<AuthStatus>({
  emailVerified: false,
  userKycVerified: false,
  storeEmailVerified: false,
  storePhoneNumberVerified: false,
  storeAddressVerified: false,
  storeKycVerified: false,
  user: null,
});

interface VerifyUserKycRequest {
  userId: string;
  storeId: string;
}

interface VerifyUserKycResponse {
  emailVerified: boolean;
  userKycVerified: boolean;
  storeEmailVerified: false;
  storePhoneNumberVerified: false;
  storeAddressVerified: false;
  storeKycVerified: false;
}

const httpsOnCallVerifyUserKyc = httpsCallable<VerifyUserKycRequest, VerifyUserKycResponse>(
  functions,
  'httpsOnCallVerifyUserKyc',
);

export const AuthStatusProvider = (props: any) => {
  // const navigate = useNavigate();
  // const [emailVerified, setEmailVerified] = useState(false);
  // const [userKycVerified, setUserKycVerified] = useState(false);
  // const [storeEmailVerified, setStoreEmailVerified] = useState(false);
  // const [storePhoneNumberVerified, setStorePhoneNumberVerified] = useState(false);
  // const [storeAddressVerified, setStoreAddressVerified] = useState(false);
  // const [storeKycVerified, setStoreKycVerified] = useState(false);
  // const [user, setUser] = useState<User | null>(null);
  const [value, setValue] = useState<AuthStatus>({
    emailVerified: false,
    userKycVerified: false,
    storeEmailVerified: false,
    storePhoneNumberVerified: false,
    storeAddressVerified: false,
    storeKycVerified: false,
    user: null,
  });

  useEffect(() => {
    const unsubscribed = onAuthStateChanged(auth, (tempUser: User | null) => {
      if (!tempUser) {
        setValue({
          emailVerified: false,
          userKycVerified: false,
          storeEmailVerified: false,
          storePhoneNumberVerified: false,
          storeAddressVerified: false,
          storeKycVerified: false,
          user: null,
        });
        return;
      }

      httpsOnCallVerifyUserKyc({ userId: tempUser.uid, storeId: tempUser.uid })
        .then((res) => {
          console.log(res);
          const tempEmailVerified = !!res.data.emailVerified;
          const tempUserKycVerified = !!res.data.userKycVerified;
          const tempStoreEmailVerified = !!res.data.storeEmailVerified;
          const tempStorePhoneNumberVerified = !!res.data.storePhoneNumberVerified;
          const tempStoreAddressVerified = !!res.data.storeAddressVerified;
          const tempStoreKycVerified = !!res.data.storeKycVerified;
          // setEmailVerified(tempEmailVerified);
          // setUserKycVerified(tempUserKycVerified);
          // setStoreEmailVerified(tempStoreEmailVerified);
          // setStorePhoneNumberVerified(tempStorePhoneNumberVerified);
          // setStoreAddressVerified(tempStoreAddressVerified);
          // setStoreKycVerified(tempStoreKycVerified);
          // setUser(tempUser);
          setValue({
            emailVerified: tempEmailVerified,
            userKycVerified: tempUserKycVerified,
            storeEmailVerified: tempStoreEmailVerified,
            storePhoneNumberVerified: tempStorePhoneNumberVerified,
            storeAddressVerified: tempStoreAddressVerified,
            storeKycVerified: tempStoreKycVerified,
            user: tempUser,
          });

          // if (!tempEmailVerified) {
          //   throw Error(
          //     'ご登録のメールアドレス宛に届いている認証メールのリンクをクリックした後、再度お試しください。',
          //   );
          // }
        })
        .catch((err) => {
          console.error(err);
          // setEmailVerifiedError(err as Error);
        })
        .finally(() => {
          // setEmailVerifiedLoading(false);
        });
      // tempUser
      //   ?.getIdTokenResult(true)
      //   .then((idTokenResult) => {
      //     console.log(idTokenResult);
      //     if (!idTokenResult) {
      //       setUser(null);
      //     }
      //     const tempEmailVerified = !!idTokenResult.claims.email_verified;
      //     const tempUserKycVerified = !!idTokenResult.claims.userKycVerified;
      //     const tempStoreEmailVerified = !!idTokenResult.claims.storeEmailVerified;
      //     const tempStorePhoneNumberVerified = !!idTokenResult.claims.storePhoneNumberVerified;
      //     const tempStoreAddressVerified = !!idTokenResult.claims.storeAddressVerified;
      //     const tempStoreKycVerified = !!idTokenResult.claims.storeKycVerified;
      //     setEmailVerified(tempEmailVerified);
      //     setUserKycVerified(tempUserKycVerified);
      //     setStoreEmailVerified(tempStoreEmailVerified);
      //     setStorePhoneNumberVerified(tempStorePhoneNumberVerified);
      //     setStoreAddressVerified(tempStoreAddressVerified);
      //     setStoreKycVerified(tempStoreKycVerified);
      //     setUser(tempUser);
      //     setValue({
      //       emailVerified: tempEmailVerified,
      //       userKycVerified: tempUserKycVerified,
      //       storeEmailVerified: tempStoreEmailVerified,
      //       storePhoneNumberVerified: tempStorePhoneNumberVerified,
      //       storeAddressVerified: tempStoreAddressVerified,
      //       storeKycVerified: tempStoreKycVerified,
      //       user: tempUser,
      //     });
      //   })
      //   .catch((error) => {
      //     console.error(error);
      //   });
    });
    return () => {
      unsubscribed();
    };
  }, [
    // setEmailVerified,
    // setUserKycVerified,
    // setStoreEmailVerified,
    // setStorePhoneNumberVerified,
    // setStoreAddressVerified,
    // setStoreKycVerified,
    // setUser,
    setValue,
  ]);

  return <AuthStatusContext.Provider value={value}>{props.children}</AuthStatusContext.Provider>;
};
