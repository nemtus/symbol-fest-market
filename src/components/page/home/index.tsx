import { Link } from 'react-router-dom';
import { Container, Stack } from '@mui/material';
import PublicStores from '../stores';

const Home = () => (
  <Container maxWidth="sm">
    <Stack spacing={3}>
      <h2>ホーム</h2>
      <div>
        新規登録は<Link to="/auth/sign-up/">こちら</Link>
      </div>
      <div>
        ログインは<Link to="/auth/sign-in/">こちら</Link>
      </div>
    </Stack>
    <PublicStores />
  </Container>
);

export default Home;
