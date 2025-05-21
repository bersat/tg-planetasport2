import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';

function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
        // Отправляем запрос на сервер для поиска товаров
        const response = await fetch(`http://localhost:5000/api/products/search?q=${encodeURIComponent(query)}`);
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
          <button type="submit">Найти</button>
          <button type="button" className="close-search" onClick={closeSearch}>
            <FaTimes />
          </button>
        </form>

        {/* Блок с подсказками */}
        {showSuggestions && searchResults.length > 0 && (
          <div className="search-suggestions">
            {searchResults.map((item) => (
              <div className="suggestion-item" key={item.id}>
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
