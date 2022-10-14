import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

export interface ConfirmationDialogProps {
  title: string;
  message: string;
  onClose: (dialogResult: string) => void;
}

const ConfirmationDialog = (props: ConfirmationDialogProps) => {
  const { title, message, onClose } = props;

  return (
    <Dialog open onClose={() => onClose('cancel')}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose('ok')}>OK</Button>
        <Button onClick={() => onClose('cancel')}>キャンセル</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
