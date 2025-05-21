import React from 'react';
import { FaHome, FaUser, FaThLarge, FaShoppingCart, FaHeart } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <ul>
        <li>
          <a href="/">
            <FaHome className="icon" />
            <span>Главная</span>
          </a>
        </li>
        <li>
          <a href="/profile">
            <FaUser className="icon" />
            <span>Кабинет</span>
          </a>
        </li>
        <li>
          <a href="/catalog">
            <FaThLarge className="icon" />
            <span>Каталог</span>
          </a>
        </li>
        <li>
          <a href="/cart">
            <FaShoppingCart className="icon" />
            <span>Корзина</span>
          </a>
        </li>
        <li>
          <a href="/favorites">
            <FaHeart className="icon" />
            <span>Избранное</span>
          </a>
        </li>
      </ul>
    </footer>
  );
}

export default Footer;
