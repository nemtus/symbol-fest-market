import { useDocument } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import db, { doc } from '../../../../configs/firebase';
import ErrorDialog from '../../../ui/ErrorDialog';
import LoadingOverlay from '../../../ui/LoadingOverlay';
import StoreCardDetail from '../../../ui/StoreCardDetail';
import { Store } from '../../../ui/StoreCard';
import PublicItems from './items';

const PublicStore = () => {
  const { storeId } = useParams();
  const [storeDoc, storeDocLoading, storeDocError] = useDocument(doc(db, `stores/${storeId ?? ''}`), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
  const [storeExists, setStoreExists] = useState(false);

  useEffect(() => {
    if (!storeId) {
      return;
    }
    setStoreExists(!!(storeDoc?.exists() && storeId));
  }, [storeId, storeDoc, setStoreExists]);

  return (
    <Container maxWidth="sm">
      <div>
        <h2>店舗詳細</h2>
        {storeExists ? (
          <StoreCardDetail store={storeDoc?.data() as Store} key={(storeDoc?.data() as Store)?.storeId} />
        ) : null}
        {storeExists ? <PublicItems /> : null}
        <LoadingOverlay open={storeDocLoading || !storeExists} />
        <ErrorDialog open={!!storeDocError} error={storeDocError} />
      </div>
    </Container>
  );
};

export default PublicStore;
