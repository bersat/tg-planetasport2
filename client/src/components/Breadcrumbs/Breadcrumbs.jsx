import React from 'react';
import './breadcrumbs.css';

function Breadcrumbs({ selectedCategory, selectedGender, selectedType, selectedProduct, onClickLevel }) {
  const items = [
    { name: 'Главная', level: 'home' },
    { name: 'Каталог', level: 'catalog' },
  ];

  // Добавляем категорию, если она есть
  if (selectedCategory) {
    items.push({ name: selectedCategory, level: 'category' });
  }

  // Добавляем пол, если он есть
  if (selectedGender) {
    items.push({ name: selectedGender, level: 'gender' });
  }

  // Добавляем тип, если он есть
  if (selectedType) {
    items.push({ name: selectedType, level: 'type' });
  }

  // Добавляем товар, если он выбран
  if (selectedProduct) {
    items.push({ name: selectedProduct, level: 'product' });
  }

  return (
    <div className="breadcrumbs">
      {items.map((item, index) => (
        <span key={index}>
          <button
            className="breadcrumb-link"
            onClick={() => onClickLevel(item.level)}
            disabled={index === items.length - 1}
          >
            {item.name}
          </button>
          {index < items.length - 1 && <span> - </span>}
        </span>
      ))}
    </div>
  );
}

export default Breadcrumbs;
