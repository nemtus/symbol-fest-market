import React from 'react';
import { Link } from 'react-router-dom';

const SignUp = () => (
  <>
    <h1>新規登録</h1>
    {/* Todo: 新規登録フォームの作成 */}
    <div>
      ログインは<Link to="/sign-in/">こちら</Link>
    </div>
    <div>
      <Link to="/">ホームに戻る</Link>
    </div>
  </>
);

export default SignUp;
