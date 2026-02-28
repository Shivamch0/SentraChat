import React from "react";
import style from "./Home.module.css";
import smilyLogo from "../../assets/SmilyLogo.png"
import chat from "../../assets/chat app.png";
import { Link , useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleGetStated = () =>{
    navigate("/signUp")
  }

  const handleLogin = () => {
    navigate("/login")
  }

  return (
    <>
      <main className={style.homeContainer}>

       <div className={style.details}>
         <section className={style.navLogo}>
          <img src={smilyLogo} alt="" />
        </section>

        <section className={style.contentSection}>
          <div className={style.content}>
            <h3>Connect with</h3>
            <h3>Your Loved Ones</h3>
            <p>Chat seamlessly and stay close with your favourite people.</p>
          </div>
          <div className={style.button}>
            <button className={style.getStarted} onClick={() => handleGetStated()}>Get Started</button>
            <button className={style.loginBtn} onClick={() => handleLogin()}>Login</button>
          </div>
          <div className={style.lowerPart}>
            <p>Don't have an account?</p>
            <Link to={"/signUp"}>SignUp</Link>
          </div>
        </section>
       </div>

        <div className={style.image}>
          <img src={chat} alt="" />
        </div>

      </main>
    </>
  );
}

export default Home;
