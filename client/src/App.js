import React, { useEffect } from "react";
import './App.css';
import { useTelegram } from "./hooks/useTelegram";
import Header from "./components/Header/Header";
import { Routes, Route } from 'react-router-dom';
import ProductList from "./components/ProductList/ProductList";
import Form from "./components/Form/Form";
import Auth from "./pages/Auth/Auth";

function App() {
  const { tg } = useTelegram();

  useEffect(() => {
    tg.ready();
  }, [])


  return (
    <div className="App">
      <Header />

      <Routes>
        <Route index element={<Auth />} />
        <Route path={'productList'} element={<ProductList />} />
        <Route path={'form'} element={<Form />} />
      </Routes>



    </div>
  );
}

export default App;
