import React from "react";
import { Routes , Route } from "react-router-dom"
import Chat from "./Pages/Chat";
import SignUp from "./Pages/SignUp/SignUp.jsx";
import Login from "./Pages/Login/Login";

function App() {


  return (
    <>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  )
}

export default App
