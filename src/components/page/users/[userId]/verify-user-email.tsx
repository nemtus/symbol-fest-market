import { Button, Container, Stack } from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocument } from 'react-firebase-hooks/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import db, { auth, functions, httpsCallable, doc } from '../../../../configs/firebase';
import LoadingOverlay from '../../../ui/LoadingOverlay';
import ErrorDialog from '../../../ui/ErrorDialog';

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

const VerifyUserEmail = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [userDoc, userDocLoading, userDocError] = useDocument(doc(db, 'users', userId ?? ''), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [emailVerifiedLoading, setEmailVerifiedLoading] = useState<boolean>(false);
  const [emailVerifiedError, setEmailVerifiedError] = useState<Error | undefined>(undefined);
  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (!(!loading && user && userId && userId === user.uid)) {
      navigate('/auth/sign-in/');
      return;
    }
    setEmailVerifiedLoading(true);
    httpsOnCallVerifyKyc({ userId, storeId: userId })
      .then((res) => {
        const emailVerifiedResult = res.data.emailVerified;
        setEmailVerified(emailVerifiedResult);
        if (!emailVerifiedResult) {
          throw Error('ご登録のメールアドレス宛に届いている認証メールのリンクをクリックした後、再度お試しください。');
        }
        if (userDoc === undefined) {
          return;
        }
        if (emailVerifiedResult && userDoc.exists()) {
          navigate(`/users/${userId}`);
        } else {
          navigate(`/users/${userId}/create`);
        }
      })
      .catch((err) => {
        setEmailVerifiedError(err as Error);
      })
      .finally(() => {
        setEmailVerifiedLoading(false);
      });
  }, [user, loading, userDoc, userId, setEmailVerified, navigate]);

  const handleEmailVerify = () => {
    setEmailVerifiedLoading(true);
    if (!user?.uid) {
      setEmailVerifiedError(Error("Can't get user id"));
      return;
    }
    httpsOnCallVerifyKyc({ userId: user.uid, storeId: user.uid })
      .then((res) => {
        const emailVerifiedResult = res.data.emailVerified;
        setEmailVerified(emailVerifiedResult);
        if (!emailVerifiedResult) {
          throw Error('ご登録のメールアドレス宛に届いている認証メールのリンクをクリックした後、再度お試しください。');
        }
        if (userDoc === undefined) {
          return;
        }
        if (emailVerifiedResult && userDoc.exists()) {
          navigate(`/users/${user.uid}`);
        } else {
          navigate(`/users/${user.uid}/create`);
        }
      })
      .catch((err) => {
        setEmailVerifiedError(err as Error);
      })
      .finally(() => {
        setEmailVerifiedLoading(false);
      });
  };

  return (
    <>
      <Container maxWidth="sm">
        <h2>メールアドレス確認</h2>
        <Stack spacing={3}>
          <Button color="primary" variant="contained" size="large" onClick={handleEmailVerify} disabled={emailVerified}>
            メールアドレス確認
          </Button>
        </Stack>
      </Container>
      <LoadingOverlay open={loading || userDocLoading || emailVerifiedLoading} />
      <ErrorDialog open={!!error} error={error} />
      <ErrorDialog open={!!userDocError} error={userDocError} />
      <ErrorDialog open={!!emailVerifiedError} error={emailVerifiedError} />
    </>
  );
};

export default VerifyUserEmail;
