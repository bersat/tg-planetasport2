import React from 'react';
import { Link } from 'react-router-dom';  // Импортируем Link
import './breadcrumbs.css';

function Breadcrumbs({ selectedCategory, selectedGender, selectedType, selectedProduct, onClickLevel }) {
  const items = [
    { name: 'Главная', level: 'home', link: '/' },  // Указываем ссылку для Главной страницы
    { name: 'Каталог', level: 'catalog', link: '/catalog' },
  ];

  // Добавляем категорию, если она есть
  if (selectedCategory) {
    items.push({ name: selectedCategory, level: 'category', link: `/catalog?category=${selectedCategory}` });
  }

  // Добавляем пол, если он есть
  if (selectedGender) {
    items.push({ name: selectedGender, level: 'gender', link: `/catalog?category=${selectedCategory}&gender=${selectedGender}` });
  }

  // Добавляем тип, если он есть
  if (selectedType) {
    items.push({ name: selectedType, level: 'type', link: `/catalog?category=${selectedCategory}&gender=${selectedGender}&type=${selectedType}` });
  }

  // Добавляем товар, если он выбран
  if (selectedProduct) {
    items.push({ name: selectedProduct, level: 'product', link: `/product/${selectedProduct}` });
  }

  return (
    <div className="breadcrumbs">
      {items.map((item, index) => (
        <span key={index}>
          <Link to={item.link}>
            <button
              className="breadcrumb-link"
              disabled={index === items.length - 1}  // Последняя крошка — это текущая страница, на неё не нужно переходить
            >
              {item.name}
            </button>
          </Link>
          {index < items.length - 1 && <span style={{ padding: '2px' }}>—</span>}
        </span>
      ))}
    </div>
  );
}

export default Breadcrumbs;
