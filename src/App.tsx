import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppHeader from './components/ui/AppHeader';
import AppFooter from './components/ui/AppFooter';
import Home from './components/page/Home';
import SignUp from './components/page/SignUp';
import SignIn from './components/page/SignIn';
import PasswordReset from './components/page/PasswordReset';
import PasswordUpdate from './components/page/PasswordUpdate';
import User from './components/page/User';
import UserCreate from './components/page/UserCreate';
import UserUpdate from './components/page/UserUpdate';
import Store from './components/page/Store';
import StoreCreate from './components/page/StoreCreate';
import StoreUpdate from './components/page/StoreUpdate';
import ItemCreate from './components/page/ItemCreate';
import ItemUpdate from './components/page/ItemUpdate';
import Items from './components/page/Items';
import Item from './components/page/Item';

const App = () => (
  <BrowserRouter>
    <AppHeader />
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/sign-up/" element={<SignUp />} />
      <Route path="/sign-in/" element={<SignIn />} />
      <Route path="/password-reset/" element={<PasswordReset />} />
      <Route path="/password-update/" element={<PasswordUpdate />} />

      <Route path="/users/:userId/create" element={<UserCreate />} />
      <Route path="/users/:userId/update" element={<UserUpdate />} />
      <Route path="/users/:userId" element={<User />} />

      <Route path="/users/:userId/stores/:storeId/create" element={<StoreCreate />} />
      <Route path="/users/:userId/stores/:storeId/update" element={<StoreUpdate />} />
      <Route path="/users/:userId/stores/:storeId" element={<Store />} />

      <Route path="/users/:userId/stores/:storeId/items/create" element={<ItemCreate />} />
      <Route path="/users/:userId/stores/:storeId/items/:itemId/update" element={<ItemUpdate />} />
      <Route path="/users/:userId/stores/:storeId/items/:itemId" element={<Item />} />
      <Route path="/users/:userId/stores/:storeId/items" element={<Items />} />

      <Route path="/users/:userId/orders/create" element={<Store />} />
      <Route path="/users/:userId/orders/:orderId/update" element={<Store />} />
      <Route path="/users/:userId/orders/:orderId" element={<Store />} />
    </Routes>
    <AppFooter />
  </BrowserRouter>
);

export default App;
