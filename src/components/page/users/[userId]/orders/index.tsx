import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData, useDocument } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router-dom';
import db, { auth, collection, doc } from '../../../../../configs/firebase';
import OrderCard, { Order } from '../../../../ui/OrderCard';
import LoadingOverlay from '../../../../ui/LoadingOverlay';
import ErrorDialog from '../../../../ui/ErrorDialog';

export const OrdersForUser = () => {
  const { userId } = useParams();
  const [authUser, authUserLoading, authUserError] = useAuthState(auth);
  const [userDoc, userDocLoading, userDocError] = useDocument(doc(db, 'users', userId ?? ''), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
  const [orderCollectionData, orderCollectionDataLoading, orderCollectionDataError] = useCollectionData(
    collection(db, 'users', userId ?? '', 'orders'),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    },
  );
  const [exists, setExists] = useState(false);

  useEffect(() => {
    if (authUserLoading) {
      return;
    }
    if (userDocLoading) {
      return;
    }
    if (!(authUser && userId && userId === authUser.uid)) {
      return;
    }
    if (!userDoc?.exists()) {
      setExists(false);
      return;
    }
    if (orderCollectionDataLoading) {
      return;
    }
    if (!orderCollectionData?.length) {
      return;
    }
    setExists(true);
  }, [
    authUserLoading,
    userDocLoading,
    authUser,
    userId,
    userDoc,
    orderCollectionDataLoading,
    orderCollectionData,
    setExists,
  ]);

  return (
    <>
      <h2>注文履歴</h2>
      {exists && orderCollectionData
        ? orderCollectionData.map((order) => <OrderCard key={order.orderId as string} order={order as Order} />)
        : null}
      <LoadingOverlay open={authUserLoading || userDocLoading || orderCollectionDataLoading} />
      <ErrorDialog open={!!authUserError} error={authUserError} />
      <ErrorDialog open={!!userDocError} error={userDocError} />
      <ErrorDialog open={!!orderCollectionDataError} error={orderCollectionDataError} />
    </>
  );
};

export default OrdersForUser;
