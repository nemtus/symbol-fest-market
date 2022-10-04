/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Container, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, functions, httpsCallable } from '../../../../../../configs/firebase';
import LoadingOverlay from '../../../../../ui/LoadingOverlay';
import ErrorDialog from '../../../../../ui/ErrorDialog';

interface VerifyStorePhoneNumberFormInput {
  storePhoneNumberSecret: string;
}

interface ChallengeToVerifyStorePhoneNumberRequest {
  userId: string;
  storeId: string;
  storePhoneNumberSecret: string;
}

interface ChallengeToVerifyStorePhoneNumberResponse {
  storePhoneNumberVerified: boolean;
}

const httpsOnCallChallengeToVerifyStorePhoneNumber = httpsCallable<
  ChallengeToVerifyStorePhoneNumberRequest,
  ChallengeToVerifyStorePhoneNumberResponse
>(functions, 'httpsOnCallChallengeToVerifyStorePhoneNumber');

const schema = yup.object({
  storePhoneNumberSecret: yup
    .string()
    .required('必須です')
    .matches(/^[0-9]{6}$/, '数字6桁で入力してください'),
});

const VerifyStorePhoneNumber = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyStorePhoneNumberFormInput>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const { userId, storeId } = useParams();
  const navigate = useNavigate();
  const [user, loadingUser, errorUser] = useAuthState(auth);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (loadingUser) {
      return;
    }
    if (!(user && userId && userId === user.uid)) {
      navigate('/auth/sign-in/');
      return;
    }
    if (userId !== storeId) {
      navigate(`/users/${userId}`);
    }
  });

  const onSubmit: SubmitHandler<VerifyStorePhoneNumberFormInput> = (data) => {
    const { storePhoneNumberSecret } = data;
    if (!userId) {
      return;
    }
    if (!storeId) {
      return;
    }
    const challengeToVerifyStorePhoneNumberRequest: ChallengeToVerifyStorePhoneNumberRequest = {
      userId,
      storeId,
      storePhoneNumberSecret,
    };
    httpsOnCallChallengeToVerifyStorePhoneNumber(challengeToVerifyStorePhoneNumberRequest)
      .then((res) => {
        if (res.data.storePhoneNumberVerified) {
          navigate(`/users/${userId}/stores/${storeId}/`);
        }
      })
      .catch((err) => {
        setError(err as Error);
      });
  };

  const handleCancel = () => {
    navigate(`/users/${userId}/stores/${storeId}/`);
  };

  return (
    <>
      <Container maxWidth="sm">
        <h2>店舗電話番号確認</h2>
        <Stack spacing={3}>
          <TextField
            required
            label="確認コード"
            type="text"
            {...register('storePhoneNumberSecret')}
            error={'storePhoneNumberSecret' in errors}
            helperText={errors.storePhoneNumberSecret?.message}
          />
          <Button color="primary" variant="contained" size="large" onClick={handleSubmit(onSubmit)}>
            確認
          </Button>
          <Button color="primary" variant="contained" size="large" onClick={handleCancel}>
            キャンセル
          </Button>
        </Stack>
      </Container>
      <LoadingOverlay open={loadingUser} />
      <ErrorDialog open={!!errorUser} error={errorUser} />
      <ErrorDialog open={!!error} error={error} />
    </>
  );
};

export default VerifyStorePhoneNumber;
