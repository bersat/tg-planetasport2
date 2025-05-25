// FavoritesContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Создаем контекст для избранных товаров
const FavoritesContext = createContext();

// Хук для использования контекста
export const useFavorites = () => {
  return useContext(FavoritesContext);
};

// Провайдер контекста для избранных товаров
export const FavoritesProvider = ({ children }) => {
  // Считываем избранные товары из localStorage, если они есть
  const [favorites, setFavorites] = useState(() => {
    const storedFavorites = localStorage.getItem('favorites');
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  });

  // Обновляем localStorage при изменении списка избранных товаров
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Добавление товара в избранное
  const addToFavorites = (product) => {
    setFavorites((prevFavorites) => [...prevFavorites, product]);
  };

  // Удаление товара из избранного
  const removeFromFavorites = (productId) => {
    setFavorites((prevFavorites) => prevFavorites.filter(prod => prod.id !== productId));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addToFavorites, removeFromFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};
