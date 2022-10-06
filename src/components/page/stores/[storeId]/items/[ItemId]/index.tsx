import { useDocument } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import db, { doc } from '../../../../../../configs/firebase';
import ErrorDialog from '../../../../../ui/ErrorDialog';
import LoadingOverlay from '../../../../../ui/LoadingOverlay';
import { Item } from '../../../../../ui/ItemCard';
import { Store } from '../../../../../ui/StoreCard';
import ItemCardDetail from '../../../../../ui/ItemCardDetail';

const PublicItem = () => {
  const { storeId, itemId } = useParams();
  const [storeDoc, storeDocLoading, storeDocError] = useDocument(doc(db, `stores/${storeId ?? ''}`), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
  const [itemDoc, itemDocLoading, itemDocError] = useDocument(
    doc(db, `stores/${storeId ?? ''}/items/${itemId ?? ''}`),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    },
  );
  const [exists, setExists] = useState(false);

  useEffect(() => {
    setExists(!!storeDoc?.exists() && !!itemDoc?.exists());
  }, [setExists, storeDoc, itemDoc]);

  return (
    <div>
      <h2>商品詳細</h2>
      {exists ? (
        <ItemCardDetail
          store={storeDoc?.data() as Store}
          item={itemDoc?.data() as Item}
          key={(storeDoc?.data() as Store).storeId}
        />
      ) : null}
      <LoadingOverlay open={storeDocLoading || itemDocLoading || !exists} />
      <ErrorDialog open={!!storeDocError} error={storeDocError} />
      <ErrorDialog open={!!itemDocError} error={itemDocError} />
    </div>
  );
};

export default PublicItem;
