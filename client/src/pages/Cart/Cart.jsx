import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import './cart.css';
import RecommendedProducts from '../../components/RecommendProducts/RecommendProducts';
import OrderModal from '../../components/OrderModal/OrderModal';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [stockData, setStockData] = useState({});

  // Функция для получения данных о наличии товара с сервера
  const fetchStockData = async (productId) => {
    try {
      const res = await axios.get(`${API_BASE}/products/${productId}`);
      return res.data.quantity; // Предполагаем, что API возвращает количество товара в поле 'quantity'
    } catch (error) {
      console.error('Ошибка при получении данных о наличии товара:', error);
      return 0;  // Если возникла ошибка, возвращаем 0
    }
  };

  // Получаем данные о наличии для каждого товара в корзине
  useEffect(() => {
    const token = localStorage.getItem('auth_token');

    const getCartData = async () => {
      try {
        const response = await axios.get(`${API_BASE}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCart(response.data);

        // Получаем stockData для каждого товара в корзине
        const stockDataPromises = response.data.map(item =>
          fetchStockData(item.product_id)
        );

        const stockQuantities = await Promise.all(stockDataPromises);

        // Обновляем stockData состоянием, где ключ - product_id, а значение - quantity
        const stockObj = response.data.reduce((acc, item, index) => {
          acc[item.product_id] = stockQuantities[index];
          return acc;
        }, {});

        setStockData(stockObj);

        // Теперь пересчитываем итоговую сумму
        const initialTotal = response.data.reduce((total, item) => total + (item.price * item.quantity), 0);
        setTotalPrice(initialTotal);

      } catch (error) {
        console.error('Ошибка при получении данных о корзине:', error);
      }
    };

    getCartData();
  }, []);

  // Функция для обновления количества товара в корзине
  const updateQuantity = (productId, newQuantity) => {
    const stock = stockData[productId] || 0;

    // Ограничиваем минимальное количество 1, и максимальное количество доступным на складе
    if (newQuantity < 1 || newQuantity > stock) {
      return;
    }

    // Обновляем локальную корзину
    setCart(prevCart => {
      return prevCart.map(item =>
        item.product_id === productId ? { ...item, quantity: newQuantity } : item
      );
    });

    // Пересчитываем общую стоимость после изменения количества
    const updatedTotal = cart.reduce((total, item) =>
      total + (item.product_id === productId ? item.price * newQuantity : item.price * item.quantity), 0
    );
    setTotalPrice(updatedTotal);
  };

  // Функция для удаления товара из корзины
 // Функция для удаления товара из корзины
const removeFromCart = async (cartItemId) => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.error('Токен не найден');
    return;
  }

  try {
    const response = await axios.delete(`${API_BASE}/cart/${cartItemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Ответ от сервера:', response.data);

    // Обновляем корзину, удаляя товар с id cartItemId
    const updatedCart = cart.filter(item => item.id !== cartItemId);

    // Пересчитываем итоговую сумму
    const updatedTotal = updatedCart.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Обновляем состояние корзины и итоговой суммы
    setCart(updatedCart);
    setTotalPrice(updatedTotal); // Обновляем итоговую сумму

    // Перезагрузка страницы
    window.location.reload(); // Перезагружаем страницу
  } catch (error) {
    console.error('Ошибка при удалении товара из корзины:', error);
  }
};


  // Функция для перехода к оформлению заказа
  const handleGoToCheckout = () => {
    setIsModalOpen(true);
  };

  // Функция для закрытия модального окна
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="cart">
        <h1>Корзина</h1>
        {cart.length === 0 ? (
          <p>Ваша корзина пуста</p>
        ) : (
          <div>
            <ul>
              {cart.map((item) => {
                const stock = stockData[item.product_id] || 0;
                return (
                  <li key={item.product_id} className="cart-item">
                    <img src={item.image_url} alt={item.title} />
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                      <span>Цена: {item.price} ₽</span>
                      {item.size && <p>Размер: {item.size}</p>}
                      <p className="quantity">
                        <span className="quantity-circle"></span>
                        <span className="quantity-number">{stock} в наличии</span>
                      </p>
                      <div className="quantity">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          disabled={item.quantity >= stock}
                        >
                          +
                        </button>
                      </div>

                      <div className="remove-icon" onClick={() => removeFromCart(item.id)}>
                        <FaTrash className="icon-remove" />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="total">
              <span>Итого: {totalPrice} ₽</span>
              <button onClick={handleGoToCheckout}>Перейти к покупкам</button>
            </div>
          </div>
        )}
      </div>
      <RecommendedProducts /> {/* Рекомендуемые товары */}

      {isModalOpen && <OrderModal cart={cart} onClose={handleCloseModal} />} {/* Модальное окно */}
    </div>
  );
}

export default Cart;
