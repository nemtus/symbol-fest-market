import {
  Box,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Avatar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  CircularProgress,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Item } from './ItemCard';
import { Store } from './StoreCard';
import LoadingOverlay from './LoadingOverlay';
import ErrorDialog from './ErrorDialog';
import {
  convertFromTransactionPayloadToTransactionUri,
  createTransactionPayload,
  createTransactionQrData,
  TransactionQrInterface,
} from '../../configs/symbol';

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
  const navigate = useNavigate();
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [transactionPayload, setTransactionPayload] = useState<string | undefined>(undefined);
  const [transactionPayloadLoading, setTransactionPayloadLoading] = useState(false);
  const [transactionPayloadError, setTransactionPayloadError] = useState<Error | undefined>(undefined);
  const [transactionUri, setTransactionUri] = useState<string | undefined>(undefined);
  const [transactionUriLoading, setTransactionUriLoading] = useState(false);
  const [transactionUriError, setTransactionUriError] = useState<Error | undefined>(undefined);
  const [transactionQrData, setTransactionQrData] = useState<TransactionQrInterface | undefined>(undefined);
  const [transactionQrDataLoading, setTransactionQrDataLoading] = useState(false);
  const [transactionQrDataError, setTransactionQrDataError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (order.orderStatus === 'WAITING_PRICE_INFO') {
      setActiveStepIndex(0);
    }
    if (order.orderStatus === 'PENDING') {
      setActiveStepIndex(1);
      setTransactionPayloadLoading(true);
      setTransactionUriLoading(true);
      createTransactionPayload(
        order.symbolAddress,
        order.storeSymbolAddress,
        order.orderTotalPriceCC ?? 0,
        order.orderId ?? '',
      )
        .then((payload) => {
          setTransactionPayload(payload);
          setTransactionUri(convertFromTransactionPayloadToTransactionUri(payload));
          if (!payload) {
            throw Error(
              'ウォレット向けのデータやQRコードの生成に失敗しました。表示されているメッセージ、toアドレス、XYM数量を手動で設定してトランザクション送信してください。',
            );
          }
          setTransactionQrDataLoading(true);
          createTransactionQrData(payload)
            .then((qrData) => {
              setTransactionQrData(qrData);
            })
            .catch((error) => {
              setTransactionQrDataError(error as Error);
            })
            .finally(() => {
              setTransactionQrDataLoading(false);
            });
        })
        .catch((error) => {
          setTransactionPayloadError(error as Error);
          setTransactionUriError(error as Error);
        })
        .finally(() => {
          setTransactionPayloadLoading(false);
          setTransactionUriLoading(false);
        });
    }
    if (order.orderStatus === 'UNCONFIRMED') {
      setActiveStepIndex(2);
    }
    if (order.orderStatus === 'CONFIRMED') {
      setActiveStepIndex(3);
    }
    if (order.orderStatus === 'SENT') {
      setActiveStepIndex(4);
    }
    if (order.orderStatus === 'TIMEOUT') {
      setActiveStepIndex(5);
    }
    if (order.orderStatus === 'ABORTED') {
      setActiveStepIndex(6);
    }
  }, [order, setActiveStepIndex]);

  const handleStoreAvatarClick = () => {
    navigate(`/stores/${order.storeId}`);
  };

  const handleItemClick = () => {
    navigate(`/stores/${order.storeId}/items/${order.itemId}`);
  };

  const handleCopy = (message: string) => {
    navigator.clipboard
      .writeText(message)
      .then(() => {})
      .catch(() => {});
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
                {`${order.orderTotalPrice ? order.orderTotalPrice.toLocaleString() : ''} ${
                  order.orderTotalPriceUnit === 'JPY' ? '円' : ''
                }`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`${order.orderTotalPriceCC ? order.orderTotalPriceCC.toString() : ''} ${
                  order.orderTotalPriceCCUnit ?? ''
                }`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`to: ${order.storeSymbolAddress}`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`from: ${order.symbolAddress}`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`message: ${order.orderId ?? ''}`}
              </Typography>
              <Typography variant="h6">公式デスクトップウォレットの場合</Typography>
              <Typography variant="body1" color="text.secondary">
                以下のコピーボタンからトランザクション情報をコピーして、公式デスクトップウォレットの「トランザクションURIをインポート」機能で読み取ってトランザクションの内容を確認した後に送信してください。
              </Typography>
              <Box display="flex">
                <IconButton
                  onClick={() => {
                    handleCopy(transactionUri ?? '');
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
                <Typography variant="body1" color="text.secondary" sx={{}}>
                  {`${transactionUri ? transactionUri.slice(0, 39) : ''} ... ${
                    transactionUri ? transactionUri.slice(-10) : ''
                  }`}
                </Typography>
              </Box>
              <Typography variant="h6">公式モバイルウォレットの場合</Typography>
              <Typography variant="body1" color="text.secondary">
                以下のQRコードを読み取ってトランザクションの内容を確認した後に送信してください。
              </Typography>
              {transactionQrData ? <QRCodeSVG size={345} value={JSON.stringify(transactionQrData)} /> : null}
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
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Tx Hash: {order.orderTxHash ?? ''}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`価格: ${order.orderTotalPrice ? order.orderTotalPrice.toLocaleString() : ''} ${
                  order.orderTotalPriceUnit === 'JPY' ? '円' : ''
                }`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`価格: ${order.orderTotalPriceCC ? order.orderTotalPriceCC.toString() : ''} ${
                  order.orderTotalPriceCCUnit ?? ''
                }`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`to: ${order.storeSymbolAddress}`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`from: ${order.symbolAddress}`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`message: ${order.orderId ?? ''}`}
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
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Tx Hash: {order.orderTxHash}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`価格: ${order.orderTotalPrice ? order.orderTotalPrice.toLocaleString() : ''} ${
                  order.orderTotalPriceUnit === 'JPY' ? '円' : ''
                }`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`価格: ${order.orderTotalPriceCC ? order.orderTotalPriceCC.toString() : ''} ${
                  order.orderTotalPriceCCUnit ?? ''
                }`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`to: ${order.storeSymbolAddress}`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`from: ${order.symbolAddress}`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {`message: ${order.orderId ?? ''}`}
              </Typography>
              <Card>
                <CardHeader
                  avatar={<Avatar src={order.storeImageFile} onClick={handleStoreAvatarClick} />}
                  action={
                    <IconButton onClick={handleStoreAvatarClick}>
                      <MoreVertIcon />
                    </IconButton>
                  }
                  title={order.storeName}
                  subheader={order.storeDescription}
                />
                <CardMedia component="img" image={order.itemImageFile} alt={order.itemName} onClick={handleItemClick} />
                <CardContent>
                  <Typography gutterBottom variant="h3" component="div">
                    {order.itemName}
                  </Typography>
                  <Typography variant="h4" color="text.secondary">
                    {`${order.itemPrice.toLocaleString()} ${order.itemPriceUnit === 'JPY' ? '円' : ''}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.itemDescription}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="large" disabled={!order.storeId || !order.itemId} onClick={handleItemClick}>
                    購入
                  </Button>
                </CardActions>
              </Card>
            </StepContent>
          </Step>
        </Stepper>
      </Box>
      <LoadingOverlay open={transactionPayloadLoading || transactionUriLoading || transactionQrDataLoading} />
      <ErrorDialog open={!!transactionPayloadError} error={transactionPayloadError} />
      <ErrorDialog open={!!transactionUriError} error={transactionUriError} />
      <ErrorDialog open={!!transactionQrDataError} error={transactionQrDataError} />
    </>
  );
};

export default OrderCardDetail;
