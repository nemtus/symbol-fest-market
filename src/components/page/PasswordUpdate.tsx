/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Container, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useAuthState, useUpdatePassword } from 'react-firebase-hooks/auth';
import { auth } from '../../configs/firebase';
import LoadingOverlay from '../ui/LoadingOverlay';
import ErrorDialog from '../ui/ErrorDialog';

interface PasswordUpdateFormInput {
  password: string;
}

const schema = yup.object({
  password: yup
    .string()
    .required('必須です')
    .min(16, '16文字以上で入力してください')
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&-._])[A-Za-z\d@$!%*#?&-._].*$/,
      '半角英数字記号 @$!%*#?&-._ を1文字以上含めてください',
    ),
});

const PasswordUpdate = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordUpdateFormInput>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const navigate = useNavigate();
  const [user, loadingUser, errorUser] = useAuthState(auth);
  const [updatePasswordSuccess, setUpdatePasswordSuccess] = useState<boolean>(false);
  const [updatePassword, loading, error] = useUpdatePassword(auth);

  useEffect(() => {
    if (errorUser) {
      navigate('/sign-in');
      return;
    }
    if (!user && !loadingUser) {
      navigate('/sign-in');
      return;
    }
    if (!user?.uid) {
      navigate('/sign-in');
    }
  });

  const onSubmit: SubmitHandler<PasswordUpdateFormInput> = async (data) => {
    await updatePassword(data.password);
    if (error) {
      return;
    }
    setUpdatePasswordSuccess(true);
  };

  return (
    <>
      <Container maxWidth="sm">
        <h2>パスワード変更</h2>
        <Stack spacing={3}>
          <TextField
            required
            label="新しいパスワード"
            type="password"
            {...register('password')}
            error={'password' in errors}
            helperText={errors.password?.message}
          />
          <Button
            color="primary"
            variant="contained"
            size="large"
            onClick={handleSubmit(onSubmit)}
            disabled={updatePasswordSuccess && !error}
          >
            パスワード変更
          </Button>
          {updatePasswordSuccess && !error ? <div>パスワードが変更されました。</div> : ''}
          <div>
            新規登録は<Link to="/sign-up/">こちら</Link>
          </div>
          <div>
            ログインは<Link to="/sign-in/">こちら</Link>
          </div>
          <div>
            <Link to="/">ホームに戻る</Link>
          </div>
        </Stack>
      </Container>
      <LoadingOverlay open={loading} />
      <ErrorDialog open={!!error} error={error} />
    </>
  );
};

export default PasswordUpdate;
