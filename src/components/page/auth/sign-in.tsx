/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Container, Stack, TextField } from '@mui/material';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '../../../configs/firebase';
import LoadingOverlay from '../../ui/LoadingOverlay';
import ErrorDialog from '../../ui/ErrorDialog';

interface SignInFormInput {
  email: string;
  password: string;
}

const schema = yup.object({
  email: yup.string().required('必須です').email('メールアドレスの形式で入力してください'),
  password: yup
    .string()
    .required('必須です')
    .min(16, '16文字以上で入力してください')
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&-._])[A-Za-z\d@$!%*#?&-._].*$/,
      '半角英数字記号 @$!%*#?&-._ を1文字以上含めてください',
    ),
});

const SignIn = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormInput>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const [signInWithEmailAndPassword, userCredential, loading, error] = useSignInWithEmailAndPassword(auth);

  useEffect(() => {
    if (!userCredential) {
      return;
    }
    if (!userCredential?.user) {
      return;
    }
    if (!userCredential?.user?.uid) {
      return;
    }
    if (!userCredential.user.emailVerified) {
      navigate(`/users/${userCredential.user.uid}/verify-user-email`);
      return;
    }
    navigate(`/users/${userCredential?.user?.uid}`);
  }, [userCredential, navigate]);

  const onSubmit: SubmitHandler<SignInFormInput> = async (data) => {
    await signInWithEmailAndPassword(data.email, data.password);
  };

  return (
    <>
      <Container maxWidth="sm">
        <h2>ログイン</h2>
        <Stack spacing={3}>
          <TextField
            required
            label="メールアドレス"
            type="email"
            {...register('email')}
            error={'email' in errors}
            helperText={errors.email?.message}
          />
          <TextField
            required
            label="パスワード"
            type="password"
            {...register('password')}
            error={'password' in errors}
            helperText={errors.password?.message}
          />
          <Button color="primary" variant="contained" size="large" onClick={handleSubmit(onSubmit)}>
            ログイン
          </Button>
          <div>
            新規登録は<Link to="/auth/sign-up/">こちら</Link>
          </div>
          <div>
            パスワードをお忘れの方は<Link to="/auth/password-reset/">こちら</Link>
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

export default SignIn;
