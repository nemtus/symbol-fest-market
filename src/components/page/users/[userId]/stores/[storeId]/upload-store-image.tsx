/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { useDocument } from 'react-firebase-hooks/firestore';
import db, { storage, ref, uploadBytes, getDownloadURL, doc, setDoc } from '../../../../../../configs/firebase';
import LoadingOverlay from '../../../../../ui/LoadingOverlay';
import ErrorDialog from '../../../../../ui/ErrorDialog';

const UploadStoreImage = () => {
  const navigate = useNavigate();
  const { userId, storeId } = useParams();
  const [storageUploading, setStorageUploading] = useState<boolean>(false);
  const [setDocLoading, setSetDocLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [configDoc, configDocLoading, configDocError] = useDocument(doc(db, 'configs/1'), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!configDoc?.data()?.enableCreateStore) {
      setError(Error('現在、店舗登録を受け付けていません。'));
      return;
    }
    const { files } = e.target;
    if (!files?.length) {
      return;
    }
    if (!userId) {
      return;
    }
    if (!storeId) {
      return;
    }
    const storageRef = ref(storage, `users/${userId}/stores/${storeId}/images/${files[0].name}`);
    const storeDocRef = doc(db, `users/${userId}/stores/${storeId}`);
    try {
      setStorageUploading(true);
      const snapshot = await uploadBytes(storageRef, files[0]);
      const storeImageFile = await getDownloadURL(snapshot.ref);
      setStorageUploading(false);
      setSetDocLoading(true);
      await setDoc(storeDocRef, { storeImageFile }, { merge: true });
      setSetDocLoading(false);
      navigate(`/users/${userId}/stores/${storeId}`);
    } catch (err) {
      setError(err as Error);
      setStorageUploading(false);
      setSetDocLoading(false);
    }
  };

  return (
    <>
      <h2>店舗画像アップロード</h2>
      <label htmlFor="upload-button-store-image">
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="upload-button-store-image"
          type="file"
          onChange={onChange}
        />
        <Button variant="contained" component="span">
          アップロード
        </Button>
      </label>
      <LoadingOverlay open={storageUploading || setDocLoading || configDocLoading} />
      <ErrorDialog open={!!error} error={error} />
      <ErrorDialog open={!!configDocError} error={configDocError} />
    </>
  );
};

export default UploadStoreImage;
