import React from 'react';

function GenderFilter({ genders, setSelectedGender }) {
  return (
    <select onChange={(e) => setSelectedGender(e.target.value)} defaultValue="">
      <option value="">Выберите пол</option>
      {genders.map((gender) => (
        <option key={gender.id} value={gender.name}>
          {gender.name}
        </option>
      ))}
    </select>
  );
}

export default GenderFilter;
