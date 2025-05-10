import React, { useEffect } from "react";
import './App.css';
import { useTelegram } from "./hooks/useTelegram";
import Header from "./components/Header/Header";
import { Routes, Route } from 'react-router-dom';
import ProductList from "./components/ProductList/ProductList";
import Form from "./components/Form/Form";
import Auth from "./pages/Auth/Auth";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";

function App() {
  const { tg } = useTelegram();

  useEffect(() => {
    tg.ready();
  }, [])


  return (
    <div className="App">
      <Header />

      <Routes>
        <Route index element={<Login />} />
        <Route path={'register'} element={<Register />} />
        <Route path={'productList'} element={<ProductList />} />
        <Route path={'form'} element={<Form />} />
      </Routes>
    </div>
  );
}

export default App;
