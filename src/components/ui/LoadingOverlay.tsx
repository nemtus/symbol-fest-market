import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

interface Props {
  open: boolean;
}

const LoadingOverlay = (props: Props) => {
  const { open } = props;
  return (
    <Backdrop open={open}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default LoadingOverlay;
