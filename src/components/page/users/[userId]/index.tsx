/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocument } from 'react-firebase-hooks/firestore';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Container, Stack, IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useEffect, useState } from 'react';
import db, { auth, doc, httpsCallable, functions } from '../../../../configs/firebase';
import LoadingOverlay from '../../../ui/LoadingOverlay';
import ErrorDialog from '../../../ui/ErrorDialog';

// interface UserInterface {
//   userId: string;
//   email: string;
//   name: string;
//   phoneNumber: string;
//   zipCode: string;
//   address1: string;
//   address2: string;
//   symbolAddress: string;
// }

interface VerifyKycRequest {
  userId: string;
  storeId: string;
}

interface VerifyKycResponse {
  emailVerified: boolean;
  userKycVerified: boolean;
  storeEmailVerified: boolean;
  storePhoneNumberVerified: boolean;
  storeAddressVerified: boolean;
  storeKycVerified: boolean;
}

const httpsOnCallVerifyKyc = httpsCallable<VerifyKycRequest, VerifyKycResponse>(functions, 'httpsOnCallVerifyKyc');

const User = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, loading, error] = useAuthState(auth);
  const [userDoc, userDocLoading, userDocError] = useDocument(doc(db, 'users', userId || ''), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
  const [storeDoc, storeDocLoading, storeDocError] = useDocument(
    doc(db, 'users', userId ?? '', 'stores', userId ?? ''),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    },
  );
  const [storeExists, setStoreExists] = useState(false);
  const [kycStatus, setKycStatus] = useState<VerifyKycResponse>({
    emailVerified: false,
    userKycVerified: false,
    storeEmailVerified: false,
    storePhoneNumberVerified: false,
    storeAddressVerified: false,
    storeKycVerified: false,
  });
  const [kycStatusLoading, setKycStatusLoading] = useState(false);
  const [kycStatusError, setKycStatusError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (loading && userDocLoading && storeDocLoading) {
      return;
    }
    if (!(user && userId && userId === user.uid)) {
      navigate('/auth/sign-in/');
      return;
    }
    const isExists = !!storeDoc?.exists();
    setStoreExists(isExists);
    setKycStatusLoading(true);
    httpsOnCallVerifyKyc({ userId, storeId: userId })
      .then((res) => {
        console.log(res);
        setKycStatus(res.data);
        if (!res.data.userKycVerified) {
          navigate(`users/${userId}/verify-user-email`);
        }
      })
      .catch((err) => {
        setKycStatusError(err as Error);
      })
      .finally(() => {
        setKycStatusLoading(false);
      });
  }, [
    userId,
    user,
    loading,
    userDocLoading,
    storeDoc,
    storeDocLoading,
    setStoreExists,
    setKycStatus,
    setKycStatusLoading,
    setKycStatusError,
    navigate,
  ]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText((userDoc?.data()?.symbolAddress as string) || '');
  };

  const handleClick = () => {
    if (!userId) {
      throw Error('Invalid userId');
    }
    navigate(`/users/${userId}/update`, {
      state: {
        name: userDoc?.data()?.name ?? '',
        phoneNumber: userDoc?.data()?.phoneNumber ?? '',
        zipCode: userDoc?.data()?.zipCode ?? '',
        address1: userDoc?.data()?.address1 ?? '',
        address2: userDoc?.data()?.address2 ?? '',
        symbolAddress: userDoc?.data()?.symbolAddress ?? '',
      },
    });
  };

  const handleStoreCreate = () => {
    if (!userId) {
      throw Error('Invalid userId');
    }
    const storeId = userId;
    navigate(`/users/${userId}/stores/${storeId}/create`);
  };

  const handleStore = () => {
    if (!userId) {
      throw Error('Invalid userId');
    }
    const storeId = userId;
    navigate(`/users/${userId}/stores/${storeId}`);
  };

  // if (!userId || !user?.uid || userId !== user?.uid) {
  //   return null;
  // }

  return (
    <>
      <Container maxWidth="sm">
        <h2>プロフィール</h2>
        <Stack>
          <div>
            <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
              <h3>メールアドレス</h3>
              {kycStatus.emailVerified ? (
                <CheckIcon color="success" />
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to={`/users/${userId ?? ''}/verify-user-email`}
                >
                  確認
                </Button>
              )}
            </Box>
            <div>{userDoc?.data()?.email}</div>
          </div>
          <div>
            <h3>氏名</h3>
            <div>{userDoc?.data()?.name}</div>
          </div>
          <div>
            <h3>電話番号</h3>
            <div>{userDoc?.data()?.phoneNumber}</div>
          </div>
          <div>
            <h3>郵便番号</h3>
            <div>{userDoc?.data()?.zipCode}</div>
          </div>
          <div>
            <h3>住所(都道府県市区町村)</h3>
            <div>{userDoc?.data()?.address1}</div>
          </div>
          <div>
            <h3>住所(番地・建物名・部屋番号)</h3>
            <div>{userDoc?.data()?.address2}</div>
          </div>
          <div>
            <h3>Symbolアドレス(テストネット)</h3>
            <div style={{ fontSize: 12 }}>
              {userDoc?.data()?.symbolAddress}
              <IconButton
                onClick={async () => {
                  await handleCopy();
                }}
              >
                <ContentCopyIcon />
              </IconButton>
            </div>
          </div>
          <Button color="primary" variant="contained" size="large" onClick={handleClick}>
            編集
          </Button>
          <h2>店舗</h2>
          <Stack>
            {storeExists ? (
              <Button color="primary" variant="contained" size="large" onClick={handleStore}>
                店舗情報表示
              </Button>
            ) : (
              <Button color="primary" variant="contained" size="large" onClick={handleStoreCreate}>
                店舗情報登録
              </Button>
            )}
          </Stack>
        </Stack>
      </Container>
      <LoadingOverlay open={loading || userDocLoading || storeDocLoading || kycStatusLoading} />
      <ErrorDialog open={!!error} error={error} />
      <ErrorDialog open={!!userDocError} error={userDocError} />
      <ErrorDialog open={!!storeDocError} error={storeDocError} />
      <ErrorDialog open={!!kycStatusError} error={kycStatusError} />
    </>
  );
};

export default User;
