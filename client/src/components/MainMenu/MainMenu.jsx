import React from 'react';
import './MainMenu.css';

function MainMenu() {
  return (
    <nav className="main-menu">
      <ul>
        <li><a href="/">Главная</a></li>
        <li><a href="/profile">Кабинет</a></li>
        <li><a href="/catalog">Каталог</a></li>
        <li><a href="/cart">Корзина</a></li>
        <li><a href="/favorites">Избранное</a></li>
      </ul>
    </nav>
  );
}

export default MainMenu;
