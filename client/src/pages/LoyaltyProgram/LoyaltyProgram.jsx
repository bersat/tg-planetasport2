import React from 'react';
import { Link } from 'react-router-dom';
import './LoyaltyProgram.css'; // Подключаем стили

const LoyaltyProgram = () => {
  return (
    <div className="loyalty-program-container">
      {/* Хлебные крошки */}
      <div className="loyalty-program-breadcrumbs">
        <Link to="/">Главная</Link> — <Link to="/help">Помощь</Link> — Программа лояльности
      </div>

      {/* Заголовок страницы */}
      <h1 className="loyalty-program-header">Программа лояльности</h1>

      {/* Основной контент */}
      <div className="loyalty-program-info">
        <h2>Кешбэк бонусы</h2>
        <p>
          Начисляются 10% за любые покупки в интернет-магазинах <strong>Red Fox</strong> и <strong>Планета Спорт</strong>.
        </p>
        <ul className="bonus-list">
          <li><strong>1 бонус = 1 рублю</strong></li>
          <li>30% от стоимости товара можно оплатить бонусами, если на товар не действуют скидки (20% на бренды Talberg, King Camp, Husky, Atepa).</li>
          <li>10% от стоимости товара можно оплатить бонусами, если на товар действуют скидки, но не более 40%.</li>
          <li>Срок действия бонусов — 6 месяцев.</li>
        </ul>

        <h2>Промо бонусы</h2>
        <p>Промо бонусы начисляются в период проведения акций.</p>
        <p>Срок действия промо бонусов ограничен условиями акций.</p>
      </div>
    </div>
  );
};

export default LoyaltyProgram;
