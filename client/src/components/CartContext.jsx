import React, { createContext, useState, useContext, useEffect } from 'react';

// Контекст корзины
const CartContext = createContext();

// Провайдер корзины
export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Загружаем корзину из localStorage при первом рендере
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart'));
    if (storedCart) {
      setCart(storedCart);
    }
  }, []);

  // Сохраняем корзину в localStorage всякий раз, когда она меняется
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  // Добавление товара в корзину с учетом размера
  const addToCart = (product) => {
    setCart(prevCart => {
      // Проверяем, есть ли уже такой товар с таким размером в корзине
      const existingItem = prevCart.find(item => item.id === product.id && item.size === product.size);

      if (existingItem) {
        // Если товар с таким размером есть, увеличиваем его количество
        return prevCart.map(item =>
          item.id === product.id && item.size === product.size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Если товара нет, добавляем новый товар с выбранным размером
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Удаление товара из корзины с учетом размера
  const removeFromCart = (productId, size) => {
    const updatedCart = cart.filter((item) => item.id !== productId || item.size !== size);
    setCart(updatedCart);

    // Сохраняем обновленную корзину в localStorage
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Очистка корзины
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart'); // Удаляем корзину из localStorage
  };

  // Обновление количества товара в корзине с учетом размера
  const updateQuantity = (productId, size, quantity) => {
    setCart(prevCart => {
      return prevCart.map((item) =>
        item.id === productId && item.size === size
          ? quantity > 0
            ? { ...item, quantity } // Если количество больше 0, обновляем
            : item // Если количество меньше или равно 0, ничего не меняем
          : item
      );
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

// Хук для использования корзины
export function useCart() {
  return useContext(CartContext);
}
