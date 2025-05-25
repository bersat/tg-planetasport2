import React from 'react';
import './SizeFilter.css'

function SizeFilter({ sizes, selectedSizes, onToggleSize }) {
  return (
    <div className="size-filter">
      <label>Размеры:</label>
      <div className="size-options">
        {sizes.map((size) => (
          <div key={size.id} className="size-option">
            <input
              type="checkbox"
              id={`size-${size.id}`}
              checked={selectedSizes.includes(size.name)}
              onChange={() => onToggleSize(size.name)}
              className="size-checkbox"
            />
            <label htmlFor={`size-${size.id}`} className="size-label">
              {size.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SizeFilter;
