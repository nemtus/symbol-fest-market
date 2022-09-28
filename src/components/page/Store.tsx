/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocument } from 'react-firebase-hooks/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Container, Stack } from '@mui/material';
import { useState, useEffect } from 'react';
import db, { auth, doc } from '../../configs/firebase';
import LoadingOverlay from '../ui/LoadingOverlay';
import ErrorDialog from '../ui/ErrorDialog';

// interface StoreCreateFormInput {
//   storeName: string;
//   storeEmail: string;
//   storePhoneNumber: string;
//   storeZipCode: string;
//   storeAddress1: string;
//   storeAddress2: string;
//   storeSymbolAddress: string;
//   storeDescription: string;
//   storeImageFile: string;
//   storeCoverImageFile: string;
// }

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

  useEffect(() => {
    const isExists = !!userDoc?.exists() && !!storeDoc?.exists();
    setStoreExists(isExists);
  }, [userDoc, storeDoc, setStoreExists]);

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
              <h3>店舗メールアドレス</h3>
              <div>{storeDoc?.data()?.storeEmail}</div>
            </div>
            <div>
              <h3>店舗電話番号</h3>
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
              <h3>店舗住所(番地・建物名・部屋番号)</h3>
              <div>{storeDoc?.data()?.storeAddress2}</div>
            </div>
            <div>
              <h3>店舗Symbolアドレス(テストネット)</h3>
              <div>{storeDoc?.data()?.storeSymbolAddress}</div>
            </div>
            <div>
              <h3>店舗説明</h3>
              <div>{storeDoc?.data()?.storeDescription}</div>
            </div>
            <div>
              <h3>店舗画像</h3>
              <div>{storeDoc?.data()?.storeImageFile}</div>
            </div>
            <div>
              <h3>店舗カバー画像</h3>
              <div>{storeDoc?.data()?.storeCoverImageFile}</div>
            </div>
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
      <LoadingOverlay open={loading || userDocLoading || storeDocLoading} />
      <ErrorDialog open={!!error} error={error} />
      <ErrorDialog open={!!userDocError} error={userDocError} />
      <ErrorDialog open={!!storeDocError} error={storeDocError} />
    </>
  );
};

export default Store;
