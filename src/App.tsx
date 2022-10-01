import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppHeader from './components/ui/AppHeader';
import AppFooter from './components/ui/AppFooter';
import Home from './components/page/home';
import SignUp from './components/page/auth/sign-up';
import SignIn from './components/page/auth/sign-in';
import PasswordReset from './components/page/auth/password-reset';
import PasswordUpdate from './components/page/auth/password-update';
import User from './components/page/users/[userId]';
import UserCreate from './components/page/users/[userId]/create';
import UserUpdate from './components/page/users/[userId]/update';
import Store from './components/page/users/[userId]/stores/[storeId]';
import StoreCreate from './components/page/users/[userId]/stores/[storeId]/create';
import StoreUpdate from './components/page/users/[userId]/stores/[storeId]/update';
import ItemCreate from './components/page/users/[userId]/stores/[storeId]/items/[itemId]/create';
import ItemUpdate from './components/page/users/[userId]/stores/[storeId]/items/[itemId]/update';
import Items from './components/page/users/[userId]/stores/[storeId]/items';
import Item from './components/page/users/[userId]/stores/[storeId]/items/[itemId]';
import VerifyUserEmail from './components/page/users/[userId]/verify-user-email';

const App = () => (
  <BrowserRouter>
    <AppHeader />
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/auth/sign-up/" element={<SignUp />} />
      <Route path="/auth/sign-in/" element={<SignIn />} />
      <Route path="/auth/password-reset/" element={<PasswordReset />} />
      <Route path="/auth/password-update/" element={<PasswordUpdate />} />

      <Route path="/users/:userId/create" element={<UserCreate />} />
      <Route path="/users/:userId/update" element={<UserUpdate />} />
      <Route path="/users/:userId/verify-user-email" element={<VerifyUserEmail />} />
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
