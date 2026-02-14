import React from 'react';
import style from "./SignUp.module.css";
import purpleLike from '../../assets/like2.png';
import { Link } from "react-router-dom";

function SignUp() {
  return (
    <>
      <div className={style.container}>
          
          <div className={style.imgbox}>
            <img src={purpleLike} className='h-76 w-130' />
          </div>

          <div className={style.formContainer}>
              <form action="">
                <h2>Create Account</h2>
                <p className={style.signUpPara}> Sign up to get started!</p>

                <input type="text"  placeholder="Name" name='name'/>

                <input type="email" placeholder='Email' name='email'/>

                <input type="password" placeholder='Password' name="password"  />

                <p>By signing up, you agree to our Terms & Privacy Policy</p>

                <button type='submit'>Sign Up</button>
              </form>

              <p>Already have an account? <Link to={"/login"}>Login</Link> </p>
          </div>

          <div></div>

      </div>
    </>
  )
}

export default SignUp
