import React, { useEffect } from "react";
import './App.css';
import { useTelegram } from "./hooks/useTelegram";
import { Routes, Route } from 'react-router-dom';
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import Home from "./pages/Home/Home";
import Catalog from "./pages/Catalog/Catalog";
import Cart from "./pages/Cart/Cart";
import { CartProvider } from './components/CartContext';
import Header from "./components/Header/Header";
import MainMenu from "./components/MainMenu/MainMenu";
import Footer from "./components/Footer/Footer";


function App() {
  const { tg } = useTelegram();

  useEffect(() => {
    tg.ready();
  }, []);

  return (
    <div className="App">
      <Header />
      <MainMenu />
      <CartProvider>
        <Routes>
          <Route index element={<Home />} />
          <Route path={'login'} element={<Login />} />
          <Route path={'register'} element={<Register />} />
          <Route path={'catalog'} element={<Catalog />} />
          <Route path={'cart'} element={<Cart />} />
        </Routes>
      </CartProvider>
      <Footer />
    </div>
  );
}

export default App;
