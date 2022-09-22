import ErrorIcon from '@mui/icons-material/Error';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  error: Error | undefined;
}

const ErrorDialog = (props: Props) => {
  const { open, error } = props;

  const [dialogOpen, setDialogOpen] = useState(open);
  const [dialogError, setDialogError] = useState(error);

  useEffect(() => {
    setDialogOpen(open);
    setDialogError(error);
  }, [open, error]);

  const handleClose = () => {
    setDialogOpen(false);
  };

  if (!dialogError) {
    return null;
  }

  return (
    <Dialog open={dialogOpen} onClose={handleClose}>
      <DialogTitle>
        <ErrorIcon color="error" />
        エラー
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{dialogError.message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;
