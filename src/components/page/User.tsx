/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocument } from 'react-firebase-hooks/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Container, Stack, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import db, { auth, doc } from '../../configs/firebase';
import LoadingOverlay from '../ui/LoadingOverlay';
import ErrorDialog from '../ui/ErrorDialog';

interface UserInterface {
  userId: string;
  email: string;
  name: string;
  phoneNumber: string;
  zipCode: string;
  address1: string;
  address2: string;
  symbolAddress: string;
}

const User = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, loading, error] = useAuthState(auth);
  const [userDoc, userDocLoading, userDocError] = useDocument(doc(db, 'users', userId || ''), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText((userDoc?.data()?.symbolAddress as string) || '');
  };

  const handleClick = () => {
    if (!userId) {
      throw Error('Invalid userId');
    }
    navigate(`/users/${userId}/update`, {
      state: {
        name: userDoc?.data()?.name ?? '',
        phoneNumber: userDoc?.data()?.phoneNumber ?? '',
        zipCode: userDoc?.data()?.zipCode ?? '',
        address1: userDoc?.data()?.address1 ?? '',
        address2: userDoc?.data()?.address2 ?? '',
        symbolAddress: userDoc?.data()?.symbolAddress ?? '',
      },
    });
  };

  if (!userId || !user?.uid || userId !== user?.uid) {
    return null;
  }

  return (
    <>
      <Container maxWidth="sm">
        <h2>連絡先・配送先</h2>
        <Stack>
          <div>
            <h3>メールアドレス</h3>
            <div>{userDoc?.data()?.email}</div>
          </div>
          <div>
            <h3>氏名</h3>
            <div>{userDoc?.data()?.name}</div>
          </div>
          <div>
            <h3>電話番号</h3>
            <div>{userDoc?.data()?.phoneNumber}</div>
          </div>
          <div>
            <h3>郵便番号</h3>
            <div>{userDoc?.data()?.zipCode}</div>
          </div>
          <div>
            <h3>住所(都道府県市区町村)</h3>
            <div>{userDoc?.data()?.address1}</div>
          </div>
          <div>
            <h3>住所(番地・建物名・部屋番号)</h3>
            <div>{userDoc?.data()?.address2}</div>
          </div>
          <div>
            <h3>Symbolアドレス(テストネット)</h3>
            <div style={{ fontSize: 12 }}>
              {userDoc?.data()?.symbolAddress}
              <IconButton
                onClick={async () => {
                  await handleCopy();
                }}
              >
                <ContentCopyIcon />
              </IconButton>
            </div>
          </div>
          <Button color="primary" variant="contained" size="large" onClick={handleClick}>
            編集
          </Button>
        </Stack>
      </Container>
      <LoadingOverlay open={loading || userDocLoading} />
      <ErrorDialog open={!!error} error={error} />
    </>
  );
};

export default User;
