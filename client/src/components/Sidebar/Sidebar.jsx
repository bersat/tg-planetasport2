import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ isOpen, onClose }) {
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (e.target.classList.contains('sidebar-overlay')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  return (
    <>
      {isOpen && <div className="sidebar-overlay" />}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <nav>
          <ul className="sidebar-links">
            <li><Link to="/catalog" onClick={onClose}>Каталог</Link></li>
            <li><Link to="/brands" onClick={onClose}>Бренды</Link></li>
            <li><Link to="/promotions" onClick={onClose}>Акции</Link></li>
            <li><Link to="/customers" onClick={onClose}>Покупателям</Link></li>
            <li><Link to="/contacts" onClick={onClose}>Контакты</Link></li>
          </ul>
        </nav>
      </div>
    </>
  );
}

export default Sidebar;
