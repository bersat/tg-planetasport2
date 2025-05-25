import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ isOpen, onClose }) {
  const [isSubLinksVisible, setSubLinksVisible] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (e.target.classList.contains('sidebar-overlay')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  const handleToggleSubLinks = () => {
    setSubLinksVisible(!isSubLinksVisible);
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Верхняя часть Sidebar */}
        <div className="sidebar-header">
          <div className="sidebar-close-btn" onClick={onClose}>
            &times;
          </div>
        </div>

        {/* Блок с навигационными ссылками */}
        <nav>
          <ul className="sidebar-links">
            <li><Link to="/catalog" onClick={onClose}>Каталог</Link></li>
            <li><Link to="/brands" onClick={onClose}>Бренды</Link></li>
            <li><Link to="/promotions" onClick={onClose}>Акции</Link></li>
            <li>
              <button onClick={handleToggleSubLinks} className="customers-btn">
                Покупателям
              </button>
              {/* Скрытые кнопки */}
              <div className={`sub-links ${isSubLinksVisible ? 'visible' : ''}`}>
                <Link to="/payment-conditions" onClick={onClose} className="sub-link">Условия оплаты</Link>
                <Link to="/delivery-conditions" onClick={onClose} className="sub-link">Условия доставки</Link>
                <Link to="/loyalty-program" onClick={onClose} className="sub-link">Программа лояльности</Link>
                <Link to="/returns" onClick={onClose} className="sub-link">Возврат</Link>
                <Link to="/product-warranty" onClick={onClose} className="sub-link">Гарантия товара</Link>
              </div>
            </li>
            <li><Link to="/contacts" onClick={onClose}>Контакты</Link></li>
          </ul>
        </nav>

        {/* Нижняя часть Sidebar */}
        <div className="sidebar-footer">
          <p>© 2025 My Store</p>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
