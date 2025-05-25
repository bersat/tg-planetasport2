import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaThLarge, FaShoppingCart, FaHeart } from 'react-icons/fa';
import './Footer.css';
import { useCart } from '../CartContext';
import { useFavorites } from '../FavoritesContext';  // Импортируем useFavorites

function Footer() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { favorites } = useFavorites();  // Извлекаем избранные товары из контекста

  const totalQuantity = (cart && Array.isArray(cart))
    ? cart.reduce((total, item) => total + item.quantity, 0)
    : 0;

  const totalFavorites = favorites.length;  // Количество избранных товаров

  // Логика проверки авторизации и токена
  const isAuthenticated = () => {
    const token = localStorage.getItem('token'); // или sessionStorage
    if (!token) {
      return false; // Токен отсутствует, значит пользователь не авторизован
    }
    return true; // Токен существует, пользователь авторизован
  };

  const cabinetLink = isAuthenticated() ? "/profile" : "/login"; // Путь зависит от авторизации

  return (
    <footer className="footer">
      <ul>
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaHome className="icon" />
            <span>Главная</span>
          </NavLink>
        </li>
        <li>
          <NavLink to={cabinetLink} className={({ isActive }) => isActive ? 'active' : ''}>
            <FaUser className="icon" />
            <span>Кабинет</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/catalog" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaThLarge className="icon" />
            <span>Каталог</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/cart" className={({ isActive }) => isActive ? 'active' : ''}>
            <div className="cart-icon-wrapper">
              <FaShoppingCart className="icon" />
              {totalQuantity > 0 && <span className="cart-count">{totalQuantity}</span>}
            </div>
            <span>Корзина</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/favorites" className={({ isActive }) => isActive ? 'active' : ''}>
            <div className="favorites-icon-wrapper">
              <FaHeart className="icon" />
              {totalFavorites > 0 && <span className="favorites-count">{totalFavorites}</span>} {/* Счетчик избранных товаров */}
            </div>
            <span>Избранное</span>
          </NavLink>
        </li>
      </ul>
    </footer>
  );
}

export default Footer;
