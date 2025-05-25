import React, { useState, useEffect } from 'react';
import './PriceFilter.css'

function PriceFilter({ selectedPrice, onPriceChange }) {
  const [maxPrice, setMaxPrice] = useState(selectedPrice.max);

  useEffect(() => {
    setMaxPrice(selectedPrice.max); // Обновляем значение ползунка при изменении max
  }, [selectedPrice.max]);

  // Обработчик изменения ползунка
  const handleSliderChange = (e) => {
    const newMaxPrice = e.target.value;
    setMaxPrice(newMaxPrice); // Обновляем состояние ползунка
    onPriceChange({ target: { name: 'max', value: newMaxPrice } }); // Передаем новое значение в родительский компонент
  };

  // Обработчик изменения полей input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onPriceChange({ target: { name, value } }); // Передаем изменения родительскому компоненту
  };

  return (
    <div className="price-filter">
      <label>Цена:</label>
      <div className="price-filter-inputs">
        <input
          type="number"
          name="min"
          value={selectedPrice.min || 0} // Начальное значение 0
          onChange={handleInputChange}
          min="0"
          style={{ width: '80px' }} // Ширина инпута для минимальной цены
        />
        <input
          type="number"
          name="max"
          value={selectedPrice.max || 30000} // Начальное значение 30000
          onChange={handleInputChange}
          max="30000"
          style={{ width: '80px' }} // Ширина инпута для максимальной цены
        />
      </div>

      <div className="slider-section">
        <input
          type="range"
          min="200"
          max="30000"
          value={maxPrice}
          onChange={handleSliderChange}
          style={{ width: '100%' }} // Ширина ползунка на 100%
        />
      </div>
    </div>
  );
}

export default PriceFilter;
