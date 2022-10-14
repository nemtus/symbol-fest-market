import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import loadable from '@loadable/component';
import AppHeader from './components/ui/AppHeader';
import AppFooter from './components/ui/AppFooter';

const Home = loadable(() => import('./components/page/home'));
const SignUp = loadable(() => import('./components/page/auth/sign-up'));
const SignIn = loadable(() => import('./components/page/auth/sign-in'));
const PasswordReset = loadable(() => import('./components/page/auth/password-reset'));
const PasswordUpdate = loadable(() => import('./components/page/auth/password-update'));
const User = loadable(() => import('./components/page/users/[userId]'));
const UserCreate = loadable(() => import('./components/page/users/[userId]/create'));
const UserUpdate = loadable(() => import('./components/page/users/[userId]/update'));
const VerifyUserEmail = loadable(() => import('./components/page/users/[userId]/verify-user-email'));
const Store = loadable(() => import('./components/page/users/[userId]/stores/[storeId]'));
const StoreCreate = loadable(() => import('./components/page/users/[userId]/stores/[storeId]/create'));
const StoreUpdate = loadable(() => import('./components/page/users/[userId]/stores/[storeId]/update'));
const UploadStoreImage = loadable(() => import('./components/page/users/[userId]/stores/[storeId]/upload-store-image'));
const VerifyStoreEmail = loadable(() => import('./components/page/users/[userId]/stores/[storeId]/verify-store-email'));
const VerifyStorePhoneNumber = loadable(
  () => import('./components/page/users/[userId]/stores/[storeId]/verify-store-phone-number'),
);
const VerifyStoreAddress = loadable(
  () => import('./components/page/users/[userId]/stores/[storeId]/verify-store-address'),
);
const ItemCreate = loadable(() => import('./components/page/users/[userId]/stores/[storeId]/items/[itemId]/create'));
const ItemUpdate = loadable(() => import('./components/page/users/[userId]/stores/[storeId]/items/[itemId]/update'));
const UploadItemImage = loadable(
  () => import('./components/page/users/[userId]/stores/[storeId]/items/[itemId]/upload-item-image'),
);
const Items = loadable(() => import('./components/page/users/[userId]/stores/[storeId]/items'));
const Item = loadable(() => import('./components/page/users/[userId]/stores/[storeId]/items/[itemId]'));
const PublicStores = loadable(() => import('./components/page/stores'));
const PublicStore = loadable(() => import('./components/page/stores/[storeId]'));
const PublicItems = loadable(() => import('./components/page/stores/[storeId]/items'));
const PublicItem = loadable(() => import('./components/page/stores/[storeId]/items/[itemId]'));
const OrderForUser = loadable(() => import('./components/page/users/[userId]/orders/[orderId]'));
const OrdersForStore = loadable(() => import('./components/page/users/[userId]/stores/[storeId]/orders'));

const App = () => (
  <BrowserRouter>
    {/* <AuthStatusProvider> */}
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
      <Route path="/users/:userId/stores/:storeId/upload-store-image" element={<UploadStoreImage />} />
      <Route path="/users/:userId/stores/:storeId/verify-store-email" element={<VerifyStoreEmail />} />
      <Route path="/users/:userId/stores/:storeId/verify-store-phone-number" element={<VerifyStorePhoneNumber />} />
      <Route path="/users/:userId/stores/:storeId/verify-store-address" element={<VerifyStoreAddress />} />
      <Route path="/users/:userId/stores/:storeId" element={<Store />} />
      <Route path="/users/:userId/stores/:storeId/items/create" element={<ItemCreate />} />
      <Route path="/users/:userId/stores/:storeId/items/:itemId/update" element={<ItemUpdate />} />
      <Route path="/users/:userId/stores/:storeId/items/:itemId/upload-item-image" element={<UploadItemImage />} />
      <Route path="/users/:userId/stores/:storeId/items/:itemId" element={<Item />} />
      <Route path="/users/:userId/stores/:storeId/items" element={<Items />} />
      <Route path="/users/:userId/stores/:storeId/orders" element={<OrdersForStore />} />
      <Route path="/users/:userId/orders/create" element={<Store />} />
      <Route path="/users/:userId/orders/:orderId" element={<OrderForUser />} />
      <Route path="/stores/:storeId/items/:itemId" element={<PublicItem />} />
      <Route path="/stores/:storeId/items" element={<PublicItems />} />
      <Route path="/stores/:storeId" element={<PublicStore />} />
      <Route path="/stores" element={<PublicStores />} />
    </Routes>
    <AppFooter />
    {/* </AuthStatusProvider> */}
  </BrowserRouter>
);

export default App;
