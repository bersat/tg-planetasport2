import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import FilterWrapper from '../../components/FilterWrapper/FilterWrapper'; // поправь путь, если нужно
import './catalog.css';
import ProductModal from '../ProductPage/ProductModal';
import { useFavorites } from '../../components/FavoritesContext'; // Импортируем хук для работы с избранными
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Для иконок сердечка


const API_BASE = 'http://localhost:5000/api';

function Catalog() {
  const [categories, setCategories] = useState([]);
  const [genders, setGenders] = useState([]);
  const [types, setTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [modalProductId, setModalProductId] = useState(null);
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();



  // Фильтры
  const [brands, setBrands] = useState([]);
  const [features, setFeatures] = useState([]);
  const [sizes, setSizes] = useState([]);

  // Выбранные фильтры (кроме category, gender, type, которые берутся из URL)
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState({ min: 0, max: 30000 });

  const [activeFilter, setActiveFilter] = useState(null); // 'price', 'brand', 'feature', 'size' или null

  const navigate = useNavigate();
  const { search } = useLocation();

  // Парсим URL параметры (категория, пол, тип) каждый раз при изменении search
  const queryParams = new URLSearchParams(search);
  const selectedCategory = queryParams.get('category');
  const selectedGender = queryParams.get('gender');
  const selectedType = queryParams.get('type');
   const productIdFromUrl = queryParams.get('productId');

  // Загрузка справочных данных при монтировании
  useEffect(() => {
    axios.get(`${API_BASE}/categories`).then(res => setCategories(res.data)).catch(console.error);
    axios.get(`${API_BASE}/brands`).then(res => setBrands(res.data)).catch(console.error);
    axios.get(`${API_BASE}/features`).then(res => setFeatures(res.data)).catch(console.error);
    axios.get(`${API_BASE}/sizes`).then(res => setSizes(res.data)).catch(console.error);
  }, []);

  // Загрузка полов при выборе категории (selectedCategory берется из URL)
  useEffect(() => {
    if (selectedCategory) {
      axios.get(`${API_BASE}/genders`).then(res => setGenders(res.data)).catch(console.error);
    } else {
      setGenders([]);
    }
  }, [selectedCategory]);

  // Загрузка типов при выборе категории и пола (selectedCategory, selectedGender из URL)
  useEffect(() => {
    if (selectedCategory && selectedGender) {
      axios.get(`${API_BASE}/types`, { params: { category: selectedCategory } })
        .then(res => setTypes(res.data))
        .catch(console.error);
    } else {
      setTypes([]);
    }
  }, [selectedCategory, selectedGender]);

  // Универсальная функция переключения элемента в массиве выбранных фильтров
  const toggleSelection = (item, selectedList, setSelectedList) => {
    if (selectedList.includes(item)) {
      setSelectedList(selectedList.filter(i => i !== item));
    } else {
      setSelectedList([...selectedList, item]);
    }
  };

  // Загрузка товаров с учётом всех фильтров (включая category, gender, type из URL)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (selectedGender) params.gender = selectedGender;
        if (selectedType) params.type = selectedType;

        if (selectedBrands.length) params.brand = selectedBrands.join(',');
        if (selectedFeatures.length) params.feature = selectedFeatures;
        if (selectedSizes.length) params.size = selectedSizes.join(',');
        if (selectedPrice.min) params.priceMin = selectedPrice.min;
        if (selectedPrice.max) params.priceMax = selectedPrice.max;

        const res = await axios.get(`${API_BASE}/products`, { params });
        setProducts(res.data);
      } catch (err) {
        console.error('Ошибка загрузки товаров:', err);
      }
    };

    fetchProducts();
  }, [
    selectedCategory,
    selectedGender,
    selectedType,
    selectedBrands,
    selectedFeatures,
    selectedSizes,
    selectedPrice,
  ]);

    // Если есть productId в URL, сразу открываем товар в модальном окне
  useEffect(() => {
    if (productIdFromUrl) {
      setModalProductId(productIdFromUrl);
    }
  }, [productIdFromUrl]);

   const handleOpenProductModal = (id) => {
    setModalProductId(id);
    navigate(`/catalog?productId=${id}`); // Обновляем URL с ID товара
  };

   const handleCloseModal = () => {
    setModalProductId(null);
    navigate('/catalog'); // Возвращаемся на каталог без параметра productId
  };

  // Обработчики выбора категории, пола, типа — меняют URL
  const handleCategorySelect = (category) => {
    navigate(`/catalog?category=${category}`);
    setSelectedBrands([]);
    setSelectedFeatures([]);
    setSelectedSizes([]);
    setSelectedPrice({ min: '', max: '' });
    setActiveFilter(null);
  };

  const handleGenderSelect = (gender) => {
    navigate(`/catalog?category=${selectedCategory}&gender=${gender}`);
    setSelectedBrands([]);
    setSelectedFeatures([]);
    setSelectedSizes([]);
    setSelectedPrice({ min: '', max: '' });
    setActiveFilter(null);
  };

  const handleTypeSelect = (type) => {
    navigate(`/catalog?category=${selectedCategory}&gender=${selectedGender}&type=${type}`);
    setSelectedBrands([]);
    setSelectedFeatures([]);
    setSelectedSizes([]);
    setSelectedPrice({ min: '', max: '' });
    setActiveFilter(null);
  };

  // Цена
const handlePriceChange = (e) => {
  const { name, value } = e.target || {}; // Добавляем проверку на undefined
  if (name && value !== undefined) { // Проверяем, что name и value существуют
    const newValue = value ? parseInt(value) : ''; // Преобразуем пустое значение в пустую строку
    setSelectedPrice(prev => ({
      ...prev,
      [name]: newValue,
    }));
  }
};

  // Сброс фильтров полностью — возвращаемся на общий каталог без параметров
  const handleReset = () => {
    setSelectedBrands([]);
    setSelectedFeatures([]);
    setSelectedSizes([]);
    setSelectedPrice({ min: '', max: '' });
    setActiveFilter(null);
    navigate('/catalog');
  };

  const isFavorite = (productId) => favorites.some(prod => prod.id === productId);

  const toggleFavorite = (product) => {
  if (isFavorite(product.id)) {
    removeFromFavorites(product.id); // Убираем из избранного
  } else {
    addToFavorites(product); // Добавляем в избранное
  }
};



  // Заголовок
  const renderHeader = () => {
    if (selectedType) return selectedType;
    if (selectedGender) return selectedGender;
    if (selectedCategory) return selectedCategory;
    return 'Каталог';
  };

  return (
    <div className="catalog">
      <h1 className="renderHeader">
        {renderHeader()} <span className="product-count">{products.length}</span>
      </h1>

      <Breadcrumbs
        selectedCategory={selectedCategory}
        selectedGender={selectedGender}
        selectedType={selectedType}
        onClickLevel={(level) => {
          if (level === 'catalog') {
            handleReset();
          } else if (level === 'category') {
            navigate(`/catalog?category=${selectedCategory}`);
            setSelectedBrands([]);
            setSelectedFeatures([]);
            setSelectedSizes([]);
            setSelectedPrice({ min: '', max: '' });
            setActiveFilter(null);
          } else if (level === 'gender') {
            navigate(`/catalog?category=${selectedCategory}&gender=${selectedGender}`);
            setSelectedBrands([]);
            setSelectedFeatures([]);
            setSelectedSizes([]);
            setSelectedPrice({ min: '', max: '' });
            setActiveFilter(null);
          } else if (level === 'type') {
            navigate(`/catalog?category=${selectedCategory}&gender=${selectedGender}&type=${selectedType}`);
            setSelectedBrands([]);
            setSelectedFeatures([]);
            setSelectedSizes([]);
            setSelectedPrice({ min: '', max: '' });
            setActiveFilter(null);
          }
        }}
      />

      {/* Пошаговая фильтрация */}
      {!selectedCategory && (
        <div className="step step-categories">
          <h3>Выберите категорию:</h3>
          {categories.map(cat => (
            <button
              className="step-button"
              key={cat.id}
              onClick={() => handleCategorySelect(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {selectedCategory && !selectedGender && (
        <div className="step step-genders">
          <h3>Выберите пол:</h3>
          {genders.map(g => (
            <button
              className="step-button"
              key={g.id}
              onClick={() => handleGenderSelect(g.name)}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {selectedGender && !selectedType && (
        <div className="step step-types">
          <h3>Выберите тип товара:</h3>
          {types.map(t => (
            <button
              className="step-button"
              key={t.id}
              onClick={() => handleTypeSelect(t.name)}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Кнопки фильтров */}
   <div style={{ display: "flex", maxWidth: "500px" }} className="filters-buttons">
  <p>Фильтрация</p>
  <button
    className={`filter-btn ${activeFilter === 'price' ? 'active' : ''}`}
    onClick={() => setActiveFilter(activeFilter === 'price' ? null : 'price')}
  >
    Цена
  </button>
  <button
    className={`filter-btn ${activeFilter === 'brand' ? 'active' : ''}`}
    onClick={() => setActiveFilter(activeFilter === 'brand' ? null : 'brand')}
  >
    Бренд
  </button>
  <button
    className={`filter-btn ${activeFilter === 'size' ? 'active' : ''}`}
    onClick={() => setActiveFilter(activeFilter === 'size' ? null : 'size')}
  >
    Размер
  </button>
</div>

      {/* Фильтры через компонент */}
      <FilterWrapper
        activeFilter={activeFilter}
        brands={brands}
        sizes={sizes}
        features={features}
        selectedBrands={selectedBrands}
        selectedSizes={selectedSizes}
        selectedFeatures={selectedFeatures}
        selectedPrice={selectedPrice}
        handleBrandToggle={(brandName) => toggleSelection(brandName, selectedBrands, setSelectedBrands)}
        onToggleSize={(size) => toggleSelection(size, selectedSizes, setSelectedSizes)}
        onToggleFeature={(feature) => toggleSelection(feature, selectedFeatures, setSelectedFeatures)}
        onPriceChange={handlePriceChange}
      />

      {/* Кнопка сброса фильтров */}
      {(selectedCategory || selectedGender || selectedType || selectedBrands.length > 0 || selectedFeatures.length > 0 || selectedSizes.length > 0 || selectedPrice.min || selectedPrice.max) && (
        <div className="step step-reset">
          <button className="reset" onClick={handleReset}>Сбросить фильтры</button>
        </div>
      )}

      {/* Товары */}
      <div className="products">
        <h2>Товары</h2>
        {products.length > 0 ? (
          <div className="product-list">
            {products.map(prod => (
              <div className="product" key={prod.id}>
                <img src={prod.image_url} alt={prod.title} />
                <h4>{prod.title}</h4>
                <p className="brand">Бренд: {prod.brand_name || 'Неизвестно'}</p>
                <p>{prod.description}</p>
                <p>Размеры: {prod.sizes && prod.sizes.length > 0 ? prod.sizes.join(', ') : 'Нет данных'}</p>
                <span className="price">{prod.price} ₽</span>
                <div className="product-actions">
                  <button
                    className="view-details"
                    onClick={() => handleOpenProductModal(prod.id)}
                  >
                    Подробнее
                  </button>
                  <div className="favorite-btn" onClick={() => toggleFavorite(prod)}>
  {isFavorite(prod.id) ? (
    <FaHeart color="red" size={24} />
  ) : (
    <FaRegHeart color="white" size={24} />
  )}
</div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Товары не найдены</p>
        )}
      </div>
      {modalProductId && (
  <ProductModal
    productId={modalProductId}
    onClose={handleCloseModal}
    category={selectedCategory}
    gender={selectedGender}
    type={selectedType}
  />
)}

    </div>
  );
}

export default Catalog;
