import { Box, Card } from '@mui/material';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';

export interface Store {
  storeId: string;
  storeName: string;
  storeEmail: string;
  storePhoneNumber: string;
  storeZipCode: string;
  storeAddress1: string;
  storeAddress2: string;
  storeUrl: string;
  storeSymbolAddress: string;
  storeDescription: string;
  storeImageFile: string;
  storeCoverImageFile: string;
}

export interface StoreProps {
  store: Store;
  key: string;
}

const StoreCard = (storeProps: StoreProps) => {
  const { store } = storeProps;
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

  return (
    <Box maxWidth="sm">
      <Card>
        <CardMedia component="img" image={storeImageFile} alt={storeName} />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {storeName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {storeDescription}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" component={Link} to={`/stores/${storeId}`} disabled={!storeId}>
            詳細
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default StoreCard;
