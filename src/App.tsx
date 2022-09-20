import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import SignUp from './SignUp';
import SignIn from './SignIn';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sign-up/" element={<SignUp />} />
      <Route path="/sign-in/" element={<SignIn />} />
    </Routes>
  </BrowserRouter>
);

export default App;
