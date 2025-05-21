import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import axios from 'axios';
import { useCart } from '../../components/CartContext';
import { useNavigate } from 'react-router-dom';
import './catalog.css';

const API_BASE = 'http://localhost:5000/api';

function Catalog() {
  const [categories, setCategories] = useState([]);
  const [genders, setGenders] = useState([]);
  const [types, setTypes] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [quantities, setQuantities] = useState({});

    const { cart, addToCart } = useCart();
    const navigate = useNavigate();


  // Загрузка всех категорий при загрузке страницы
  useEffect(() => {
    axios.get(`${API_BASE}/categories`)
      .then(res => setCategories(res.data))
      .catch(err => console.error('Ошибка загрузки категорий:', err));
  }, []);

  // Загрузка полов после выбора категории
  useEffect(() => {
    if (selectedCategory) {
      axios.get(`${API_BASE}/genders`)
        .then(res => setGenders(res.data))
        .catch(err => console.error('Ошибка загрузки полов:', err));
    }
  }, [selectedCategory]);

  // Загрузка типов после выбора категории и пола
  useEffect(() => {
    if (selectedCategory && selectedGender) {
      axios.get(`${API_BASE}/types`, { params: { category: selectedCategory } })
        .then(res => setTypes(res.data))
        .catch(err => console.error('Ошибка загрузки типов:', err));
    }
  }, [selectedCategory, selectedGender]);

  // Загрузка товаров при любом изменении фильтров
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (selectedGender) params.gender = selectedGender;
        if (selectedType) params.type = selectedType;

        const res = await axios.get(`${API_BASE}/products`, { params });
        setProducts(res.data);
      } catch (err) {
        console.error('Ошибка загрузки товаров:', err);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedGender, selectedType]);

  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedGender(null);
    setSelectedType(null);
    };



  return (
    <div className="catalog">
          <h1>Каталог товаров</h1>
          <Breadcrumbs
  selectedCategory={selectedCategory}
  selectedGender={selectedGender}
  selectedType={selectedType}
  onClickLevel={(level) => {
    if (level === 'catalog') {
      setSelectedCategory(null);
      setSelectedGender(null);
      setSelectedType(null);
    } else if (level === 'category') {
      setSelectedGender(null);
      setSelectedType(null);
    } else if (level === 'gender') {
      setSelectedType(null);
    }
    // 'type' — ничего не сбрасываем, он и так последний
  }}
/>
      {/* Шаг 1: Категории */}
      {!selectedCategory && (
        <div className="step step-categories">
          <h3>Выберите категорию:</h3>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.name)}>
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Шаг 2: Пол */}
      {selectedCategory && !selectedGender && (
        <div className="step step-genders">
          <h3>Категория: {selectedCategory}</h3>
          <h3>Выберите пол:</h3>
          {genders.map(g => (
            <button key={g.id} onClick={() => setSelectedGender(g.name)}>
              {g.name}
            </button>
          ))}
        </div>
      )}

      {/* Шаг 3: Тип */}
      {selectedGender && !selectedType && (
        <div className="step step-types">
          <h3>Пол: {selectedGender}</h3>
          <h3>Выберите тип товара:</h3>
          {types.map(t => (
            <button key={t.id} onClick={() => setSelectedType(t.name)}>
              {t.name}
            </button>
          ))}
        </div>
      )}

      {(selectedCategory || selectedGender || selectedType) && (
        <div className="step step-reset">
          <button className="reset" onClick={handleReset}>Сбросить фильтры</button>
        </div>
      )}

           {/* Блок товаров */}
      <div className="products">
        <h2>Товары</h2>
        {products.length > 0 ? (
          <div className="product-list">
            {products.map(prod => (
              <div className="product" key={prod.id}>
                <img src={prod.image_url} alt={prod.title} />
                <h4>{prod.title}</h4>
                <p>{prod.description}</p>
                <span className="price">{prod.price} ₽</span>
                <div className="product-actions">
                  <div className="quantity-controls">
                    <button onClick={() =>
                      setQuantities(prev => ({
                        ...prev,
                        [prod.id]: Math.max((prev[prod.id] || 1) - 1, 1)
                      }))
                    }>-</button>
                    <span>{quantities[prod.id] || 1}</span>
                    <button onClick={() =>
                      setQuantities(prev => ({
                        ...prev,
                        [prod.id]: (prev[prod.id] || 1) + 1
                      }))
                    }>+</button>
                  </div>
                  <button
  className="add-to-cart"
  onClick={() => {
    const quantity = quantities[prod.id] || 1;
    addToCart({ ...prod, quantity });
    navigate('/cart');
  }}
>
  В корзину
</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Товары не найдены</p>
        )}
      </div>

    </div>
  );
}

export default Catalog;
