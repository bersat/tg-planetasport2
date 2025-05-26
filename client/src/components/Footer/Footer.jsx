import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaThLarge, FaShoppingCart, FaHeart } from 'react-icons/fa';
import './Footer.css';
import { useCart } from '../CartContext';
import { useFavorites } from '../FavoritesContext';  // Импортируем useFavorites

function Footer() {
  const navigate = useNavigate();  // Хук для навигации
  const [isAuthorized, setIsAuthorized] = useState(null);  // Стейт для хранения состояния авторизации
  const { cart } = useCart();
  const { favorites } = useFavorites();  // Извлекаем избранные товары из контекста

  const totalQuantity = (cart && Array.isArray(cart))
    ? cart.reduce((total, item) => total + item.quantity, 0)
    : 0;

  const totalFavorites = favorites.length;  // Количество избранных товаров

  // Логика проверки авторизации и токена
  const checkAuth = () => {
    const token = localStorage.getItem('auth_token');  // Получаем токен из localStorage
    console.log("Токен из localStorage:", token);  // Логируем токен

    if (!token) {
      console.log("Токен не найден. Пользователь не авторизован.");
      return false; // Если токен отсутствует, то не авторизован
    }

    try {
      // Пытаемся декодировать токен (предполагаем, что это JWT)
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Декодируем JWT токен

      const expirationTime = decodedToken.exp * 1000; // Время истечения токена в миллисекундах
      const currentTime = Date.now();
      console.log("Текущее время:", currentTime);  // Логируем текущее время
      console.log("Время истечения токена:", expirationTime);  // Логируем время истечения токена

      if (currentTime > expirationTime) {
        // Если токен истек
        console.log("Токен истек. Удаляем токен.");
        localStorage.removeItem('auth_token'); // Удаляем токен из localStorage
        return false;
      }

      console.log("Токен действителен.");
      return true; // Токен действителен
    } catch (error) {
      console.error("Ошибка декодирования токена:", error);
      return false;
    }
  };

  // Перенаправляем пользователя на login, если токен недействителен
  useEffect(() => {
    const authorized = checkAuth();
    setIsAuthorized(authorized); // Устанавливаем стейт авторизации

    if (!authorized) {
      navigate("/login");  // Перенаправляем на страницу логина, если токен недействителен
    }
  }, [navigate]);

  // Если стейт авторизации еще не установлен, ничего не рендерим
  if (isAuthorized === null) {
    return null;  // Можно поставить здесь спиннер или что-то еще
  }

  return (
    <footer className="footer">
      <ul>
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaHome className="icon" />
            <span>Главная</span>
          </NavLink>
        </li>
        {isAuthorized && (
          <li>
            <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaUser className="icon" />
              <span>Кабинет</span>
            </NavLink>
          </li>
        )}
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
