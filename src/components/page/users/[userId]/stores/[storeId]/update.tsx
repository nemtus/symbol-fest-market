/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocument } from 'react-firebase-hooks/firestore';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Container, Stack, TextField } from '@mui/material';
import * as yup from 'yup';
import { useEffect, useState } from 'react';
import db, { auth, doc, setDoc } from '../../../../../../configs/firebase';
import { SYMBOL_NETWORK_NAME, SYMBOL_ADDRESS_REG_EXP, SYMBOL_PREFIX } from '../../../../../../configs/symbol';
import LoadingOverlay from '../../../../../ui/LoadingOverlay';
import ErrorDialog from '../../../../../ui/ErrorDialog';

interface StoreUpdateFormInput {
  storeName: string;
  storeEmail: string;
  storePhoneNumber: string;
  storeZipCode: string;
  storeAddress1: string;
  storeAddress2: string;
  storeUrl: string;
  storeSymbolAddress: string;
  storeDescription: string;
  storeImageFile: string;
  storeCoverImageFile: string;
}

const schema = yup.object({
  storeName: yup.string().required('必須です'),
  storeEmail: yup.string().required('必須です').email('メールアドレスの形式で入力してください'),
  storePhoneNumber: yup
    .string()
    .required('必須です')
    .matches(
      /^(((0(\d{1}[-(]?\d{4}|\d{2}[-(]?\d{3}|\d{3}[-(]?\d{2}|\d{4}[-(]?\d{1}|[5789]0[-(]?\d{4})[-)]?)|\d{1,4}-?)\d{4}|0120[-(]?\d{3}[-)]?\d{3})$/,
      '有効な日本の電話番号を入力してください',
    ),
  storeZipCode: yup
    .string()
    .required('必須です')
    .matches(/^\d{7}$/, '郵便番号は7桁の半角数字でハイフン無しで入力してください'),
  storeAddress1: yup.string().required('必須です'),
  storeAddress2: yup.string().required('必須です'),
  storeUrl: yup.string().required('必須です').url('URLの形式で入力してください'),
  storeSymbolAddress: yup
    .string()
    .required('必須です')
    .matches(
      SYMBOL_ADDRESS_REG_EXP,
      `Symbolアドレスは${SYMBOL_PREFIX}から始まる39文字の半角大文字英数字で入力してください`,
    ),
  storeDescription: yup.string().required('必須です'),
});

const StoreUpdate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, storeId } = useParams();
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
  const [configDoc, configDocLoading, configDocError] = useDocument(doc(db, 'configs/1'), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
  const [submitError, setSubmitError] = useState<Error | undefined>(undefined);

  const currentStoreFormInput: StoreUpdateFormInput = {
    storeName: location.state.storeName ?? '',
    storeEmail: location.state.storeEmail ?? '',
    storePhoneNumber: location.state.storePhoneNumber ?? '',
    storeZipCode: location.state.storeZipCode ?? '',
    storeAddress1: location.state.storeAddress1 ?? '',
    storeAddress2: location.state.storeAddress2 ?? '',
    storeUrl: location.state.storeUrl ?? '',
    storeSymbolAddress: location.state.storeSymbolAddress ?? '',
    storeDescription: location.state.storeDescription ?? '',
    storeImageFile: location.state.storeImageFile ?? '',
    storeCoverImageFile: location.state.storeCoverImageFile ?? '',
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreUpdateFormInput>({
    defaultValues: currentStoreFormInput,
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const onSubmit: SubmitHandler<StoreUpdateFormInput> = async (data) => {
    if (!configDoc?.data()?.enableCreateStore) {
      setSubmitError(Error('現在、店舗登録を受け付けていません。'));
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
      setSubmitError(Error('Invalid userId'));
      return;
    }
    if (storeId !== userId) {
      setSubmitError(Error('storeId is not match with userId'));
      return;
    }
    const storeDocRef = storeDoc?.ref;
    if (!storeDocRef) {
      setSubmitError(Error("Can't get user document reference"));
      return;
    }

    await setDoc(storeDocRef, { storeId, ...data }, { merge: true });
    navigate(`/users/${userId}/stores/${storeId}`);
  };

  useEffect(() => {
    if (loading || userDocLoading || storeDocLoading) {
      return;
    }

    if (!(user && userId && userId === user.uid)) {
      navigate('/auth/sign-in/');
      return;
    }

    if (userId !== storeId) {
      navigate(`/users/${userId}`);
    }
  }, [userId, storeId, user, loading, userDocLoading, storeDocLoading, navigate]);

  return (
    <>
      <Container maxWidth="sm">
        <h2>店舗編集</h2>
        <Stack spacing={3}>
          <TextField
            required
            label="店舗名"
            type="text"
            {...register('storeName')}
            error={'storeName' in errors}
            helperText={errors.storeName?.message}
          />
          <TextField
            required
            label="店舗メールアドレス"
            type="email"
            {...register('storeEmail')}
            error={'storeEmail' in errors}
            helperText={errors.storeEmail?.message}
          />
          <TextField
            required
            label="店舗電話番号"
            type="text"
            {...register('storePhoneNumber')}
            error={'storePhoneNumber' in errors}
            helperText={errors.storePhoneNumber?.message}
          />
          <TextField
            required
            label="店舗郵便番号"
            type="text"
            {...register('storeZipCode')}
            error={'storeZipCode' in errors}
            helperText={errors.storeZipCode?.message}
          />
          <TextField
            required
            label="店舗住所(都道府県市区町村)"
            type="text"
            {...register('storeAddress1')}
            error={'storeAddress1' in errors}
            helperText={errors.storeAddress1?.message}
          />
          <TextField
            required
            label="店舗住所(番地・建物名・部屋番号)"
            type="text"
            {...register('storeAddress2')}
            error={'storeAddress2' in errors}
            helperText={errors.storeAddress2?.message}
          />
          <TextField
            required
            label="店舗URL"
            type="text"
            {...register('storeUrl')}
            error={'storeUrl' in errors}
            helperText={errors.storeUrl?.message}
          />
          <TextField
            required
            label={`Symbolアドレス(${SYMBOL_NETWORK_NAME})`}
            type="text"
            {...register('storeSymbolAddress')}
            error={'storeSymbolAddress' in errors}
            helperText={errors.storeSymbolAddress?.message}
          />
          <TextField
            required
            label="店舗説明"
            type="text"
            {...register('storeDescription')}
            error={'storeSymbolAddress' in errors}
            helperText={errors.storeSymbolAddress?.message}
          />
          <Button color="primary" variant="contained" size="large" onClick={handleSubmit(onSubmit)}>
            編集して保存
          </Button>
        </Stack>
      </Container>
      <LoadingOverlay open={loading || userDocLoading || storeDocLoading || configDocLoading} />
      <ErrorDialog open={!!error} error={error} />
      <ErrorDialog open={!!userDocError} error={userDocError} />
      <ErrorDialog open={!!storeDocError} error={storeDocError} />
      <ErrorDialog open={!!configDocError} error={configDocError} />
      <ErrorDialog open={!!submitError} error={submitError} />
    </>
  );
};

export default StoreUpdate;
