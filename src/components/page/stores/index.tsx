/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useCollectionData } from 'react-firebase-hooks/firestore';
import db, { collection } from '../../../configs/firebase';
import ErrorDialog from '../../ui/ErrorDialog';
import LoadingOverlay from '../../ui/LoadingOverlay';
import StoreList from '../../ui/StoreList';
import { Store } from '../../ui/StoreCard';

const PublicStores = () => {
  const [storeCollectionData, storeCollectionDataLoading, storeCollectionDataError] = useCollectionData(
    collection(db, 'stores'),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    },
  );

  // useEffect(() => {
  //   console.log(storeCollectionData);
  // }, [storeCollectionData]);

  return (
    <div>
      <h2>出店一覧</h2>
      <StoreList stores={storeCollectionData as Store[]} />
      <LoadingOverlay open={storeCollectionDataLoading} />
      <ErrorDialog open={!!storeCollectionDataError} error={storeCollectionDataError} />
    </div>
  );
};

export default PublicStores;
