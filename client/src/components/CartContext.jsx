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

  // Добавление товара в корзину
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      } else {
        return [...prevCart, { ...product }];
      }
    });
  };

  // Удаление товара из корзины
  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
  };

  // Очистка корзины
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart'); // Удаляем корзину из localStorage
  };

  // Обновление количества товара в корзине
  const updateQuantity = (productId, quantity) => {
    setCart(cart.map((item) =>
      item.id === productId ? { ...item, quantity: quantity } : item
    ));
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
