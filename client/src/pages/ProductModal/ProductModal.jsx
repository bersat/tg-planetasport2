import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProductModal.css';
import { useCart } from '../../components/CartContext';

// Маппинг цветов с английского на русский
const colorMapping = {
  black: 'чёрный',
  red: 'красный',
  blue: 'синий',
  white: 'белый',
  green: 'зелёный',
  yellow: 'жёлтый',
  multicolor: 'разноцветный',
  gray: 'серый',
  beige: 'бежевый',
  'dark-brown': 'тёмно-коричневый',
  swamp: 'болотный',
  'dark-blue':'тёмно-синий',
   'light-lavender': 'светло-сиреневый',
  // Добавьте другие цвета по необходимости
};

const API_BASE = 'http://localhost:5000/api';

function ProductModal({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedSize, setSelectedSize] = useState(null); // Состояние для выбранного размера
  const { addToCart } = useCart();

  const token = localStorage.getItem('auth_token'); // Получаем токен из localStorage
  const [userId, setUserId] = useState(null);

  // Функция для получения второго слова из ФИО (имени)
  const getFirstName = (fullName) => {
    if (!fullName) return ''; // Если fullName пустое или undefined, возвращаем пустую строку
    const nameParts = fullName.split(' '); // Разделяем строку по пробелам
    return nameParts.length > 1 ? nameParts[1] : ''; // Возвращаем второе слово (имя), если оно есть, иначе пустую строку
  };

  useEffect(() => {
    if (token) {
      const fetchUserData = async () => {
        try {
          const res = await axios.get(`${API_BASE}/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserId(res.data.id);
        } catch (error) {
          console.error('Ошибка получения данных о пользователе:', error);
        }
      };
      fetchUserData();
    }

    // Загрузка данных о товаре
    axios.get(`${API_BASE}/products/${productId}`)
      .then(res => setProduct(res.data))
      .catch(console.error);

    // Загрузка отзывов
    axios.get(`${API_BASE}/products/${productId}/reviews`)
      .then(res => setReviews(res.data))
      .catch(console.error);
  }, [productId, token]);

  const submitReview = () => {
    if (!userId) {
      alert("Вы должны быть авторизованы, чтобы оставить отзыв!");
      return;
    }

    // Отправка отзыва на сервер
    axios.post(`${API_BASE}/products/${productId}/reviews`, {
      rating,
      comment,
      user_id: userId,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => {
      setShowForm(false);
      setRating(0);
      setComment('');
      return axios.get(`${API_BASE}/products/${productId}/reviews`);
    }).then(res => setReviews(res.data))
      .catch(console.error);
  };

  const renderDescription = (description) => {
    return description.split('\n').map((str, index) => <p key={index}>{str}</p>);
  };

  // Обработчик выбора размера
  const handleSizeSelect = (size) => {
    if (selectedSize) return; // Если размер уже выбран, игнорируем клики
    setSelectedSize(size); // Устанавливаем выбранный размер в состояние
    console.log(`Вы выбрали размер: ${size}`);
  };

  if (!product) return null;

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h1>{product.title}</h1>
        <img className="product-image" src={product.image_url} alt={product.title} />

        {/* Описание товара с переносами */}
        <div className="product-description">
          <h3>Описание товара</h3>
          {renderDescription(product.description)}
        </div>

        {/* Характеристики товара */}
        <div className="product-characteristics">
          <p><strong>Размеры:</strong></p>
          {product.sizes && product.sizes.length > 0 ? (
            <div className="size-selection">
              {product.sizes.map((size, index) => (
                <button
                  key={index}
                  onClick={() => handleSizeSelect(size)}
                  className={`size-button ${size === selectedSize ? 'selected' : ''}`}
                  disabled={selectedSize !== null && size !== selectedSize} // Отключаем кнопки после выбора
                >
                  {size}
                </button>
              ))}
            </div>
          ) : (
            <p>Размеры для этого товара не указаны.</p>
          )}

          <p><strong>Цвет:</strong> {colorMapping[product.color] || product.color}</p>
          <div className="color-box" style={{ backgroundColor: product.color === 'multicolor' ? '#ccc' : product.color }}></div>
        </div>

        <div><spap style={{fontWeight:'700'}}>Цена:</spap> <span className="product-price"> {product.price} ₽</span></div>
        <button onClick={() => addToCart({ ...product, size: selectedSize })} disabled={!selectedSize}>В корзину</button>

        <hr />

        <h3>Отзывы</h3>
        {reviews.length === 0 && <p>Пока нет отзывов.</p>}
        {reviews.map(r => (
          <div key={r.id} className="review">
            <strong>{getFirstName(r.full_name)}</strong>
            <div>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
            <p>{r.comment}</p>
          </div>
        ))}

        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Скрыть форму' : 'Оставить отзыв'}
        </button>

        {showForm && (
          <div className="review-form">
            <div className="stars">
              {[1, 2, 3, 4, 5].map(n => (
                <span
                  key={n}
                  onClick={() => setRating(n)}
                  style={{ cursor: 'pointer', color: n <= rating ? 'gold' : '#ccc' }}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ваш комментарий"
            />
            <button onClick={submitReview}>Отправить</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductModal;
