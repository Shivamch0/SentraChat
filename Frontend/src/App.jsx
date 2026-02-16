import React from "react";
import { Routes, Route } from "react-router-dom";
import Chat from "./Pages/Chat/Chat";
import SignUp from "./Pages/SignUp/SignUp.jsx";
import Login from "./Pages/Login/Login";
import Home from "./Pages/Home/Home.jsx"

function App() {
  return (
    <>
      <div className="mainContainer">
        <Routes>
          <Route path="/" element={ <Home />} /> 
          <Route path="/chat" element={<Chat />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
