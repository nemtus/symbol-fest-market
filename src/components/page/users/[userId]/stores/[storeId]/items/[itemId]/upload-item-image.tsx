/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { useDocument } from 'react-firebase-hooks/firestore';
import db, { storage, ref, uploadBytes, getDownloadURL, doc, setDoc } from '../../../../../../../../configs/firebase';
import LoadingOverlay from '../../../../../../../ui/LoadingOverlay';
import ErrorDialog from '../../../../../../../ui/ErrorDialog';

const UploadItemImage = () => {
  const navigate = useNavigate();
  const { userId, storeId, itemId } = useParams();
  const [storageUploading, setStorageUploading] = useState<boolean>(false);
  const [setDocLoading, setSetDocLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [configDoc, configDocLoading, configDocError] = useDocument(doc(db, 'configs/1'), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!configDoc?.data()?.enableCreateItem) {
      setError(Error('現在、商品登録を受け付けていません。'));
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
    if (!itemId) {
      return;
    }
    const storageRef = ref(storage, `users/${userId}/stores/${storeId}/items/${itemId}/images/${files[0].name}`);
    const itemDocRef = doc(db, `users/${userId}/stores/${storeId}/items/${itemId}`);
    try {
      setStorageUploading(true);
      const snapshot = await uploadBytes(storageRef, files[0]);
      const itemImageFile = await getDownloadURL(snapshot.ref);
      setStorageUploading(false);
      setSetDocLoading(true);
      await setDoc(itemDocRef, { itemImageFile }, { merge: true });
      setSetDocLoading(false);
      navigate(`/users/${userId}/stores/${storeId}/items/${itemId}`);
    } catch (err) {
      setError(err as Error);
      setStorageUploading(false);
      setSetDocLoading(false);
    }
  };

  return (
    <>
      <h2>商品画像アップロード</h2>
      <label htmlFor="upload-button-item-image">
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="upload-button-item-image"
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

export default UploadItemImage;
