/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { Divider, IconButton, Menu, MenuItem, MenuList, ListItemIcon, ListItemText } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import LockResetIcon from '@mui/icons-material/LockReset';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ViewListIcon from '@mui/icons-material/ViewList';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
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

  const handleOrdersForUser = () => {
    handleClose();
    if (!user?.uid) {
      throw Error('Invalid userId');
    }
    navigate(`/users/${user?.uid}/orders`);
  };

  const handleStore = () => {
    handleClose();
    if (!user?.uid) {
      throw Error('Invalid userId');
    }
    navigate(`/users/${user?.uid}/stores/${user?.uid}`);
  };

  const handleItem = () => {
    handleClose();
    if (!user?.uid) {
      throw Error('Invalid userId');
    }
    navigate(`/users/${user?.uid}/stores/${user?.uid}/items`);
  };

  const handleOrdersForStore = () => {
    handleClose();
    if (!user?.uid) {
      throw Error('Invalid userId');
    }
    navigate(`/users/${user?.uid}/stores/${user?.uid}/orders`);
  };

  const handlePasswordUpdate = () => {
    handleClose();
    navigate('/auth/password-update/');
  };

  const handleSignOut = () => {
    handleClose();
    signOut(auth)
      .then(() => {})
      .catch(() => {});
    navigate('/');
  };

  const handleSignUp = () => {
    handleClose();
    navigate('/auth/sign-up/');
  };

  const handleSignIn = () => {
    handleClose();
    navigate('/auth/sign-in/');
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
        <MenuList>
          <MenuItem onClick={handleUser}>
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText>プロフィール</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleOrdersForUser}>
            <ListItemIcon>
              <ShoppingBagIcon />
            </ListItemIcon>
            <ListItemText>購入履歴</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleStore}>
            <ListItemIcon>
              <StorefrontIcon />
            </ListItemIcon>
            <ListItemText>店舗情報</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleItem}>
            <ListItemIcon>
              <CardGiftcardIcon />
            </ListItemIcon>
            <ListItemText>商品情報</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleOrdersForStore}>
            <ListItemIcon>
              <ViewListIcon />
            </ListItemIcon>
            <ListItemText>注文情報</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handlePasswordUpdate}>
            <ListItemIcon>
              <LockResetIcon />
            </ListItemIcon>
            <ListItemText>パスワード変更</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleSignOut}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText>ログアウト</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  ) : (
    <>
      <IconButton
        size="large"
        aria-label="auth menu icon"
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
        <MenuList>
          <MenuItem onClick={handleSignUp}>
            <ListItemIcon>
              <FiberNewIcon />
            </ListItemIcon>
            <ListItemText>新規登録</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSignIn}>
            <ListItemIcon>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText>ログイン</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
};

export default ProfileMenu;
