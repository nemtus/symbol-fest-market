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

// interface Item {
//   itemId: string;
//   itemName: string;
//   itemPrice: number;
//   itemPriceUnit: 'JPY';
//   itemDescription: string;
//   itemImageFile: string;
//   itemStatus: 'ON_SALE' | 'SOLD_OUT';
// }

const Store = () => {
  const navigate = useNavigate();
  const { userId, storeId, itemId } = useParams();
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
  const [itemDoc, itemDocLoading, itemDocError] = useDocument(
    doc(db, 'users', userId ?? '', 'stores', storeId ?? '', 'items', itemId ?? ''),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    },
  );
  const [itemExists, setItemExists] = useState(false);

  useEffect(() => {
    const isItemExists = !!userDoc?.exists() && !!storeDoc?.exists() && !!itemDoc?.exists();
    setItemExists(isItemExists);
  }, [userDoc, storeDoc, itemDoc, setItemExists]);

  const handleItems = () => {
    if (!userId) {
      throw Error('Invalid userId');
    }
    if (!storeId) {
      throw Error('Invalid storeId');
    }
    navigate(`/users/${userId}/stores/${storeId}/items`);
  };

  const handleItemUpdate = () => {
    if (!userId) {
      throw Error('Invalid userId');
    }
    if (!storeId) {
      throw Error('Invalid storeId');
    }
    if (!itemId) {
      throw Error('Invalid itemId');
    }
    navigate(`/users/${userId}/stores/${storeId}/items/${itemId}/update`, {
      state: {
        itemName: itemDoc?.data()?.itemName,
        itemPrice: itemDoc?.data()?.itemPrice,
        itemPriceUnit: itemDoc?.data()?.itemPriceUnit,
        itemDescription: itemDoc?.data()?.itemDescription,
        itemImageFile: itemDoc?.data()?.itemImageFile,
        itemStatus: itemDoc?.data()?.itemStatus,
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
      {itemExists ? (
        <Container maxWidth="sm">
          <h2>商品詳細</h2>
          <Stack spacing={3}>
            <div>
              <h3>商品ID</h3>
              <div>{itemDoc?.data()?.itemId}</div>
            </div>
            <div>
              <h3>商品名</h3>
              <div>{itemDoc?.data()?.itemName}</div>
            </div>
            <div>
              <h3>商品価格</h3>
              <div>{itemDoc?.data()?.itemPrice}</div>
            </div>
            <div>
              <h3>商品価格通貨</h3>
              <div>{itemDoc?.data()?.itemPriceUnit}</div>
            </div>
            <div>
              <h3>商品説明</h3>
              <div>{itemDoc?.data()?.itemDescription}</div>
            </div>
            <div>
              <h3>商品ステータス</h3>
              <div>{itemDoc?.data()?.itemStatus}</div>
            </div>
            <div>
              <h3>商品画像</h3>
              <div>{itemDoc?.data()?.itemImageFile}</div>
            </div>
            <Button color="primary" variant="contained" size="large" onClick={handleItemUpdate}>
              商品編集
            </Button>
          </Stack>
        </Container>
      ) : (
        <Container maxWidth="sm">
          <h2>商品詳細</h2>
          <Stack spacing="3">
            <div>
              <h3>商品登録無し</h3>
              <div>ご指定のIDの商品は見つかりませんでした。以下の商品一覧ページから商品をご確認ください。</div>
            </div>
            <Button color="primary" variant="contained" size="large" onClick={handleItems}>
              商品一覧ページ
            </Button>
          </Stack>
        </Container>
      )}
      <LoadingOverlay open={loading || userDocLoading || storeDocLoading || itemDocLoading} />
      <ErrorDialog open={!!error} error={error} />
      <ErrorDialog open={!!userDocError} error={userDocError} />
      <ErrorDialog open={!!storeDocError} error={storeDocError} />
      <ErrorDialog open={!!itemDocError} error={itemDocError} />
    </>
  );
};

export default Store;
