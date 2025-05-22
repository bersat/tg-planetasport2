import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUser, FaThLarge, FaShoppingCart, FaHeart } from 'react-icons/fa';
import './Footer.css';
import { useCart } from '../CartContext';

function Footer() {
  const { cart } = useCart();
  const totalQuantity = (cart && Array.isArray(cart))
    ? cart.reduce((total, item) => total + item.quantity, 0)
    : 0;

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
          <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''}>
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
            <FaHeart className="icon" />
            <span>Избранное</span>
          </NavLink>
        </li>
      </ul>
    </footer>
  );
}

export default Footer;
