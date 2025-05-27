import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaThLarge, FaShoppingCart, FaHeart } from 'react-icons/fa';
import './Footer.css';
import { useCart } from '../CartContext';
import { useFavorites } from '../FavoritesContext';  // Импортируем useFavorites

function Footer() {
  const navigate = useNavigate();  // Хук для навигации
  const { cart } = useCart();
  const { favorites } = useFavorites();  // Извлекаем избранные товары из контекста

  // Рассчитываем общее количество товаров в корзине
  const totalQuantity = (cart && Array.isArray(cart))
    ? cart.reduce((total, item) => total + item.quantity, 0)
    : 0;

  // Количество избранных товаров
  const totalFavorites = favorites.length;

  // Логика проверки авторизации и токена
  const isAuthenticated = () => {
    const token = localStorage.getItem('auth_token');  // Получаем токен из localStorage
    if (!token) return false;  // Если токен отсутствует, то не авторизован

    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Декодируем JWT токен
      const expirationTime = decodedToken.exp * 1000; // Время истечения токена в миллисекундах
      const currentTime = Date.now();
      return currentTime <= expirationTime;  // Проверка на истечение токена
    } catch (error) {
      console.error("Ошибка декодирования токена:", error);
      return false;
    }
  };

  // Получение роли пользователя
  const getUserRole = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Декодируем JWT токен
      return decodedToken.role;  // Возвращаем роль пользователя
    } catch (error) {
      console.error("Ошибка получения роли:", error);
      return null;
    }
  };

  // Определяем ссылку для "Кабинет" в зависимости от состояния авторизации
  const cabinetLink = isAuthenticated() ? "/profile" : "/login"; // Путь зависит от авторизации

  // Проверяем роль, чтобы отобразить ссылку для админа
  const isAdmin = getUserRole() === 'admin';  // Проверка на роль 'admin'

  // Перенаправляем пользователя на login, если токен недействителен
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");  // Перенаправляем на страницу логина, если токен недействителен
    }
  }, []);

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
        {isAdmin && (  // Отображаем ссылку для админов
          <li>
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
              <span>Админ панель</span>
            </NavLink>
          </li>
        )}
      </ul>
    </footer>
  );
}

export default Footer;
