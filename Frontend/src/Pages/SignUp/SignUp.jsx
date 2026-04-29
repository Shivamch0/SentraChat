import React from 'react';
import style from "./SignUp.module.css";
import purpleLike from '../../assets/Like2.png';
import { Link , useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { signUpSchema } from '../../validations/signUpSchema';
import { registerUser } from "../../api/auth.api.js"

function SignUp() {

  const navigate = useNavigate();
  const { values , handleChange , handleSubmit , errors } = useFormik({
    initialValues : {
      fullName : "",
      userName : "",
      email : "",
      password : ""
    },
    validationSchema : signUpSchema,
    onSubmit : async (values) => {
      try {
        await registerUser(values);
        navigate("/login")
      } catch (error) {
         alert(error.response?.data?.message);
      }
    }
  })

  return (
    <>
      <div className={style.container}>
          <div className={style.imgbox}>
            <img src={purpleLike} className='h-76 w-130' />
          </div>

          <div className={style.formContainer}>
              <form action="" onSubmit={handleSubmit}>
                <h2>Create Account</h2>
                <p className={style.signUpPara}> Sign up to get started!</p>

                <input type="text"  placeholder="Fullname" name='fullName' onChange={handleChange} value={values.fullName}/>
                {errors.fullName && <p>{errors.fullName}</p>}

                <input type="text"  placeholder="Username" name='userName' onChange={handleChange} value={values.userName}/>
                {errors.userName && <p>{errors.userName}</p>}

                <input type="email" placeholder='Email' name='email' onChange={handleChange} value={values.email}/>
                {errors.email && <p>{errors.email}</p>}

                <input type="password" placeholder='Password' name="password"  onChange={handleChange} value={values.password} />
                {errors.password && <p>{errors.password}</p>}

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
