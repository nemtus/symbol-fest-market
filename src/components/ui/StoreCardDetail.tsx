import { Box, Card } from '@mui/material';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SignpostIcon from '@mui/icons-material/Signpost';
import LinkIcon from '@mui/icons-material/Link';
import SearchIcon from '@mui/icons-material/Search';
import { Link, useNavigate } from 'react-router-dom';

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

const StoreCardDetail = (storeProps: StoreProps) => {
  const { store } = storeProps;
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
    // storeCoverImageFile,
  } = store;
  const navigate = useNavigate();
  const handleStoreClick = () => {
    navigate(`/stores/${storeId}`);
  };

  return (
    <Box maxWidth="sm">
      <Card>
        <CardMedia component="img" image={storeImageFile} alt={storeName} onClick={handleStoreClick} />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {storeName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {storeDescription}
          </Typography>
          <div style={{ display: 'flex' }}>
            <EmailIcon />
            <Typography variant="body2" color="text.third">
              {storeEmail}
            </Typography>
          </div>
          <div style={{ display: 'flex' }}>
            <PhoneIcon />
            <Typography variant="body2" color="text.third">
              {storePhoneNumber}
            </Typography>
          </div>
          <div style={{ display: 'flex' }}>
            <SignpostIcon />
            <Typography variant="body2" color="text.third">
              {`${storeZipCode.slice(0, 3)}-${storeZipCode.slice(3)} ${storeAddress1} ${storeAddress2}`}
            </Typography>
          </div>
          <div style={{ display: 'flex' }}>
            <LinkIcon />
            <a href={storeUrl}>{storeUrl}</a>
          </div>
          <div style={{ display: 'flex' }}>
            <SearchIcon />
            <a href={`https://testnet.symbol.fyi/accounts/${storeSymbolAddress}`}>{storeSymbolAddress}</a>
          </div>
        </CardContent>
        <CardActions>
          <Button size="small" component={Link} to={`/stores/${storeId}/items`} disabled={!storeId}>
            商品一覧
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default StoreCardDetail;
