import React from 'react';

function CategoryFilter({ categories, setSelectedCategory }) {
  return (
    <select onChange={(e) => setSelectedCategory(e.target.value)} defaultValue="">
      <option value="">Выберите категорию</option>
      {categories.map((category) => (
        <option key={category.id} value={category.name}>
          {category.name}
        </option>
      ))}
    </select>
  );
}

export default CategoryFilter;
