import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
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

  const navigate = useNavigate();
  const { search } = useLocation();

  // Извлекаем параметры фильтров из URL
  const queryParams = new URLSearchParams(search);
  const urlCategory = queryParams.get('category');
  const urlGender = queryParams.get('gender');
  const urlType = queryParams.get('type');

  // Устанавливаем значения фильтров из URL при загрузке страницы
  useEffect(() => {
    if (urlCategory) setSelectedCategory(urlCategory);
    if (urlGender) setSelectedGender(urlGender);
    if (urlType) setSelectedType(urlType);
  }, [urlCategory, urlGender, urlType]);

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
    navigate('/catalog');
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    navigate(`/catalog?category=${category}`); // передаем фильтр в URL
  };

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
    navigate(`/catalog?category=${selectedCategory}&gender=${gender}`); // передаем фильтры в URL
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    navigate(`/catalog?category=${selectedCategory}&gender=${selectedGender}&type=${type}`); // передаем фильтры в URL
  };

  // Функция для отображения заголовка в зависимости от выбранных фильтров
  const renderHeader = () => {
    let title = 'Каталог'; // Заголовок по умолчанию

    if (selectedCategory) {
      title = selectedCategory;
    }

    if (selectedGender) {
      title = `${selectedGender}`;
    }

    if (selectedType) {
      title = `${selectedType}`;
    }

    const productsCount = products.length;
    return `${title} (${productsCount})`;
  };

  return (
    <div className="catalog">
      <h1>{renderHeader()}</h1> {/* Отображаем динамичный заголовок */}

      <Breadcrumbs
        selectedCategory={selectedCategory}
        selectedGender={selectedGender}
        selectedType={selectedType}
        onClickLevel={(level) => {
          if (level === 'catalog') {
            handleReset();
          } else if (level === 'category') {
            setSelectedGender(null);
            setSelectedType(null);
            navigate(`/catalog?category=${selectedCategory}`);
          } else if (level === 'gender') {
            setSelectedType(null);
            navigate(`/catalog?category=${selectedCategory}&gender=${selectedGender}`);
          } else if (level === 'type') {
            navigate(`/catalog?category=${selectedCategory}&gender=${selectedGender}&type=${selectedType}`);
          }
        }}
      />

      {/* Шаг 1: Категории */}
      {!selectedCategory && (
        <div className="step step-categories">
          <h3>Выберите категорию:</h3>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => handleCategorySelect(cat.name)}>
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
            <button key={g.id} onClick={() => handleGenderSelect(g.name)}>
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
            <button key={t.id} onClick={() => handleTypeSelect(t.name)}>
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
                  <button
                    className="view-details"
                    onClick={() => navigate(`/product/${prod.id}?category=${selectedCategory}&gender=${selectedGender}&type=${selectedType}`)} // Переход на страницу товара с фильтрами в URL
                  >
                    Подробнее
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
