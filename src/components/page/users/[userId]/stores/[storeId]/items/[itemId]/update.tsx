/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocument } from 'react-firebase-hooks/firestore';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Button, Container, MenuItem, Stack, TextField } from '@mui/material';
import * as yup from 'yup';
import { useEffect } from 'react';
import db, { auth, doc, setDoc } from '../../../../../../../../configs/firebase';
import LoadingOverlay from '../../../../../../../ui/LoadingOverlay';
import ErrorDialog from '../../../../../../../ui/ErrorDialog';

interface ItemUpdateFormInput {
  itemName: string;
  itemPrice: number;
  itemPriceUnit: 'JPY';
  itemDescription: string;
  itemImageFile: string;
  itemStatus: 'ON_SALE' | 'SOLD_OUT';
}

const schema = yup.object({
  itemName: yup.string().required('必須です'),
  itemPrice: yup.number().min(1, '0より大きな値を入力してください').required('必須です'),
  itemPriceUnit: yup.string().required('必須です').matches(/^JPY$/, '有効な値を選択してください'),
  itemDescription: yup.string().required('必須です'),
  itemStatus: yup
    .string()
    .required('必須です')
    .matches(/^(ON_SALE|SOLD_OUT)$/, '有効な値を選択してください'),
});

const ItemUpdate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, storeId, itemId } = useParams();
  const [user, loading, error] = useAuthState(auth);
  const [userDoc, userDocLoading, userDocError] = useDocument(doc(db, 'users', userId ?? ''), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
  const [storeDoc, storeDocLoading, storeDocError] = useDocument(
    doc(db, 'users', userId ?? '', 'stores', storeId ?? ''),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    },
  );
  const [itemDoc, itemDocLoading, itemDocError] = useDocument(
    doc(db, 'users', userId ?? '', 'stores', storeId ?? '', 'items', itemId ?? ''),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    },
  );

  const currentItemFormInput: ItemUpdateFormInput = {
    itemName: location.state.itemName ?? '',
    itemPrice: location.state.itemPrice ?? '',
    itemPriceUnit: location.state.itemPriceUnit ?? '',
    itemDescription: location.state.itemDescription ?? '',
    itemImageFile: location.state.itemImageFile ?? '',
    itemStatus: location.state.itemStatus ?? '',
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ItemUpdateFormInput>({
    defaultValues: currentItemFormInput,
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const onSubmit: SubmitHandler<ItemUpdateFormInput> = async (data) => {
    if (!userId) {
      throw Error('Invalid userId');
    }
    if (userId !== user?.uid) {
      throw Error('userId is not match with user.uid');
    }
    if (!user?.email) {
      throw Error('Invalid email');
    }
    const userDocRef = userDoc?.ref;
    if (!userDocRef) {
      throw Error("Can't get user document reference");
    }

    if (!storeId) {
      throw Error('Invalid storeId');
    }
    if (storeId !== userId) {
      throw Error('storeId is not match with userId');
    }
    const storeDocRef = storeDoc?.ref;
    if (!storeDocRef) {
      throw Error("Can't get store document reference");
    }

    if (!itemId) {
      throw Error('Invalid itemId');
    }
    const itemDocRef = itemDoc?.ref;
    if (!itemDocRef) {
      throw Error("Can't get item document reference");
    }

    await setDoc(itemDocRef, { itemId, ...data }, { merge: true });
    navigate(`/users/${userId}/stores/${storeId}/items/${itemId}`);
  };

  useEffect(() => {
    if (!(!loading && user && userId && userId === user.uid)) {
      navigate('/auth/sign-in/');
      return;
    }
    if (!(!loading && user && user.emailVerified)) {
      navigate(`/users/${userId ?? ''}/verify-user-email`);
      return;
    }
    if (userId !== storeId) {
      navigate(`/users/${userId}`);
    }
  }, [userId, storeId, user, loading, navigate]);

  return (
    <>
      <Container maxWidth="sm">
        <h2>商品編集</h2>
        <Stack spacing={3}>
          <TextField
            required
            label="商品名"
            type="text"
            {...register('itemName')}
            error={'itemName' in errors}
            helperText={errors.itemName?.message}
          />
          <TextField
            required
            label="商品価格"
            type="number"
            {...register('itemPrice')}
            error={'itemPrice' in errors}
            helperText={errors.itemPrice?.message}
          />
          <Controller
            name="itemPriceUnit"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                sx={{ mt: 2 }}
                label="通貨"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                <MenuItem value="JPY">円</MenuItem>
              </TextField>
            )}
          />
          <TextField
            required
            label="商品説明"
            type="text"
            {...register('itemDescription')}
            error={'itemDescription' in errors}
            helperText={errors.itemDescription?.message}
          />
          <Controller
            name="itemStatus"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                sx={{ mt: 2 }}
                label="販売状態"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                <MenuItem value="ON_SALE">販売中</MenuItem>
                <MenuItem value="SOLD_OUT">販売停止中</MenuItem>
              </TextField>
            )}
          />
          <Button color="primary" variant="contained" size="large" onClick={handleSubmit(onSubmit)}>
            編集して保存
          </Button>
        </Stack>
      </Container>
      <LoadingOverlay open={loading || userDocLoading || storeDocLoading || itemDocLoading} />
      <ErrorDialog open={!!error} error={error} />
      <ErrorDialog open={!!userDocError} error={userDocError} />
      <ErrorDialog open={!!storeDocError} error={storeDocError} />
      <ErrorDialog open={!!itemDocError} error={itemDocError} />
    </>
  );
};

export default ItemUpdate;
