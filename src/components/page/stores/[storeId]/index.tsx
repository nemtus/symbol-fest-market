/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useDocument } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
    setStoreExists(!!storeDoc?.exists());
  }, [storeDoc, setStoreExists]);

  return (
    <div>
      <h2>店舗詳細</h2>
      {storeExists ? <StoreCardDetail store={storeDoc?.data() as Store} key={storeDoc?.data()?.storeId} /> : null}
      {storeExists ? <PublicItems /> : null}
      <LoadingOverlay open={storeDocLoading || !storeExists} />
      <ErrorDialog open={!!storeDocError} error={storeDocError} />
    </div>
  );
};

export default PublicStore;
