import { Box, Card, CardHeader, CardMedia, CardContent, CardActions, Button, Avatar, IconButton } from '@mui/material';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useState } from 'react';
import { auth } from '../../configs/firebase';
import LoadingOverlay from './LoadingOverlay';
import ErrorDialog from './ErrorDialog';
import { OrderProps } from './OrderCardDetails';

const OrderCard = (orderProps: OrderProps) => {
  const { order } = orderProps;
  const navigate = useNavigate();
  const {
    // userId,
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
    orderId,
    // orderAmount,
    orderTotalPrice,
    orderTotalPriceUnit,
    orderTotalPriceCC,
    orderTotalPriceCCUnit,
    orderTxHash,
    // orderStatus,
  } = order;
  const [authUser, authUserLoading, authUserError] = useAuthState(auth);
  // const [orderDoc, orderDocLoading, orderDocError] = useDocument(doc(db, `users/${userId}/orders/${orderId ?? ''}`), {
  //   snapshotListenOptions: { includeMetadataChanges: true },
  // });
  const [orderError, setOrderError] = useState<Error | undefined>(undefined);

  // useEffect(() => {
  //   if (authUserLoading) {
  //     return;
  //   }
  //   if (orderDocLoading) {
  //     return;
  //   }
  //   if (!orderDoc) {
  //     return;
  //   }
  // }, [orderDoc, authUserLoading, orderDocLoading]);

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
    navigate(`/stores/${storeId}/items/${itemId}`);
  };

  return (
    <>
      <Box maxWidth="sm">
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
      </Box>
      <LoadingOverlay open={authUserLoading} />
      <ErrorDialog open={!!authUserError} error={authUserError} />
      <ErrorDialog open={!!orderError} error={orderError} />
      {/* <ErrorDialog open={!!orderDocError} error={orderDocError} /> */}
    </>
  );
};

export default OrderCard;
