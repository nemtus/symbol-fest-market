/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocument } from 'react-firebase-hooks/firestore';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Container, Stack } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useState, useEffect } from 'react';
import db, { auth, doc, functions, httpsCallable } from '../../../../../../configs/firebase';
import { SYMBOL_NETWORK_NAME } from '../../../../../../configs/symbol';
import LoadingOverlay from '../../../../../ui/LoadingOverlay';
import ErrorDialog from '../../../../../ui/ErrorDialog';

// interface StoreCreateFormInput {
//   storeName: string;
//   storeEmail: string;
//   storePhoneNumber: string;
//   storeZipCode: string;
//   storeAddress1: string;
//   storeAddress2: string;
//   storeUrl: string;
//   storeSymbolAddress: string;
//   storeDescription: string;
//   storeImageFile: string;
//   storeCoverImageFile: string;
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

const Store = () => {
  const navigate = useNavigate();
  const { userId, storeId } = useParams();
  const [user, loading, error] = useAuthState(auth);
  const [userDoc, userDocLoading, userDocError] = useDocument(doc(db, 'users', userId ?? ''), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
  const [storeDoc, storeDocLoading, storeDocError] = useDocument(
    doc(db, 'users', userId ?? '', 'stores', storeId ?? ''),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    },
  );
  const [storeExists, setStoreExists] = useState(false);
  const [storeKyc, setStoreKyc] = useState<VerifyKycResponse>({
    emailVerified: false,
    userKycVerified: false,
    storeEmailVerified: false,
    storePhoneNumberVerified: false,
    storeAddressVerified: false,
    storeKycVerified: false,
  });
  const [storeKycLoading, setStoreKycLoading] = useState(false);
  const [storeKycError, setStoreKycError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (loading || userDocLoading || storeDocLoading) {
      return;
    }

    if (!(user && userId && userId === user.uid)) {
      navigate('/auth/sign-in/');
      return;
    }

    if (userId !== storeId) {
      navigate(`/users/${userId}`);
      return;
    }

    const isExists = !!userDoc?.exists() && !!storeDoc?.exists();
    setStoreExists(isExists);

    setStoreKycLoading(true);
    httpsOnCallVerifyKyc({ userId, storeId })
      .then((res) => {
        setStoreKyc(res.data);
      })
      .catch((err) => {
        setStoreKycError(err as Error);
      })
      .finally(() => {
        setStoreKycLoading(false);
      });
  }, [
    userId,
    storeId,
    user,
    loading,
    navigate,
    userDoc,
    userDocLoading,
    storeDoc,
    storeDocLoading,
    setStoreExists,
    setStoreKycLoading,
    setStoreKyc,
    setStoreKycError,
  ]);

  const handleStoreCreate = () => {
    if (!userId) {
      throw Error('Invalid userId');
    }
    if (!storeId) {
      throw Error('Invalid storeId');
    }
    navigate(`/users/${userId}/stores/${storeId}/create`);
  };

  const handleStoreUpdate = () => {
    if (!userId) {
      throw Error('Invalid userId');
    }
    if (!storeId) {
      throw Error('Invalid storeId');
    }
    navigate(`/users/${userId}/stores/${storeId}/update`, {
      state: {
        storeName: storeDoc?.data()?.storeName ?? '',
        storeEmail: storeDoc?.data()?.storeEmail ?? '',
        storePhoneNumber: storeDoc?.data()?.storePhoneNumber ?? '',
        storeZipCode: storeDoc?.data()?.storeZipCode ?? '',
        storeAddress1: storeDoc?.data()?.storeAddress1 ?? '',
        storeAddress2: storeDoc?.data()?.storeAddress2 ?? '',
        storeUrl: storeDoc?.data()?.storeUrl ?? '',
        storeSymbolAddress: storeDoc?.data()?.storeSymbolAddress ?? '',
        storeDescription: storeDoc?.data()?.storeDescription ?? '',
        storeImageFile: storeDoc?.data()?.storeImageFile ?? '',
        storeCoverImageFile: storeDoc?.data()?.storeCoverImageFile ?? '',
      },
    });
  };

  if (!userId || !user?.uid || userId !== user?.uid) {
    return null;
  }

  if (userId !== storeId) {
    return null;
  }

  return (
    <>
      {storeExists ? (
        <Container maxWidth="sm">
          <h2>店舗情報</h2>
          <Stack spacing={3}>
            <div>
              <h3>店舗名</h3>
              <div>{storeDoc?.data()?.storeName}</div>
            </div>
            <div>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <h3>店舗メールアドレス</h3>
                {storeKyc.storeEmailVerified ? (
                  <CheckIcon color="success" />
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to={`/users/${userId}/stores/${storeId}/verify-store-email`}
                  >
                    確認
                  </Button>
                )}
              </Box>
              <div>{storeDoc?.data()?.storeEmail}</div>
            </div>
            <div>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <h3>店舗電話番号</h3>
                {storeKyc.storePhoneNumberVerified ? (
                  <CheckIcon color="success" />
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to={`/users/${userId}/stores/${storeId}/verify-store-phone-number`}
                  >
                    確認
                  </Button>
                )}
              </Box>
              <div>{storeDoc?.data()?.storePhoneNumber}</div>
            </div>
            <div>
              <h3>店舗郵便番号</h3>
              <div>{storeDoc?.data()?.storeZipCode}</div>
            </div>
            <div>
              <h3>店舗住所(都道府県市区町村)</h3>
              <div>{storeDoc?.data()?.storeAddress1}</div>
            </div>
            <div>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <h3>店舗住所(番地・建物名・部屋番号)</h3>
                {storeKyc.storeAddressVerified ? (
                  <CheckIcon color="success" />
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to={`/users/${userId}/stores/${storeId}/verify-store-address`}
                  >
                    確認
                  </Button>
                )}
              </Box>
              <div>{storeDoc?.data()?.storeAddress2}</div>
            </div>
            <div>
              <h3>店舗URL</h3>
              <div>
                <a href={storeDoc?.data()?.storeUrl}>{storeDoc?.data()?.storeUrl}</a>
              </div>
            </div>
            <div>
              <h3>{`店舗Symbolアドレス(${SYMBOL_NETWORK_NAME})`}</h3>
              <div>{storeDoc?.data()?.storeSymbolAddress}</div>
            </div>
            <div>
              <h3>店舗説明</h3>
              <div>{storeDoc?.data()?.storeDescription}</div>
            </div>
            <div>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <h3>店舗画像</h3>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to={`/users/${userId}/stores/${storeId}/upload-store-image`}
                >
                  画像設定
                </Button>
              </Box>
              <a href={storeDoc?.data()?.storeImageFile}>{storeDoc?.data()?.storeImageFile}</a>
              <img src={storeDoc?.data()?.storeImageFile} alt={storeDoc?.data()?.storeName} style={{ width: '100%' }} />
            </div>
            {/* <div>
              <h3>店舗カバー画像</h3>
              <div>{storeDoc?.data()?.storeCoverImageFile}</div>
            </div> */}
            <Button color="primary" variant="contained" size="large" onClick={handleStoreUpdate}>
              店舗編集
            </Button>
          </Stack>
        </Container>
      ) : (
        <Container maxWidth="sm">
          <h2>店舗情報</h2>
          <Stack spacing="3">
            <div>
              <h3>店舗情報無し</h3>
              <div>出店を希望する場合は以下から店舗情報をご登録ください</div>
            </div>
            <Button color="primary" variant="contained" size="large" onClick={handleStoreCreate}>
              店舗登録
            </Button>
          </Stack>
        </Container>
      )}
      <LoadingOverlay open={loading || userDocLoading || storeDocLoading || storeKycLoading} />
      <ErrorDialog open={!!error} error={error} />
      <ErrorDialog open={!!userDocError} error={userDocError} />
      <ErrorDialog open={!!storeDocError} error={storeDocError} />
      <ErrorDialog open={!!storeKycError} error={storeKycError} />
    </>
  );
};

export default Store;
