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
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '../../configs/firebase';
import LoadingOverlay from '../ui/LoadingOverlay';
import ErrorDialog from '../ui/ErrorDialog';

interface SignUpFormInput {
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

const SignUp = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormInput>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const [createUserWithEmailAndPassword, userCredential, loading, error] = useCreateUserWithEmailAndPassword(auth, {
    sendEmailVerification: true,
  });

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
    navigate(`/users/${userCredential?.user?.uid}/create`);
  });

  const onSubmit: SubmitHandler<SignUpFormInput> = async (data) => {
    await createUserWithEmailAndPassword(data.email, data.password);
  };

  return (
    <>
      <Container maxWidth="sm">
        <h2>新規登録</h2>
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
            新規登録
          </Button>
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

export default SignUp;
