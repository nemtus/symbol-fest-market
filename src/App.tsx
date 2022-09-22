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

const App = () => (
  <BrowserRouter>
    <AppHeader />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sign-up/" element={<SignUp />} />
      <Route path="/sign-in/" element={<SignIn />} />
      <Route path="/password-reset/" element={<PasswordReset />} />
      <Route path="/password-update/" element={<PasswordUpdate />} />
      <Route path="/users/">
        <Route path=":userId/create" element={<UserCreate />} />
        <Route path=":userId/update" element={<UserUpdate />} />
        <Route path=":userId" element={<User />}>
          <Route path="shopping-cart" />
          <Route path="orders" />
        </Route>
      </Route>
      <Route path="/stores/">
        <Route path="create" />
        <Route path=":storeId/update" />
        <Route path=":storeId">
          <Route path="items">
            <Route path="create" />
            <Route path=":itemId">
              <Route path="update" />
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
    <AppFooter />
  </BrowserRouter>
);

export default App;
