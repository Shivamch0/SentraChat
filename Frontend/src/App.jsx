import React from "react";
import { Routes, Route } from "react-router-dom";
import Chat from "./Pages/Chat/Chat";
import SignUp from "./Pages/SignUp/SignUp.jsx";
import Login from "./Pages/Login/Login";

function App() {
  return (
    <>
      <div className="mainContainer">
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
