/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Container, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useSendPasswordResetEmail } from 'react-firebase-hooks/auth';
import { auth } from '../../../configs/firebase';
import LoadingOverlay from '../../ui/LoadingOverlay';
import ErrorDialog from '../../ui/ErrorDialog';

interface PasswordResetFormInput {
  email: string;
}

const schema = yup.object({
  email: yup.string().required('必須です').email('メールアドレスの形式で入力してください'),
});

const PasswordReset = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetFormInput>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const [sendPasswordResetEmail, loading, error] = useSendPasswordResetEmail(auth);

  const [passwordResetEmailSent, setPasswordResetEmailSent] = useState<boolean>(false);

  const onSubmit: SubmitHandler<PasswordResetFormInput> = async (data) => {
    await sendPasswordResetEmail(data.email);
    if (error) {
      return;
    }
    setPasswordResetEmailSent(true);
  };

  return (
    <>
      <Container maxWidth="sm">
        <h2>パスワードリセット</h2>
        <Stack spacing={3}>
          <TextField
            required
            label="メールアドレス"
            type="email"
            {...register('email')}
            error={'email' in errors}
            helperText={errors.email?.message}
          />
          <Button
            color="primary"
            variant="contained"
            size="large"
            onClick={handleSubmit(onSubmit)}
            disabled={passwordResetEmailSent && !error}
          >
            パスワードリセットメール送信
          </Button>
          {passwordResetEmailSent && !error ? (
            <div>
              パスワードリセットメールが送信されました。メール内リンクからパスワードリセットの手続きをお願いします。
            </div>
          ) : (
            ''
          )}
          <div>
            新規登録は<Link to="/auth/sign-up/">こちら</Link>
          </div>
          <div>
            ログインは<Link to="/auth/sign-in/">こちら</Link>
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

export default PasswordReset;
