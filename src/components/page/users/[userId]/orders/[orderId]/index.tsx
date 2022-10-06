import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import OrderCardDetail, { Order } from '../../../../../ui/OrderCardDetails';
import db, { doc, onSnapshot, auth } from '../../../../../../configs/firebase';
import LoadingOverlay from '../../../../../ui/LoadingOverlay';
import ErrorDialog from '../../../../../ui/ErrorDialog';

const OrderForUser = () => {
  const { userId, orderId } = useParams();
  const [authUser, authUserLoading, authUserError] = useAuthState(auth);
  const [orderDocData, setOrderDocData] = useState<Order | undefined>(undefined);
  const [orderDocLoading, setOrderDocLoading] = useState(false);
  const [orderDocError, setOrderDocError] = useState<Error | undefined>(undefined);
  const [orderExists, setOrderExists] = useState(false);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }
    if (!orderId) {
      return undefined;
    }
    const orderDocRef = doc(db, `/users/${userId}/orders/${orderId}`);
    setOrderDocLoading(true);
    const unsubscribe = onSnapshot(
      orderDocRef,
      { includeMetadataChanges: true },
      (res) => {
        setOrderExists(res.exists());
        setOrderDocData(res.data() as Order);
        setOrderDocLoading(false);
      },
      (error) => {
        setOrderDocError(error as Error);
        setOrderDocLoading(false);
      },
    );
    return function cleanup() {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId, orderId, setOrderDocLoading, setOrderExists, setOrderDocData, setOrderDocError]);

  if (!authUser) {
    return null;
  }

  if (!(authUser.uid === userId)) {
    return null;
  }

  if (!orderId) {
    return null;
  }

  if (!orderExists) {
    return null;
  }

  return (
    <>
      {orderExists && orderDocData && orderId ? <OrderCardDetail order={orderDocData} key={orderId} /> : null}
      <LoadingOverlay open={orderDocLoading || authUserLoading} />
      <ErrorDialog open={!!orderDocError} error={orderDocError} />
      <ErrorDialog open={!!authUserError} error={authUserError} />
    </>
  );
};

export default OrderForUser;
