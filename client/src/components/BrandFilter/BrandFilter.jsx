import React, { useEffect } from 'react';
import './BrandFilter.css'

function BrandFilter({ brands, selectedBrands, onToggleBrand }) {
  const handleChange = (brandName) => {
    onToggleBrand(brandName);  // передаем только имя бренда
  };

  useEffect(() => {
    console.log('Selected Brands:', selectedBrands);
  }, [selectedBrands]);

  return (
    <div className="brand-filter">
      <label>Бренды:</label>
      <div className="brand-options">
        {brands.map((brand) => (
          <div key={brand.id} className="brand-option">
            <input
              type="checkbox"
              id={`brand-${brand.id}`}
              checked={selectedBrands.includes(brand.name)}
              onChange={() => handleChange(brand.name)}
              className="brand-checkbox"
            />
            <label htmlFor={`brand-${brand.id}`} className="brand-label">
              {brand.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BrandFilter;
