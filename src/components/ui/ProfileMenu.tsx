/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { IconButton, Menu, MenuItem } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import React, { useState } from 'react';
import { auth, signOut } from '../../configs/firebase';

const ProfileMenu = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUser = () => {
    handleClose();
    if (!user?.uid) {
      throw Error('Invalid userId');
    }
    navigate(`/users/${user?.uid}`);
  };

  const handlePasswordUpdate = () => {
    handleClose();
    navigate('/password-update');
  };

  const handleSignOut = () => {
    handleClose();
    signOut(auth)
      .then(() => {})
      .catch(() => {});
    navigate('/');
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return user ? (
    <>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <AccountCircleIcon />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleUser}>プロフィール</MenuItem>
        <MenuItem onClick={handlePasswordUpdate}>パスワード変更</MenuItem>
        <MenuItem onClick={handleSignOut}>ログアウト</MenuItem>
      </Menu>
    </>
  ) : null;
};

export default ProfileMenu;
