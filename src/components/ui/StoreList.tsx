import { Box } from '@mui/material';
import StoreCard, { Store } from './StoreCard';

export interface StoresProps {
  stores: Store[] | undefined;
}

const StoreList = (storesProps: StoresProps) => {
  const { stores } = storesProps;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
      {stores?.map((store) => (
        <StoreCard store={store} key={store.storeId} />
      ))}
    </Box>
  );
};

export default StoreList;
