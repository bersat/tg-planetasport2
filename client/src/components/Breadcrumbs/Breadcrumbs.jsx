import React from 'react';
import './breadcrumbs.css';

function Breadcrumbs({ selectedCategory, selectedGender, selectedType, onClickLevel }) {
  const items = [
    { name: 'Главная', level: 'home' },
    { name: 'Каталог', level: 'catalog' },
  ];

  if (selectedCategory) {
    items.push({ name: selectedCategory, level: 'category' });
  }

  if (selectedGender) {
    items.push({ name: selectedGender, level: 'gender' });
  }

  if (selectedType) {
    items.push({ name: selectedType, level: 'type' });
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
