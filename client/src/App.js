import React, { Profiler, useEffect } from "react";
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
import Profile from "./pages/Profile/Profile";
import ForgotPassword from "./pages/Auth/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword/ResetPassword";
import Favorites from "./pages/Favorites/Favorites";
import { FavoritesProvider } from "./components/FavoritesContext";
import Contacts from "./pages/Contacts/Contacts";
import PaymentConditions from "./pages/PaymentConditions/PaymentConditions";
import DeliveryConditions from "./pages/DeliveryConditions/DeliveryConditions";
import LoyaltyProgram from "./pages/LoyaltyProgram/LoyaltyProgram";
import ReturnPolicy from "./pages/ReturnPolicy/ReturnPolicy";
import WarrantyPolicy from "./pages/WarrantyPolicy/WarrantyPolicy";
import AdminOrdersPage from "./pages/AdminOrdersPage/AdminOrdersPage";
import PrivateRoute from "./PrivateRouter";


function App() {
  const { tg } = useTelegram();

  useEffect(() => {
    tg.ready();
  }, []);

  return (
    <div className="App">
      <CartProvider>
        <FavoritesProvider>
          <Header />
          <MainMenu />
          <Routes>
            <Route index element={<Home />} />
            <Route path={'login'} element={<Login />} />
            <Route path={'register'} element={<Register />} />
            <Route path={'profile'} element={<Profile />} />
            <Route path={'catalog'} element={<Catalog />} />
            <Route path={'cart'} element={<Cart />} />
            <Route path={'forgot-password'} element={<ForgotPassword />} />
            <Route path={'reset-password'} element={<ResetPassword />} />
            <Route path={'favorites'} element={<Favorites />} />
            <Route path={'contacts'} element={<Contacts />} />
            <Route path={'payment-conditions'} element={<PaymentConditions />} />
            <Route path={'delivery-conditions'} element={<DeliveryConditions />} />
            <Route path={'loyalty-program'} element={<LoyaltyProgram />} />
            <Route path={'returns'} element={<ReturnPolicy />} />
            <Route path={'product-warranty'} element={<WarrantyPolicy />} />
            <Route
              path={'/admin'}
              element={<PrivateRoute element={<AdminOrdersPage />} />}
            />
          </Routes>
          <Footer />
        </FavoritesProvider>
      </CartProvider>
    </div>
  );
}

export default App;
