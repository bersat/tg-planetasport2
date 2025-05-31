import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './RecommendProducts.css';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

function RecommendedProducts() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/products`)
      .then(res => {
        const shuffled = res.data.sort(() => 0.5 - Math.random());
        setProducts(shuffled.slice(0, 10)); // максимум 10
      })
      .catch(err => console.error('Ошибка загрузки рекомендуемых товаров:', err));
  }, []);

  const openProductInModal = (productId) => {
    // Переходим на каталог и передаем ID товара в URL
    navigate(`/catalog?productId=${productId}`);
  };

  return (
    <div className="recommended-section">
      <h2>Рекомендуем</h2>
      <div className="recommended-carousel">
        {products.map(prod => (
          <div className="recommended-card" key={prod.id}>
            <img src={prod.image_url} alt={prod.title} />
            <h4>{prod.title}</h4>
            <p className="brand">Бренд: {prod.brand_name || '—'}</p>
            <span className="price">{prod.price} ₽</span>
            <button
              onClick={() => openProductInModal(prod.id)}  // Передаем ID товара через URL
            >
              Подробнее
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendedProducts;
