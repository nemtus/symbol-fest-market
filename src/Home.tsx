import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <>
    <h1>ホーム</h1>
    <div>
      新規登録は<Link to="/sign-up/">こちら</Link>
    </div>
    <div>
      ログインは<Link to="/sign-in/">こちら</Link>
    </div>
  </>
);

export default Home;
