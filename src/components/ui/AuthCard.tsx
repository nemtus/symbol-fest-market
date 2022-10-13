import { Link } from 'react-router-dom';
import { Box, Card, CardActions, CardContent, Button, Typography } from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../configs/firebase';

const AuthCard = () => {
  const [authUser] = useAuthState(auth);

  if (authUser) {
    return null;
  }

  return (
    <Box maxWidth="sm">
      <Card>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            新規登録・ログイン
          </Typography>
          <Typography variant="body1" color="text.secondary">
            買い物のためには事前に発送先情報を登録し、ログインしておく必要があります。予め以下から新規登録・ログインをお願いします。
          </Typography>
          <Typography variant="body2" color="text.secondary">
            登録してくださった個人情報は買い物した店舗に対してのみ商品の発送のために共有されます。
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="large" component={Link} to="/auth/sign-up/" color="primary" variant="contained">
            新規登録
          </Button>
          <Button size="large" component={Link} to="/auth/sign-in/" color="primary" variant="contained">
            ログイン
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default AuthCard;
