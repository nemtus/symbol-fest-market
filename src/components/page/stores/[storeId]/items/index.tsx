import { useCollectionData, useDocument } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import db, { collection, doc } from '../../../../../configs/firebase';
import ErrorDialog from '../../../../ui/ErrorDialog';
import LoadingOverlay from '../../../../ui/LoadingOverlay';
import ItemList from '../../../../ui/ItemList';
import { Store } from '../../../../ui/StoreCard';
import { Item } from '../../../../ui/ItemCard';

const PublicItems = () => {
  const { storeId } = useParams();
  const [storeDoc, storeDocLoading, storeDocError] = useDocument(doc(db, `stores/${storeId ?? ''}`), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
  const [itemCollectionData, itemCollectionDataLoading, itemCollectionDataError] = useCollectionData(
    collection(db, `/stores/${storeId ?? ''}/items`),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    },
  );
  const [itemsExist, setItemsExist] = useState(false);

  useEffect(() => {
    if (!storeId) {
      return;
    }
    if (storeDocLoading) {
      return;
    }
    if (itemCollectionDataLoading) {
      return;
    }
    if (storeDoc?.exists() && itemCollectionData?.length) {
      setItemsExist(true);
    }
  }, [storeId, storeDocLoading, itemCollectionDataLoading, storeDoc, itemCollectionData, setItemsExist]);

  return (
    <Container maxWidth="sm">
      <div>
        <h2>商品一覧</h2>
        {itemsExist ? <ItemList store={storeDoc?.data() as Store} items={itemCollectionData as Item[]} /> : null}
        <LoadingOverlay open={storeDocLoading || itemCollectionDataLoading} />
        <ErrorDialog open={!!storeDocError} error={storeDocError} />
        <ErrorDialog open={!!itemCollectionDataError} error={itemCollectionDataError} />
      </div>
    </Container>
  );
};

export default PublicItems;
