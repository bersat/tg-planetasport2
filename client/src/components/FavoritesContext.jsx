import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Создаем контекст для избранных товаров
const FavoritesContext = createContext();

// Хук для использования контекста
export const useFavorites = () => {
  return useContext(FavoritesContext);
};

// Провайдер контекста для избранных товаров
export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    // При инициализации проверяем, есть ли избранные в localStorage
    const storedFavorites = localStorage.getItem('favorites');
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Проверка авторизации и загрузка избранных с сервера
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
      fetchFavoritesFromServer(token); // Загружаем избранные с сервера
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Загружаем избранные товары с сервера для авторизованных пользователей
  const fetchFavoritesFromServer = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/favorites', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFavorites(response.data);
      localStorage.setItem('favorites', JSON.stringify(response.data)); // Сохраняем в localStorage
    } catch (err) {
      console.error('Ошибка при загрузке избранных товаров с сервера:', err);
    }
  };

  // Функция для добавления товара в избранное
  const addToFavorites = (product) => {
    setFavorites((prevFavorites) => {
      const updatedFavorites = [...prevFavorites, product];

      // Если пользователь авторизован, обновляем данные на сервере
      if (isAuthenticated) {
        const token = localStorage.getItem('auth_token');
        updateFavoritesOnServer(updatedFavorites, token); // Отправляем обновленный список на сервер
      } else {
        // Если не авторизован, просто сохраняем в localStorage
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      }

      return updatedFavorites;
    });
  };

  // Функция для удаления товара из избранного
  const removeFromFavorites = async (productId) => {
    setFavorites((prevFavorites) => {
      const updatedFavorites = prevFavorites.filter((prod) => prod.id !== productId);

      // Если пользователь авторизован, обновляем данные на сервере
      if (isAuthenticated) {
        const token = localStorage.getItem('auth_token');
        updateFavoritesOnServer(updatedFavorites, token); // Отправляем обновленный список на сервер
      } else {
        // Если не авторизован, просто сохраняем в localStorage
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      }

      return updatedFavorites;
    });
  };

  // Обновление избранных товаров на сервере
  const updateFavoritesOnServer = async (updatedFavorites, token) => {
    try {
      // Отправляем весь обновленный список на сервер
      const response = await axios.post(
        'http://localhost:5000/api/favorites',
        updatedFavorites.map(product => ({
          product_id: product.id,
          title: product.title,
          description: product.description || '',
          price: product.price,
          image_url: product.image_url || '',
        })),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Избранные товары успешно обновлены:', response.data);
    } catch (error) {
      if (error.response) {
        // Ошибка от сервера
        console.error('Ошибка от сервера:', error.response.data.message);
      } else {
        // Ошибка при запросе
        console.error('Ошибка при запросе:', error.message);
      }
    }
  };

  // Эффект при смене аккаунта или авторизации
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('auth_token');
      fetchFavoritesFromServer(token); // Загружаем избранные с сервера
    } else {
      localStorage.removeItem('favorites'); // Очищаем localStorage, если не авторизован
      setFavorites([]); // Очищаем состояние избранных товаров
    }
  }, [isAuthenticated]);

  return (
    <FavoritesContext.Provider value={{ favorites, addToFavorites, removeFromFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};
