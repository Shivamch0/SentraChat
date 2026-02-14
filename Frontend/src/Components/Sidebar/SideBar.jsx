import React from 'react';
import Logo from "../../assets/white logo.png";
import mike from "../../assets/mike.png";
import ethan from "../../assets/ethan.jpg";
import emma from "../../assets/emma.jpg";
import sarah from "../../assets/sarah.png";
import jennifer from "../../assets/jennifer.png";

import style from "./SideBar.module.css";

function SideBar() {
  return (
    <>
      <aside className={style.sideBar}>
        <div className={style.sideBarLogo}>
            <img src={Logo}/>
        </div>

        <div className={style.chatSection}>
            <input type="text" placeholder='Search' />
            <div className={style.chatPara}>
                <p className={style.chatPara}>Chats</p>
            </div>

            <div className={style.chats}>
                <div className={style.chatPersons}>
                <img src={sarah} alt="" />
                <div className={style.details}>
                    <h4>Sarah</h4>
                    <p>typing...</p>
                </div>
            </div>

            <div className={style.chatPersons}>
                <img src={mike} alt="" />
                <div className={style.details}>
                    <h4>Mike</h4>
                    <p>typing...</p>
                </div>
            </div>

            <div className={style.chatPersons}>
                <img src={jennifer} alt="" />
                <div className={style.details}>
                    <h4>Jenifer</h4>
                    <p>typing...</p>
                </div>
            </div>

            <div className={style.chatPersons}>
                <img src={emma} alt="" />
                <div className={style.details}>
                    <h4>Emma</h4>
                    <p>typing...</p>
                </div>
            </div>

            <div className={style.chatPersons}>
                <img src={ethan} alt="" />
                <div className={style.details}>
                    <h4>Ethan</h4>
                    <p>typing...</p>
                </div>
            </div>
            </div>

        </div>
      </aside>
    </>
  )
}

export default SideBar
