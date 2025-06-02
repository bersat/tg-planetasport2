import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrderModal.css';

const API_URL = process.env.REACT_APP_API_URL;

function OrderModal({ cart, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [formError, setFormError] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [userId, setUserId] = useState(null);

  // Расчет общей суммы и количества
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = decodedToken.exp * 1000;
        const currentTime = Date.now();

        if (currentTime > expirationTime) {
          localStorage.removeItem('auth_token');
          setIsAuthorized(false);
        } else {
          setIsAuthorized(true);
          setUserId(decodedToken.id);
        }
      } catch (error) {
        console.error('Ошибка декодирования токена:', error);
        setIsAuthorized(false);
      }
    } else {
      setIsAuthorized(false);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    const { name, phone, email, address } = formData;

    // Проверка на заполнение всех полей формы
    if (!name || !phone || !email || !address) {
      setFormError('Пожалуйста, заполните все поля перед оформлением заказа.');
      return;
    }

    setFormError(''); // Сброс ошибки при успешной валидации

    if (!isAuthorized || !userId) {
      alert('Пожалуйста, авторизуйтесь для оформления заказа.');
      return;
    }

    // Формируем объект заказа с товарами и user_id
    const orderData = {
      user_id: userId,
      name,
      phone,
      email,
      address,
      totalItems,
      totalPrice,
      orderItems: cart.map((item) => ({
        product_id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        size: item.size || null, // Optional size field
        color: item.color || null, // Optional color field
      })),
    };

    try {
      // Отправка данных на сервер
      const response = await axios.post(`${API_URL}/api/orders`, orderData);
       const orderNumber = response.data.orderNumber;
      alert(`Ваш заказ №${orderNumber} оформлен! Сейчас вы будете перенаправлены на страницу оплаты.`);
       // Перенаправление на DonationAlerts
      const paymentUrl = `https://www.donationalerts.com/r/bersat`;

          window.location.href = paymentUrl;
      onClose(); // Закрытие модального окна после успешного оформления
    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error);
      alert('Ошибка при оформлении заказа. Попробуйте позже.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Оформление заказа</h2>

        {/* Список товаров в заказе */}
        <ul className="order-items">
          {cart.map((item) => (
            <li key={`${item.id}-${item.size || 'no-size'}`}>
              <div>
                <span>{item.title} (x{item.quantity})</span>
                {item.size && <span> — Размер: {item.size}</span>}
                {item.color && <span> — Цвет: {item.color}</span>}
              </div>
              <span>{item.price} ₽</span>
            </li>
          ))}
        </ul>

        {/* Сумма и количество товаров */}
        <div className="order-summary">
          <p>Общее количество товаров: {totalItems}</p>
          <p>Общая сумма: {totalPrice} ₽</p>
        </div>

        {/* Ошибка при заполнении формы */}
        {formError && <p className="form-error">{formError}</p>}

        {/* Форма для данных клиента */}
        <form className="order-form">
          <input
            type="text"
            name="name"
            placeholder="ФИО"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Номер телефона"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Электронная почта"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Адрес доставки"
            value={formData.address}
            onChange={handleChange}
            required
          />

          {/* Кнопка для отправки заказа */}
          <button type="button" onClick={handleSubmit}>Оформить заказ</button>
        </form>
      </div>
    </div>
  );
}

export default OrderModal;
