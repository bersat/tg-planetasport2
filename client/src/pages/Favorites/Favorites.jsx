import React, { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import './Favorites.css';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

function Favorites() {
  const [favorites, setFavorites] = useState([]);  // Инициализация как пустой массив
  const [sliderEnabled, setSliderEnabled] = useState(false);
  const containerRef = React.createRef();
  const navigate = useNavigate();
  const token = localStorage.getItem('auth_token');  // Проверка авторизации

  // Загрузка избранных товаров
  const loadFavorites = async () => {
    const isAuthenticated = Boolean(token);  // проверка авторизации

    if (isAuthenticated) {
      try {
        const response = await axios.get(`${API_URL}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Избранные товары:', response.data);
        if (Array.isArray(response.data)) {
          setFavorites(response.data);  // Добавлено обновление состояния
        } else {
          console.error('Получены некорректные данные');
        }
      } catch (error) {
        console.error('Ошибка при получении избранных товаров:', error);
      }
    } else {
      console.log('Пользователь не авторизован');
    }
  };

  // Загрузка избранных товаров при монтировании компонента
  useEffect(() => {
    loadFavorites();
  }, [token]);

  // Проверка и расчет общей суммы
  const totalPrice = (favorites || []).reduce((total, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    return total + price * quantity;
  }, 0);

  // Проверка и расчет количества товаров
  const totalQuantity = (favorites || []).reduce((total, item) => {
    const quantity = Number(item.quantity) || 1;
    return total + quantity;
  }, 0);

  // Настройки для карусели
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  // Функция для открытия товара в модальном окне
  const openProductInModal = (productId) => {
    navigate(`/catalog?productId=${productId}`);
  };

  // Функция для удаления товара из избранного
  const removeFromFavorites = async (productId) => {
    if (!token) {
      console.log('Пользователь не авторизован');
      return;
    }
    try {
      await axios.delete(`${API_URL}/api/favorites/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Убираем товар из локального состояния
      setFavorites(favorites.filter(item => item.id !== productId));

      // Перезагружаем страницу после успешного удаления
      window.location.reload();  // Это перезагрузит страницу и обновит данные
    } catch (error) {
      console.error('Ошибка при удалении товара из избранного:', error);
      alert('Ошибка при удалении товара');
    }
  };

  return (
    <div className="favorites-container" ref={containerRef}>
      <h1 className="favorites-header">Избранные товары</h1>
      {favorites.length === 0 ? (
        <p className="favorites-message">Ваш список избранных товаров пуст.</p>
      ) : (
        <div>
        <div className="favorites-carousel">
  {favorites.map((item) => (
    <div key={item.id} className="favorite-card">
      <img src={item.image_url} alt={item.title} />
      <h4>{item.title}</h4>
      <p>{item.description}</p>
      <span>{item.price} ₽</span>
      <div className="favorite-actions">
        <button className="details-btn" onClick={() => openProductInModal(item.id)}>
          Подробнее
        </button>
        <div className="remove-icon" onClick={() => removeFromFavorites(item.id)}>
          <FaTrash className="icon-remove" />
        </div>
      </div>
    </div>
  ))}
</div>
          <div className="total">
            <span>Итого: {totalPrice} ₽</span>
            <span>Количество товаров: {totalQuantity}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Favorites;
