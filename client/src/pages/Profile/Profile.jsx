import React, { useEffect, useState } from 'react';
import './Profile.css';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);  // Новое состояние для заказов
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [originalData, setOriginalData] = useState(null); // Для сохранения исходных данных

  // Загружаем данные пользователя
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');

        // Запрос профиля пользователя
        const res = await axios.get('http://localhost:5000/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
        setOriginalData(res.data); // Сохраняем исходные данные для восстановления
        setFormData({
          full_name: res.data.full_name,
          email: res.data.email,
          phone: res.data.phone
        });

        // Запрос заказов пользователя
        try {
          const ordersRes = await axios.get('http://localhost:5000/api/orders', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // Если заказов нет, то пустой массив
          setOrders(ordersRes.data || []); // Сохраняем заказы пользователя

        } catch (err) {
          console.error('Ошибка при загрузке заказов:', err);
          // Если заказов нет или произошла ошибка, оставляем пустой массив
          setOrders([]);
        }

      } catch (err) {
        console.error('Ошибка загрузки профиля:', err);
        setError('Ошибка загрузки данных. Проверьте авторизацию.');
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { full_name, email, phone } = formData;

    const token = localStorage.getItem('auth_token');
    try {
      const res = await axios.put(
        'http://localhost:5000/api/profile',
        { full_name, email, phone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(res.data.user);
      setIsEditing(false);
      setSuccessMessage('Профиль обновлен!');
      setTimeout(() => setSuccessMessage(''), 3000); // Сообщение исчезает через 3 секунды
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
      if (err.response) {
        console.error('Ответ от сервера:', err.response.data);
        setError(err.response?.data?.message || 'Ошибка обновления профиля');
      }
      setIsEditing(false); // Закрываем форму редактирования при ошибке

      // Убираем ошибку через 3 секунды и перезагружаем страницу
      setTimeout(() => {
        setError('');
        window.location.reload(); // Перезагрузка страницы
      }, 3000);
    }
  };

  // Если ошибка загрузки
  if (error) {
    return (
      <div className="profile-container">
        <p className="profile-error">{error}</p>
        <div className="profile-info">
          {/* Показываем исходные данные даже в случае ошибки */}
          <p><span className="profile-label">ФИО:</span> {originalData?.full_name || '---'}</p>
          <p><span className="profile-label">Email:</span> {originalData?.email || '---'}</p>
          <p><span className="profile-label">Телефон:</span> {originalData?.phone || '---'}</p>
        </div>
      </div>
    );
  }

  // Если данные не загружены
  if (!user) {
    return (
      <div className="profile-container">
        <p className="profile-loading">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2 className="profile-title">Ваш профиль</h2>

      {/* Сообщение об успешном обновлении */}
      {successMessage && <p className="profile-success">{successMessage}</p>}

      {/* Сообщение об ошибке при обновлении */}
      {error && <p className="profile-error">{error}</p>}

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="profile-edit">
            <label>
              <span className="profile-label">ФИО:</span>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="profile-input"
              />
            </label>
            <label>
              <span className="profile-label">Email:</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="profile-input"
              />
            </label>
            <label>
              <span className="profile-label">Телефон:</span>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="profile-input"
              />
            </label>
            <div className="button-container">
              <button type="submit" className="save-btn">Сохранить</button>
              <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Отмена</button>
            </div>
          </div>
        </form>
      ) : (
        <div className="profile-info">
          {/* Отображаем исходные данные */}
          <p><span className="profile-label">ФИО:</span> {user.full_name}</p>
          <p><span className="profile-label">Email:</span> {user.email}</p>
          <p><span className="profile-label">Телефон:</span> {user.phone}</p>
          <button className="edit-btn" onClick={() => setIsEditing(true)}>Редактировать</button>
        </div>
      )}

      {/* Отображаем заказы пользователя */}
      <h3 className="profile-orders-title">Ваши заказы</h3>
      {orders.length === 0 ? (
        <p>У вас нет заказов.</p>
      ) : (
        <ul className="orders-list">
          {orders.map((order) => (
            <li key={order.order_number} className="order-item">
              <h4>Заказ №{order.order_number}</h4>
              <p>Дата заказа: {new Date(order.created_at).toLocaleDateString()}</p>
              <p>Общая сумма: {order.total_price} ₽</p>
              <p>Товары:</p>
              <ul>
                {order.items.map((item) => (
                  <li key={item.product_id}>
                    {item.title} — {item.quantity} шт. (Размер: {item.size})
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Profile;
