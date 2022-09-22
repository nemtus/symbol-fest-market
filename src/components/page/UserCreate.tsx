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
import db, { auth, doc, setDoc } from '../../configs/firebase';
import LoadingOverlay from '../ui/LoadingOverlay';
import ErrorDialog from '../ui/ErrorDialog';

interface UserCreateFormInput {
  name: string;
  phoneNumber: string;
  zipCode: string;
  address1: string;
  address2: string;
  symbolAddress: string;
}

const schema = yup.object({
  name: yup.string().required('必須です'),
  phoneNumber: yup
    .string()
    .required('必須です')
    .matches(
      /^(((0(\d{1}[-(]?\d{4}|\d{2}[-(]?\d{3}|\d{3}[-(]?\d{2}|\d{4}[-(]?\d{1}|[5789]0[-(]?\d{4})[-)]?)|\d{1,4}-?)\d{4}|0120[-(]?\d{3}[-)]?\d{3})$/,
      '有効な日本の電話番号を入力してください',
    ),
  zipCode: yup
    .string()
    .required('必須です')
    .matches(/^\d{7}$/, '郵便番号は7桁の半角数字でハイフン無しで入力してください'),
  address1: yup.string().required('必須です'),
  address2: yup.string().required('必須です'),
  symbolAddress: yup
    .string()
    .required('必須です')
    .matches(/^T[A-Z0-9]{38}$/, 'SymbolアドレスはTから始まる39文字の半角大文字英数字で入力してください'),
});

const UserCreate = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, loading, error] = useAuthState(auth);
  const [userDoc, userDocLoading, userDocError] = useDocument(doc(db, 'users', userId || ''), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserCreateFormInput>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const onSubmit: SubmitHandler<UserCreateFormInput> = async (data) => {
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
    await setDoc(userDocRef, { userId, email: user.email, ...data }, { merge: true });
    navigate(`/users/${userId}`);
  };

  if (!userId || !user?.uid || userId !== user?.uid) {
    return null;
  }

  return (
    <>
      <Container maxWidth="sm">
        <h2>プロフィール登録</h2>
        <Stack spacing={3}>
          <TextField
            required
            label="氏名"
            type="text"
            {...register('name')}
            error={'name' in errors}
            helperText={errors.name?.message}
          />
          <TextField
            required
            label="電話番号"
            type="text"
            {...register('phoneNumber')}
            error={'phoneNumber' in errors}
            helperText={errors.phoneNumber?.message}
          />
          <TextField
            required
            label="郵便番号"
            type="text"
            {...register('zipCode')}
            error={'zipCode' in errors}
            helperText={errors.zipCode?.message}
          />
          <TextField
            required
            label="住所(都道府県市区町村)"
            type="text"
            {...register('address1')}
            error={'address1' in errors}
            helperText={errors.address1?.message}
          />
          <TextField
            required
            label="住所(番地・建物名・部屋番号)"
            type="text"
            {...register('address2')}
            error={'address2' in errors}
            helperText={errors.address2?.message}
          />
          <TextField
            required
            label="Symbolアドレス(テストネット)"
            type="text"
            {...register('symbolAddress')}
            error={'symbolAddress' in errors}
            helperText={errors.symbolAddress?.message}
          />
          <Button color="primary" variant="contained" size="large" onClick={handleSubmit(onSubmit)}>
            登録して保存
          </Button>
        </Stack>
      </Container>
      <LoadingOverlay open={loading || userDocLoading} />
      <ErrorDialog open={!!error} error={error} />
      <ErrorDialog open={!!userDocError} error={userDocError} />
    </>
  );
};

export default UserCreate;
