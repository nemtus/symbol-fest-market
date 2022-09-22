import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AppMenuDrawer = () => {
  const navigate = useNavigate();
  const [anchorOpen, setAnchorOpen] = useState<boolean>(false);

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setAnchorOpen(open);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const menuListData = [
    {
      key: 'home',
      label: 'ホーム',
      icon: <HomeIcon />,
      path: '/',
    },
  ];

  return (
    <Drawer anchor="left" open={anchorOpen} onClose={toggleDrawer(false)}>
      <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
        {menuListData.map((menu) => (
          <List>
            <ListItem key={menu.key} disablePadding>
              <ListItemButton
                onClick={() => {
                  handleNavigate(menu.path);
                }}
              >
                <ListItemIcon>{menu.icon}</ListItemIcon>
                <ListItemText primary={menu.label} />
              </ListItemButton>
            </ListItem>
          </List>
        ))}
      </Box>
    </Drawer>
  );
};

export default AppMenuDrawer;
