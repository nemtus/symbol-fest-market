import React from 'react';
import { Link } from 'react-router-dom';

const SignIn = () => (
  <>
    <h1>ログイン</h1>
    {/* Todo: ログインフォームの作成 */}
    <div>
      新規登録は<Link to="/sign-up/">こちら</Link>
    </div>
    <div>
      <Link to="/">ホームに戻る</Link>
    </div>
  </>
);

export default SignIn;
