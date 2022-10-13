import { Box, Card, CardActions, CardContent, CardMedia, Button, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import TwitterIcon from '@mui/icons-material/Twitter';

const EventCard = () => {
  const handleClickEventInfo = () => {
    window.open('https://nemtus.com/nemtus-fall-festival-to-be-held/', '_blank');
  };

  const handleClickNemtusHomePage = () => {
    window.open('https://nemtus.com/', '_blank');
  };

  const handleClickNemtusTwitter = () => {
    window.open('https://twitter.com/NemtusOfficial', '_blank');
  };

  return (
    <Box maxWidth="sm">
      <Card>
        <CardMedia
          component="img"
          image="https://3.bp.blogspot.com/-jSl412zL-hk/VSufNcT3_SI/AAAAAAAAs4A/W8y-bSva7oE/s800/ichiba_marusye.png"
          alt="Symbol Fest Marketイメージ画像"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Symbol Fest Marketにようこそ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            NPO法人NEMTUSが主催するSymbol秋祭りにて開催されるイベント当日限定の物販イベントです。発送先情報を予め登録しておくことで、Symbol決済にて、各種商品を購入可能です。イベント参加の記念やお土産の購入をぜひSymbol決済とともにご体験ください。
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={handleClickEventInfo}>
            イベント詳細
          </Button>
          <Button size="small" onClick={handleClickNemtusHomePage} startIcon={<HomeIcon />}>
            公式サイト
          </Button>
          <Button size="small" onClick={handleClickNemtusTwitter} startIcon={<TwitterIcon />}>
            Twitter
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default EventCard;
