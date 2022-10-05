import { useLocation, useParams } from 'react-router-dom';
import { useDocument } from 'react-firebase-hooks/firestore';
import { useEffect, useState } from 'react';
import OrderCardDetail, { User, Order } from '../../../../../ui/OrderCardDetails';
import { Store } from '../../../../../ui/StoreCard';
import { Item } from '../../../../../ui/ItemCard';
import db, { doc } from '../../../../../../configs/firebase';
import LoadingOverlay from '../../../../../ui/LoadingOverlay';
import ErrorDialog from '../../../../../ui/ErrorDialog';

const OrderForUser = () => {
  const location = useLocation();
  const { user, store, item, orderId, orderAmount } = location.state as {
    user: User;
    store: Store;
    item: Item;
    orderId: string;
    orderAmount: number;
  };
  const { userId } = useParams();
  const [orderDoc, orderDocLoading, orderDocError] = useDocument(doc(db, `/users/${user.userId}/orders/${orderId}`));
  const [exists, setExists] = useState(false);

  useEffect(() => {
    // console.log(user);
    // console.log(store);
    // console.log(item);
    // console.log(orderId);
    // console.log(orderAmount);
    if (!userId) {
      return;
    }
    if (!orderId) {
      return;
    }
    if (!orderDoc) {
      return;
    }
    setExists(orderDoc?.exists() ?? false);
  }, [userId, orderId, setExists, orderDoc]);

  if (!exists) {
    return null;
  }

  return (
    <>
      {exists ? <OrderCardDetail order={orderDoc?.data() as Order} key={orderId ?? ''} /> : null}
      <LoadingOverlay open={orderDocLoading} />
      <ErrorDialog open={!!orderDocError} error={orderDocError} />
    </>
  );
};

export default OrderForUser;
