import { useState, useRef, useContext } from 'react';
import AuthContext from '../../store/auth-context';
import classes from './AuthForm.module.css';
import { useHistory } from 'react-router-dom';


const AuthForm = () => {
  const emailInputRef = useRef();
  const passwordInputRef = useRef();

  const history = useHistory();
  const authCtx = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };

  const submitHandler = event => {
    event.preventDefault();


    const entredEmail = emailInputRef.current.value;
    const entredPassword = passwordInputRef.current.value;

    setIsLoading(true);
    let url = '';
    if(isLogin)  {
      url = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyC-DIpysFoLlRAhuDbabC9MotfNIqzZ6SU';
      
    }
    else {
      url = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyC-DIpysFoLlRAhuDbabC9MotfNIqzZ6SU';
      
    }
    fetch(url ,{
      method: 'POST',
      body: JSON.stringify({
        email: entredEmail,
        password: entredPassword,
        returnSecureToken: true
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => {
      setIsLoading(false);
      if(response.ok) {
        return response.json();
      }else {
        
        return response.json().then(data => {
          let errorMessage = 'Authentication failed!';

          if(data  &&  data.error && data.error.message) {
              errorMessage = data.error.message;
          }
          
          throw new Error(errorMessage);
        });
      }
    }).then(data => {
      const expireationTime = new Date(new Date().getTime() + (data.expiresIn * 1000));
      authCtx.login(data.idToken, expireationTime.toISOString());
      history.replace('/');

    })
    .catch(err => {
      alert(err.message);
    });
  };


  return (
    <section className={classes.auth}>
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor='email'>Your Email</label>
          <input type='email' id='email' ref={emailInputRef} required />
        </div>
        <div className={classes.control}>
          <label htmlFor='password'>Your Password</label>
          <input type='password' id='password' ref={passwordInputRef} required />
        </div>
        <div className={classes.actions}>
          {!isLoading && <button>{isLogin ? 'Login' : 'Create Account'}</button>}
          {isLoading && <p>Loading....</p>  }
          <button
            type='button'
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? 'Create new account' : 'Login with existing account'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthForm;
