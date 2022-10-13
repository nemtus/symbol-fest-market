import { Container, Stack } from '@mui/material';
import EventCard from '../../ui/EventCard';
import AuthCard from '../../ui/AuthCard';
import PublicStores from '../stores';

const Home = () => (
  <Container maxWidth="sm">
    <Stack spacing={3}>
      <EventCard />
      <AuthCard />
      <PublicStores />
    </Stack>
  </Container>
);

export default Home;
