import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 🔹 добавлен импорт
import Sidebar from '../Sidebar/Sidebar';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';

const API_URL = process.env.REACT_APP_API_URL;

function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate(); // 🔹 добавлен хук навигации

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const openSearch = () => setIsSearchActive(true);
  const closeSearch = () => {
    setIsSearchActive(false);
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 2) {
      try {
        const response = await fetch(`${API_URL}/api/products/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();
        setSearchResults(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Ошибка при поиске:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Поиск:', searchQuery);
    setShowSuggestions(false);
  };

  // 🔹 Обработчик перехода на каталог и открытие модального окна товара
  const handleSuggestionClick = (product) => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
    setIsSearchActive(false);  // Скрываем поисковую панель

    // Перенаправление на каталог с query параметром, который указывает на нужный товар
    navigate(`/catalog?productId=${product.id}`);
  };

  return (
    <>
      {/* Поисковая панель */}
      <div className={`top-search-bar ${isSearchActive ? 'active' : ''}`}>
        <form onSubmit={handleSearchSubmit} className="top-search-form">
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button type="button" className="close-search" onClick={closeSearch}>
            <FaTimes />
          </button>
        </form>

        {/* 🔹 Блок с подсказками */}
        {showSuggestions && searchResults.length > 0 && (
          <div className="search-suggestions">
            {searchResults.map((item) => (
              <div
                key={item.id}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(item)}
                style={{ cursor: 'pointer' }}
              >
                <img src={item.image_url} alt={item.title} />
                <div className="suggestion-info">
                  <div className="name">{item.title}</div>
                  <div className="price">{item.price}₽</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Шапка */}
      <header className="header">
        <div className="header-left">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <FaBars />
          </button>
        </div>
        <div className="header-center">
          <h1>Логотип</h1>
        </div>
        <div className="header-right">
          <button className="search-icon" onClick={openSearch}>
            <FaSearch />
          </button>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
    </>
  );
}

export default Header;
