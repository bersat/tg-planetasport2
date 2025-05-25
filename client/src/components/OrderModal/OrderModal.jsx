// src/components/OrderModal.js
import React, { useState } from 'react';
import './OrderModal.css';

function OrderModal({ cart, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    const orderNumber = Math.floor(Math.random() * 100000);
    alert(`Номер заказа: №${orderNumber}\nТелефон: ${formData.phone}\nЭлектронная почта: ${formData.email}\nТовары: ${totalItems} шт.\nОбщая сумма: ${totalPrice} ₽`);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Оформление заказа</h2>
        <ul className="order-items">
          {cart.map((item) => (
            <li key={item.id}>
              <span>{item.title} (x{item.quantity})</span>
              <span>{item.price} ₽</span>
            </li>
          ))}
        </ul>
        <div className="order-summary">
          <p>Общее количество товаров: {totalItems}</p>
          <p>Общая сумма: {totalPrice} ₽</p>
        </div>
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
          <button type="button" onClick={handleSubmit}>Оформить заказ</button>
        </form>
      </div>
    </div>
  );
}

export default OrderModal;
