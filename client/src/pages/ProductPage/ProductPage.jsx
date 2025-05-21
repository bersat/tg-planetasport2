import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import './ProductPage.css';
import { useCart } from '../../components/CartContext'; // Импортируем хук для корзины

const API_BASE = 'http://localhost:5000/api';

function ProductPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);

  const { cart, addToCart } = useCart(); // Используем хук для корзины

  const navigate = useNavigate();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);

  const getValidParam = (param) => (param === 'null' || param === 'undefined' || !param ? null : param);

  const urlCategory = getValidParam(queryParams.get('category'));
  const urlGender = getValidParam(queryParams.get('gender'));
  const urlType = getValidParam(queryParams.get('type'));

  // Загружаем товар по его ID
  useEffect(() => {
    axios.get(`${API_BASE}/products/${productId}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error('Ошибка загрузки товара:', err));
  }, [productId]);

  if (!product) return <div>Загрузка...</div>;

  const handleAddToCart = () => {
    addToCart(product); // Добавляем товар в корзину через хук
  };

  return (
    <div className="product-page">
      <h1>{product.title}</h1>
      <Breadcrumbs
        selectedCategory={urlCategory}
        selectedGender={urlGender}
        selectedType={urlType}
        selectedProduct={product.title}
        onClickLevel={(level) => {
          if (level === 'catalog') {
            navigate('/catalog');
          } else if (level === 'category') {
            navigate(`/catalog?category=${urlCategory}`);
          } else if (level === 'gender') {
            navigate(`/catalog?category=${urlCategory}&gender=${urlGender}`);
          } else if (level === 'type') {
            navigate(`/catalog?category=${urlCategory}&gender=${urlGender}&type=${urlType}`);
          } else if (level === 'product') {
            navigate(`/product/${product.id}?category=${urlCategory}&gender=${urlGender}&type=${urlType}`);
          }
        }}
      />

      <div className="product-details">
        <img className="product-image" src={product.image_url} alt={product.title} />
        <div className="product-info">
          <p className="product-description">{product.description}</p>
          <span className="product-price">{product.price} ₽</span>
          <button className="add-to-cart" onClick={handleAddToCart}>В корзину</button>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
