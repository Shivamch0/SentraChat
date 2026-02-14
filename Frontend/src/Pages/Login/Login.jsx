import React from 'react';
import style from "./Login.module.css";
import smily from "../../assets/Smily.png";
import rocket from "../../assets/rocket.png"
import { Link } from "react-router-dom";


function Login() {
  return (
    <>
       <div className={style.container}>
          
          <div className={style.imgbox}>
            <img src={smily} className='h-76 w-130' />
          </div>

          <div className={style.formContainer}>
              <form action="">
                <h2>Welcome Back!</h2>
                <p className={style.signUpPara}> Login to your account</p>

                <input type="email" placeholder='Email' name='email'/>

                <input type="password" placeholder='Password' name="password"  />

              <div className={style.remember}>
                  <div>
                    <input type="checkbox" id='rememberMe' /> <label htmlFor="rememberMe"> Remember me</label>
                  </div>
                  <Link>Forgot Password?</Link>
              </div>

                <button type='submit'>Login</button>
              </form>

              <p>Don't have an account? <Link to={"/signUp"}>Sign Up</Link> </p>
          </div>

          <div className={style.rocket}>
            <img src={rocket} alt="" />
          </div>

      </div>
    </>
  )
}

export default Login
