import React from 'react';

function TypeFilter({ types, setSelectedType }) {
  return (
    <select onChange={(e) => setSelectedType(e.target.value)} defaultValue="">
      <option value="">Выберите тип</option>
      {types.map((type) => (
        <option key={type.id} value={type.name}>
          {type.name}
        </option>
      ))}
    </select>
  );
}

export default TypeFilter;
