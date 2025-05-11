import React, { useEffect } from "react";
import './App.css';
import { useTelegram } from "./hooks/useTelegram";
import { Routes, Route } from 'react-router-dom';
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import Home from "./pages/Home/Home";


function App() {
  const { tg } = useTelegram();

  useEffect(() => {
    tg.ready();
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route index element={<Home />} />
        <Route path={'login'} element={<Login />} />
        <Route path={'register'} element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
