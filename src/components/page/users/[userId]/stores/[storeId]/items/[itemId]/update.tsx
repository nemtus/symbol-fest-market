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
import { useEffect, useState } from 'react';
import db, { auth, doc, setDoc, httpsCallable, functions } from '../../../../../../../../configs/firebase';
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

interface VerifyKycRequest {
  userId: string;
  storeId: string;
}

interface VerifyKycResponse {
  emailVerified: boolean;
  userKycVerified: boolean;
  storeEmailVerified: boolean;
  storePhoneNumberVerified: boolean;
  storeAddressVerified: boolean;
  storeKycVerified: boolean;
}

const httpsOnCallVerifyKyc = httpsCallable<VerifyKycRequest, VerifyKycResponse>(functions, 'httpsOnCallVerifyKyc');

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
  const [kycStatus, setKycStatus] = useState<VerifyKycResponse>({
    emailVerified: false,
    userKycVerified: false,
    storeEmailVerified: false,
    storePhoneNumberVerified: false,
    storeAddressVerified: false,
    storeKycVerified: false,
  });
  const [kycStatusLoading, setKycStatusLoading] = useState(false);
  const [kycStatusError, setKycStatusError] = useState<Error | undefined>(undefined);
  const [configDoc, configDocLoading, configDocError] = useDocument(doc(db, 'configs/1'), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
  const [submitError, setSubmitError] = useState<Error | undefined>(undefined);

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
    if (!configDoc?.data()?.enableCreateItem) {
      setSubmitError(Error('現在、商品登録を受け付けていません。'));
      return;
    }

    if (!userId) {
      setSubmitError(Error('Invalid userId'));
      return;
    }
    if (userId !== user?.uid) {
      setSubmitError(Error('userId is not match with user.uid'));
      return;
    }
    if (!user?.email) {
      setSubmitError(Error('Invalid email'));
      return;
    }
    const userDocRef = userDoc?.ref;
    if (!userDocRef) {
      setSubmitError(Error("Can't get user document reference"));
      return;
    }

    if (!storeId) {
      setSubmitError(Error('Invalid storeId'));
      return;
    }
    if (storeId !== userId) {
      setSubmitError(Error('storeId is not match with userId'));
      return;
    }
    const storeDocRef = storeDoc?.ref;
    if (!storeDocRef) {
      setSubmitError(Error("Can't get store document reference"));
      return;
    }

    if (!itemId) {
      setSubmitError(Error('Invalid itemId'));
      return;
    }
    const itemDocRef = itemDoc?.ref;
    if (!itemDocRef) {
      setSubmitError(Error("Can't get item document reference"));
      return;
    }

    await setDoc(itemDocRef, { itemId, ...data }, { merge: true });
    navigate(`/users/${userId}/stores/${storeId}/items/${itemId}`);
  };

  useEffect(() => {
    if (loading || userDocLoading || storeDocLoading || itemDocLoading || configDocLoading) {
      return;
    }
    if (!(user && userId && userId === user.uid)) {
      navigate('/auth/sign-in/');
      return;
    }
    if (userId !== storeId) {
      navigate(`/users/${userId}`);
      return;
    }
    setKycStatusLoading(true);
    httpsOnCallVerifyKyc({ userId, storeId })
      .then((res) => {
        setKycStatus(res.data);
        if (!res.data.userKycVerified) {
          navigate(`users/${userId}/verify-user-email`);
        }
        if (!res.data.storeKycVerified) {
          navigate(`users/${userId}/stores/${storeId}`);
        }
      })
      .catch((err) => {
        setKycStatusError(err as Error);
      })
      .finally(() => {
        setKycStatusLoading(false);
      });
  }, [
    userId,
    storeId,
    user,
    loading,
    userDocLoading,
    storeDocLoading,
    itemDocLoading,
    configDocLoading,
    navigate,
    setKycStatus,
    setKycStatusError,
    setKycStatusLoading,
  ]);

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
          <Button
            color="primary"
            variant="contained"
            size="large"
            onClick={handleSubmit(onSubmit)}
            disabled={!(kycStatus.userKycVerified && kycStatus.storeKycVerified)}
          >
            編集して保存
          </Button>
        </Stack>
      </Container>
      <LoadingOverlay
        open={loading || userDocLoading || storeDocLoading || itemDocLoading || kycStatusLoading || configDocLoading}
      />
      <ErrorDialog open={!!error} error={error} />
      <ErrorDialog open={!!userDocError} error={userDocError} />
      <ErrorDialog open={!!storeDocError} error={storeDocError} />
      <ErrorDialog open={!!itemDocError} error={itemDocError} />
      <ErrorDialog open={!!kycStatusError} error={kycStatusError} />
      <ErrorDialog open={!!configDocError} error={configDocError} />
      <ErrorDialog open={!!submitError} error={submitError} />
    </>
  );
};

export default ItemUpdate;
