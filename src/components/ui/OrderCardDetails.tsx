import { Box, Card, CardHeader, CardMedia, CardContent, CardActions, Button, Avatar, IconButton } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { useDocument } from 'react-firebase-hooks/firestore';
import { Item } from './ItemCard';
import { Store } from './StoreCard';
import db, { auth, doc } from '../../configs/firebase';
import LoadingOverlay from './LoadingOverlay';
import ErrorDialog from './ErrorDialog';

export interface User {
  userId: string;
  email: string;
  name: string;
  phoneNumber: string;
  zipCode: string;
  address1: string;
  address2: string;
  symbolAddress: string;
}

export interface Order extends User, Store, Item {
  orderId?: string;
  orderAmount: number;
  orderTotalPrice?: number;
  orderTotalPriceUnit?: string;
  orderTotalPriceCC?: number;
  orderTotalPriceCCUnit?: string;
  orderTxHash?: string;
  orderStatus?: 'WAITING_PRICE_INFO' | 'PENDING' | 'UNCONFIRMED' | 'CONFIRMED' | 'SENT' | 'TIMEOUT' | 'ABORTED';
}

export const convertOrderStatus = (orderStatus: string) => {
  switch (orderStatus) {
    case 'WAITING_PRICE_INFO':
      return '価格情報取得';
    case 'PENDING':
      return 'トランザクション情報';
    case 'UNCONFIRMED':
      return 'トランザクション確認';
    case 'CONFIRMED':
      return '注文確定(トランザクション承認済)';
    case 'SENT':
      return '発送';
    case 'TIMEOUT':
      return 'タイムアウト';
    case 'ABORTED':
      return '中止';
    default:
      return '不明';
  }
};

export interface OrderProps {
  order: Order;
  key: string;
}

const OrderCardDetail = (orderProps: OrderProps) => {
  const { order } = orderProps;
  const { orderId } = useParams();
  const navigate = useNavigate();
  const {
    userId,
    // email,
    // name,
    // phoneNumber,
    // zipCode,
    // address1,
    // address2,
    symbolAddress,
    storeId,
    storeName,
    // storeEmail,
    // storePhoneNumber,
    // storeZipCode,
    // storeAddress1,
    // storeAddress2,
    // storeUrl,
    storeSymbolAddress,
    storeDescription,
    storeImageFile,
    // storeCoverImageFile,
    itemId,
    itemName,
    itemPrice,
    itemPriceUnit,
    itemDescription,
    itemImageFile,
    itemStatus,
    // orderAmount,
    orderTotalPrice,
    orderTotalPriceUnit,
    orderTotalPriceCC,
    orderTotalPriceCCUnit,
    orderTxHash,
    // orderStatus,
  } = order;
  const [authUser, authUserLoading, authUserError] = useAuthState(auth);
  const [orderDoc, orderDocLoading, orderDocError] = useDocument(doc(db, `users/${userId}/orders/${orderId ?? ''}`), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
  const [orderError, setOrderError] = useState<Error | undefined>(undefined);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  useEffect(() => {
    if (authUserLoading) {
      return;
    }
    if (orderDocLoading) {
      return;
    }
    if (!orderDoc) {
      return;
    }
    if (orderDoc.data()?.orderStatus === 'WAITING_PRICE_INFO') {
      setActiveStepIndex(0);
    }
    if (orderDoc.data()?.orderStatus === 'PENDING') {
      setActiveStepIndex(1);
    }
    if (orderDoc.data()?.orderStatus === 'UNCONFIRMED') {
      setActiveStepIndex(2);
    }
    if (orderDoc.data()?.orderStatus === 'CONFIRMED') {
      setActiveStepIndex(3);
    }
    if (orderDoc.data()?.orderStatus === 'SENT') {
      setActiveStepIndex(4);
    }
    if (orderDoc.data()?.orderStatus === 'TIMEOUT') {
      setActiveStepIndex(5);
    }
    if (orderDoc.data()?.orderStatus === 'ABORTED') {
      setActiveStepIndex(6);
    }
  }, [orderDoc, authUserLoading, orderDocLoading, setActiveStepIndex]);

  const handleStoreAvatarClick = () => {
    navigate(`/stores/${storeId}`);
  };

  const handleItemClick = () => {
    navigate(`/stores/${storeId}/items/${itemId}`);
  };

  const handlePurchaseClick = () => {
    if (!authUser) {
      setOrderError(Error('買い物をするにはログインしてください'));
    }
    navigate(`/stores/${storeId}/items/${itemId}/purchase`);
  };

  return (
    <>
      <Box maxWidth="sm">
        <h2>注文状況</h2>
        <Stepper activeStep={activeStepIndex} orientation="vertical">
          <Step key="WAITING_PRICE_INFO">
            <StepLabel>
              {activeStepIndex === 0 ? <CircularProgress /> : null}
              <Typography variant="h6">{convertOrderStatus('WAITING_PRICE_INFO')}</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body1">価格情報を取得しています。しばらくお待ちください。</Typography>
            </StepContent>
          </Step>
          <Step key="PENDING">
            <StepLabel>
              {activeStepIndex === 1 ? <CircularProgress /> : null}
              <Typography variant="h6">{convertOrderStatus('PENDING')}</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body1" color="text.secondary">
                トランザクション送信待ちです。以下のトランザクションを送信してください。メッセージの添付を忘れないようご注意ください。
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`${orderTotalPrice ? orderTotalPrice.toLocaleString() : ''} ${
                  orderTotalPriceUnit === 'JPY' ? '円' : ''
                }`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`${orderTotalPriceCC ? orderTotalPriceCC.toLocaleString() : ''} ${orderTotalPriceCCUnit ?? ''}`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`to: ${storeSymbolAddress}`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`from: ${symbolAddress}`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`message: ${orderId ?? ''}`}
              </Typography>
            </StepContent>
          </Step>
          <Step key="UNCONFIRMED">
            <StepLabel>
              {activeStepIndex === 2 ? <CircularProgress /> : null}
              <Typography variant="h6">{convertOrderStatus('UNCONFIRMED')}</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body1" color="text.secondary">
                トランザクションの確認中です。しばらくお待ちください。
              </Typography>{' '}
              <Typography variant="body1" color="text.secondary">
                Tx Hash: {orderTxHash}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`価格: ${orderTotalPrice ? orderTotalPrice.toLocaleString() : ''} ${
                  orderTotalPriceUnit === 'JPY' ? '円' : ''
                }`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`価格: ${orderTotalPriceCC ? orderTotalPriceCC.toLocaleString() : ''} ${orderTotalPriceCCUnit ?? ''}`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`to: ${storeSymbolAddress}`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`from: ${symbolAddress}`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`message: ${orderId ?? ''}`}
              </Typography>
            </StepContent>
          </Step>
          <Step key="CONFIRMED">
            <StepLabel>
              {activeStepIndex === 3 ? <CheckIcon color="success" /> : null}
              <Typography variant="h6">{convertOrderStatus('CONFIRMED')}</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body1" color="text.secondary">
                トランザクションが承認され、注文が確定しました。
              </Typography>{' '}
              <Typography variant="body1" color="text.secondary">
                Tx Hash: {orderTxHash}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`価格: ${orderTotalPrice ? orderTotalPrice.toLocaleString() : ''} ${
                  orderTotalPriceUnit === 'JPY' ? '円' : ''
                }`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`価格: ${orderTotalPriceCC ? orderTotalPriceCC.toLocaleString() : ''} ${orderTotalPriceCCUnit ?? ''}`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`to: ${storeSymbolAddress}`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`from: ${symbolAddress}`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`message: ${orderId ?? ''}`}
              </Typography>
              <Card>
                <CardHeader
                  avatar={<Avatar src={storeImageFile} onClick={handleStoreAvatarClick} />}
                  action={
                    <IconButton onClick={handleStoreAvatarClick}>
                      <MoreVertIcon />
                    </IconButton>
                  }
                  title={storeName}
                  subheader={storeDescription}
                />
                <CardMedia component="img" image={itemImageFile} alt={itemName} onClick={handleItemClick} />
                <CardContent>
                  <Typography gutterBottom variant="h3" component="div">
                    {itemName}
                  </Typography>
                  <Typography variant="h4" color="text.secondary">
                    {`${itemPrice.toLocaleString()} ${itemPriceUnit === 'JPY' ? '円' : ''}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {itemDescription}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="large"
                    disabled={!storeId || !itemId || itemStatus === 'SOLD_OUT'}
                    onClick={handlePurchaseClick}
                  >
                    購入
                  </Button>
                </CardActions>
              </Card>
            </StepContent>
          </Step>
        </Stepper>
      </Box>
      <LoadingOverlay open={authUserLoading} />
      <ErrorDialog open={!!authUserError} error={authUserError} />
      <ErrorDialog open={!!orderError} error={orderError} />
      <ErrorDialog open={!!orderDocError} error={orderDocError} />
    </>
  );
};

export default OrderCardDetail;
