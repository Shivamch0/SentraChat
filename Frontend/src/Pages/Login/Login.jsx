import React from 'react';
import style from "./Login.module.css";
import smily from "../../assets/Smily.png";
import rocket from "../../assets/rocket.png"
import { Link , useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { loginSchema } from '../../validations/loginScheam';


function Login() {

  const navigate = useNavigate();

  const {handleChange , handleSubmit , values , errors} = useFormik({
    initialValues : {
      name : "",
      password : ""
    },
    validationSchema : loginSchema,
    onSubmit : (values) => {
      navigate("/chat")
    }
  })
  return (
    <>
       <div className={style.container}>
          
          <div className={style.imgbox}>
            <img src={smily} className='h-76 w-130' />
          </div>

          <div className={style.formContainer}>
              <form action="" onSubmit={handleSubmit}>
                <h2>Welcome Back!</h2>
                <p className={style.signUpPara}> Login to your account</p>

                <input type="email" placeholder='Email' name='email' onChange={handleChange} value={values.email} />
                {errors.email && <p>{errors.email}</p>}

                <input type="password" placeholder='Password' name="password" onChange={handleChange} value={values.password}  />
                {errors.password && <p>{errors.password}</p>}

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
