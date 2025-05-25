import React from 'react';

function FeatureFilter({ features, selectedFeatures, onToggleFeature }) {
  return (
    <div className="filter-section">
      <label>Характеристики:</label>
      {features.map((feature) => (
        <div key={feature.id}>
          <input
            type="checkbox"
            checked={selectedFeatures.includes(feature.name)}
            onChange={() => onToggleFeature(feature.name)}
          />
          {feature.name}
        </div>
      ))}
    </div>
  );
}

export default FeatureFilter;
