import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Создаем контекст для корзины
const CartContext = createContext();

// Хук для использования контекста
export const useCart = () => {
  return useContext(CartContext);
};

// Провайдер контекста для корзины
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // При инициализации проверяем, есть ли товары в localStorage
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : [];
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Проверка авторизации и загрузка корзины с сервера
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
      fetchCartFromServer(token); // Загружаем корзину с сервера
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Загружаем корзину с сервера для авторизованных пользователей
  const fetchCartFromServer = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCart(response.data);
      localStorage.setItem('cart', JSON.stringify(response.data)); // Сохраняем в localStorage
    } catch (err) {
      console.error('Ошибка при загрузке корзины с сервера:', err);
    }
  };

  // Функция для добавления товара в корзину
  const addToCart = (product) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart, product];

      // Если пользователь авторизован, обновляем данные на сервере
      if (isAuthenticated) {
        const token = localStorage.getItem('auth_token');
        updateCartOnServer(updatedCart, token); // Отправляем обновленный список на сервер
      } else {
        // Если не авторизован, просто сохраняем в localStorage
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }

      return updatedCart;
    });
  };

  // Функция для удаления товара из корзины
 const removeFromCart = async (productId) => {
  // Проверяем, авторизован ли пользователь
  if (isAuthenticated) {
    const token = localStorage.getItem('auth_token');
    try {
      // Отправляем запрос на сервер для удаления товара из корзины
      await axios.delete(`http://localhost:5000/api/cart/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Если удаление прошло успешно, обновляем корзину на клиенте
      setCart((prevCart) => {
        return prevCart.filter((prod) => prod.product_id !== productId);
      });

      console.log('Товар удалён из корзины');
    } catch (error) {
      console.error('Ошибка при удалении товара с сервера:', error);
    }
  } else {
    // Если не авторизован, просто обновляем корзину в localStorage
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((prod) => prod.product_id !== productId);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  }
};


  // Обновление корзины на сервере
  const updateCartOnServer = async (updatedCart, token) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/cart',
        updatedCart.map(product => ({
          product_id: product.product_id,
          title: product.title,
          description: product.description || '',
          price: product.price,
          image_url: product.image_url || '',
          quantity: product.quantity,
        })),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Корзина успешно обновлена:', response.data);
    } catch (error) {
      console.error('Ошибка при обновлении корзины на сервере:', error);
    }
  };

  // Эффект при смене аккаунта или авторизации
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('auth_token');
      fetchCartFromServer(token); // Загружаем корзину с сервера
    } else {
      localStorage.removeItem('cart'); // Очищаем localStorage, если не авторизован
      setCart([]); // Очищаем состояние корзины
    }
  }, [isAuthenticated]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
