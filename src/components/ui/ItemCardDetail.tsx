/* eslint-disable @typescript-eslint/no-misused-promises */
import { Box, Card, IconButton } from '@mui/material';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { useDocument } from 'react-firebase-hooks/firestore';
import { ItemProps } from './ItemCard';
import { Order, User } from './OrderCardDetails';
import db, { auth, collection, addDoc, doc } from '../../configs/firebase';
import LoadingOverlay from './LoadingOverlay';
import ErrorDialog from './ErrorDialog';

const ItemCardDetail = (itemProps: ItemProps) => {
  const navigate = useNavigate();
  const { store, item } = itemProps;
  const { itemId, itemName, itemPrice, itemPriceUnit, itemDescription, itemImageFile, itemStatus } = item;
  const {
    storeId,
    storeName,
    storeEmail,
    storePhoneNumber,
    storeZipCode,
    storeAddress1,
    storeAddress2,
    storeUrl,
    storeSymbolAddress,
    storeDescription,
    storeImageFile,
    storeCoverImageFile,
  } = store;
  const [authUser, authUserLoading, authUserError] = useAuthState(auth);
  const [userDoc, userDocLoading, userDocError] = useDocument(doc(db, `/users/${authUser?.uid ?? ''}`));
  const [user, setUser] = useState<User | undefined>(userDoc?.data() as User);
  const [purchaseError, setPurchaseError] = useState<Error | undefined>(undefined);
  const orderCollection = collection(db, `/users/${authUser?.uid ?? ''}/orders`);

  useEffect(() => {
    if (!userDoc?.data()) {
      return;
    }
    setUser(userDoc?.data() as User);
  }, [setUser, userDoc]);

  const handleStoreAvatarClick = () => {
    navigate(`/stores/${storeId}`);
  };

  const handleItemClick = () => {
    navigate(`/stores/${storeId}/items/${itemId}`);
  };

  const handlePurchaseClick = async () => {
    if (!authUser) {
      setPurchaseError(Error('買い物をするにはログインしてください'));
    }
    if (!user) {
      return;
    }
    const orderAmount = 1;
    const order: Order = {
      ...user,
      ...store,
      ...item,
      orderAmount,
    };
    const orderDocRef = await addDoc(orderCollection, order);
    const orderId = orderDocRef.id;
    navigate(`/users/${user.userId}/orders/${orderDocRef.id}`, {
      state: {
        user,
        store,
        item,
        orderId,
        orderAmount,
      },
    });
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
      <ErrorDialog open={!!purchaseError} error={purchaseError} />
    </>
  );
};

export default ItemCardDetail;
