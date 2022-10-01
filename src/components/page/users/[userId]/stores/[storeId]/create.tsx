/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocument } from 'react-firebase-hooks/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Container, Stack, TextField } from '@mui/material';
import * as yup from 'yup';
import { useEffect } from 'react';
import db, { auth, doc, setDoc } from '../../../../../../configs/firebase';
import LoadingOverlay from '../../../../../ui/LoadingOverlay';
import ErrorDialog from '../../../../../ui/ErrorDialog';

interface StoreCreateFormInput {
  storeName: string;
  storeEmail: string;
  storePhoneNumber: string;
  storeZipCode: string;
  storeAddress1: string;
  storeAddress2: string;
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
  storeSymbolAddress: yup
    .string()
    .required('必須です')
    .matches(/^T[A-Z0-9]{38}$/, 'SymbolアドレスはTから始まる39文字の半角大文字英数字で入力してください'),
  storeDescription: yup.string().required('必須です'),
});

const StoreCreate = () => {
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreCreateFormInput>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const onSubmit: SubmitHandler<StoreCreateFormInput> = async (data) => {
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
      throw Error('Invalid userId');
    }
    if (storeId !== userId) {
      throw Error('storeId is not match with userId');
    }
    const storeDocRef = storeDoc?.ref;
    if (!storeDocRef) {
      throw Error("Can't get user document reference");
    }

    await setDoc(storeDocRef, { storeId, ...data }, { merge: true });
    navigate(`/users/${userId}/stores/${storeId}`);
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

  if (userId !== storeId) {
    return null;
  }

  return (
    <>
      <Container maxWidth="sm">
        <h2>店舗登録</h2>
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
            label="店舗Symbolアドレス(テストネット)"
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
            登録して保存
          </Button>
        </Stack>
      </Container>
      <LoadingOverlay open={loading || userDocLoading || storeDocLoading} />
      <ErrorDialog open={!!error} error={error} />
      <ErrorDialog open={!!userDocError} error={userDocError} />
      <ErrorDialog open={!!storeDocError} error={storeDocError} />
    </>
  );
};

export default StoreCreate;
