import React from 'react';
import logo from '../../assets/logo.png';
import style from "./Navbar.module.css"

function Navbar() {
  return (
    <>
      <header>
        <nav className={style.navbar}>
            <img src={logo} alt="" />
        </nav>
      </header>
    </>
  )
}

export default Navbar
