import React , { useState , useEffect} from "react";
import { Routes, Route } from "react-router-dom";
import Chat from "./Pages/Chat/Chat";
import SignUp from "./Pages/SignUp/SignUp.jsx";
import Login from "./Pages/Login/Login";
import Home from "./Pages/Home/Home.jsx";
import Skelton from "./Skelton.jsx";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL).finally(() => setLoading(false));
  }, []);

if(loading) return <Skelton />
  return (
    <>
      <div className="mainContainer">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
