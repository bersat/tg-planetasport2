import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProductModal.css';
import { useCart } from '../../components/CartContext';


const API_URL = process.env.REACT_APP_API_URL;

const colorMapping = {
  black: 'чёрный', red: 'красный', blue: 'синий', white: 'белый',
  green: 'зелёный', yellow: 'жёлтый', multicolor: 'разноцветный',
  gray: 'серый', beige: 'бежевый', 'dark-brown': 'тёмно-коричневый',
  swamp: 'болотный', 'dark-blue': 'тёмно-синий', 'light-lavender': 'светло-сиреневый',
};

function ProductModal({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const [stock, setStock] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const [filters, setFilters] = useState({
    minRating: 0,
    maxRating: 5,
    startDate: '',
    endDate: ''
  });

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // добавляем состояние для роли
  const token = localStorage.getItem('auth_token');
  const { addToCart } = useCart();

  useEffect(() => {
  if (token) {
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUserRole(decodedToken.role); // устанавливаем роль
    } catch (err) {
      console.error('Ошибка декодирования токена:', err);
    }

    axios.get(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setUser(res.data))
      .catch(console.error);
  }
}, [token]);

  // ====== Загрузка данных ======
  useEffect(() => {
    axios.get(`${API_URL}/products/${productId}`)
      .then(res => {
        setProduct(res.data);
        setStock(res.data.quantity);
      }).catch(console.error);

    if (token) {
      axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => setUser(res.data))
        .catch(console.error);
    }

    fetchReviews();
  }, [productId]);

  // ====== Получение отзывов с фильтрами ======
  const fetchReviews = () => {
    const params = new URLSearchParams(filters).toString();
    axios.get(`${API_URL}/products/${productId}/reviews?${params}`)
      .then(res => setReviews(res.data))
      .catch(console.error);
  };

  // ====== Отправка отзыва ======
  const submitReview = () => {
    if (!user) {
    alert("Вы должны быть авторизованы, чтобы оставить отзыв!");
    return;
  }

  const userId = user.id;  // Получаем id из объекта user

    axios.post(`${API_URL}/products/${productId}/reviews`, {
      rating,
      comment,
      user_id: userId,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      setRating(0);
      setComment('');
      setShowForm(false);
      fetchReviews();
    }).catch(console.error);
  };

  // ====== Удаление отзыва ======
 const deleteReview = async (id) => {
  if (!window.confirm("Удалить этот отзыв?")) return;

  try {
    await axios.delete(`${API_URL}/reviews/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchReviews();
  } catch (err) {
    alert("Не удалось удалить отзыв");
  }
};


  const getFirstName = fullName => fullName?.split(' ')[1] || '';

  const handleAddToCart = async () => {
    if (product.sizes?.length && !selectedSize) {
      alert("Выберите размер");
      return;
    }

    const productData = {
      product_id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      quantity: 1,
      size: selectedSize || null,
    };

    try {
      await axios.post(`${API_URL}/cart`, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      addToCart(productData);
      alert("Товар добавлен в корзину!");
    } catch (err) {
      alert("Ошибка при добавлении товара в корзину");
    }
  };

  if (!product) return null;

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h1>{product.title}</h1>
        <img className="product-image" src={product.image_url} alt={product.title} />
        <div className="product-description">
          <h3>Описание товара</h3>
          {product.description.split('\n').map((line, idx) => <p key={idx}>{line}</p>)}
        </div>

        {/* Характеристики */}
        <div className="product-characteristics">
          {product.sizes?.length > 0 && (
            <>
              <p><strong>Размеры:</strong></p>
              <div className="size-selection">
                {product.sizes.map((size, idx) => (
                  <button key={idx}
                    className={`size-button ${size === selectedSize ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </>
          )}
          <p><strong>Цвет:</strong> {colorMapping[product.color] || product.color}</p>
          <div className="color-box" style={{ backgroundColor: product.color === 'multicolor' ? '#ccc' : product.color }}></div>
        </div>

        <div><strong>Цена:</strong> {product.price} ₽</div>
        <p className="quantity">
          <span className="quantity-circle"></span>
          <span className="quantity-number">{stock} в наличии</span>
        </p>

        <button onClick={handleAddToCart} disabled={product.sizes?.length > 0 && !selectedSize}>
          В корзину
        </button>

        <hr />

        <h3>Отзывы</h3>

        {/* ======= Фильтры ======= */}
        <div className="filters">
          <label>Оценка: от
            <input type="number" min="0" max="5"
              value={filters.minRating}
              onChange={e => setFilters({ ...filters, minRating: e.target.value })}
            />
          </label>
          <label>до
            <input type="number" min="0" max="5"
              value={filters.maxRating}
              onChange={e => setFilters({ ...filters, maxRating: e.target.value })}
            />
          </label>
          <label>Дата с
            <input type="date"
              value={filters.startDate}
              onChange={e => setFilters({ ...filters, startDate: e.target.value })}
            />
          </label>
          <label>по
            <input type="date"
              value={filters.endDate}
              onChange={e => setFilters({ ...filters, endDate: e.target.value })}
            />
          </label>
          <button onClick={fetchReviews}>Применить</button>
        </div>

        {/* ======= Отзывы ======= */}
        {reviews.length === 0 && <p>Пока нет отзывов.</p>}
        {reviews.map(r => (
          <div key={r.id} className="review">
            <strong>{getFirstName(r.full_name)}</strong>
            <div>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
            <p>{r.comment}</p>
           {userRole === 'admin' && (
  <button onClick={() => deleteReview(r.id)} className="delete-review-button" title="Удалить отзыв">
    <img src="/img/icons8-удалить-48.png" alt="Удалить" />
  </button>
)}

          </div>
        ))}

        {/* ======= Форма отзыва ======= */}
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Скрыть форму' : 'Оставить отзыв'}
        </button>

        {showForm && (
          <div className="review-form">
            <div className="stars">
              {[1, 2, 3, 4, 5].map(n => (
                <span key={n}
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
