import { Box, Card, IconButton } from '@mui/material';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Link, useNavigate } from 'react-router-dom';
import { Store } from './StoreCard';

export interface Item {
  itemId: string;
  itemName: string;
  itemPrice: number;
  itemPriceUnit: 'JPY';
  itemDescription: string;
  itemImageFile: string;
  itemStatus: 'ON_SALE' | 'SOLD_OUT';
}

export interface ItemProps {
  store: Store;
  item: Item;
  key: string;
}

const ItemCard = (itemProps: ItemProps) => {
  const navigate = useNavigate();
  const { store, item } = itemProps;
  const { itemId, itemName, itemPrice, itemPriceUnit, itemDescription, itemImageFile, itemStatus } = item;
  const {
    storeId,
    storeName,
    // storeEmail,
    // storePhoneNumber,
    // storeZipCode,
    // storeAddress1,
    // storeAddress2,
    // storeUrl,
    // storeSymbolAddress,
    storeDescription,
    storeImageFile,
    // storeCoverImageFile,
  } = store;

  const handleStoreAvatarClick = () => {
    navigate(`/stores/${storeId}`);
  };

  const handleItemClick = () => {
    navigate(`/stores/${storeId}/items/${itemId}`);
  };

  return (
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
            size="small"
            component={Link}
            to={`/stores/${storeId}/items/${itemId}`}
            disabled={!storeId || !itemId}
          >
            商品詳細
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default ItemCard;
