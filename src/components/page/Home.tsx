import { Link } from 'react-router-dom';
import { Container, Stack } from '@mui/material';

const Home = () => (
  <Container maxWidth="sm">
    <Stack spacing={3}>
      <h2>ホーム</h2>
      <div>
        新規登録は<Link to="/sign-up/">こちら</Link>
      </div>
      <div>
        ログインは<Link to="/sign-in/">こちら</Link>
      </div>
    </Stack>
  </Container>
);

export default Home;
