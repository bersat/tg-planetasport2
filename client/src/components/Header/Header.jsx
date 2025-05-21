import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';

function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const openSearch = () => setIsSearchActive(true);
  const closeSearch = () => setIsSearchActive(false);
  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Поиск:', searchQuery);
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
