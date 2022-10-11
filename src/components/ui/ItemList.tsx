import { Box } from '@mui/material';
import { Item } from './ItemCard';
import ItemCardDetail from './ItemCardDetail';
import { Store } from './StoreCard';

export interface ItemsProps {
  items: Item[] | undefined;
  store: Store;
}

const ItemList = (itemProps: ItemsProps) => {
  const { items, store } = itemProps;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
      {items?.map((item) => (
        <ItemCardDetail item={item} store={store} key={item.itemId} />
      ))}
    </Box>
  );
};

export default ItemList;
