import React from 'react';
import PriceFilter from '../PriceFilter/PriceFilter';
import BrandFilter from '../BrandFilter/BrandFilter';
import SizeFilter from '../SizeFilter/SizeFilter';
import './FilterWrapper.css'

function FilterWrapper({
  activeFilter,
  brands,
  sizes,
  selectedPrice,
  selectedBrands,
  selectedSizes,
  handleBrandToggle,
  onToggleSize,
  onPriceChange
}) {
  return (
    <div className="filter-wrapper">
      {/* В зависимости от активного фильтра рендерим нужный компонент */}
      {activeFilter === 'price' && (
        <div className="filter-dropdown price-filter">
          <PriceFilter selectedPrice={selectedPrice} onPriceChange={onPriceChange} />
        </div>
      )}

      {activeFilter === 'brand' && (
        <div className="filter-dropdown brand-filter">
          <BrandFilter
            brands={brands}
            selectedBrands={selectedBrands}
            onToggleBrand={handleBrandToggle}
          />
        </div>
      )}

      {activeFilter === 'size' && (
        <div className="filter-dropdown size-filter">
          <SizeFilter
            sizes={sizes}
            selectedSizes={selectedSizes}
            onToggleSize={onToggleSize}
          />
        </div>
      )}
    </div>
  );
}

export default FilterWrapper;
