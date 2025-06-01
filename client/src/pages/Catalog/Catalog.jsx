import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import FilterWrapper from '../../components/FilterWrapper/FilterWrapper'; // поправь путь, если нужно
import './catalog.css';
import ProductModal from '../ProductModal/ProductModal';
import { useFavorites } from '../../components/FavoritesContext'; // Импортируем хук для работы с избранными
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Для иконок сердечка

const API_URL = process.env.REACT_APP_API_URL;

const colorTranslation = {
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

function Catalog() {
  const [categories, setCategories] = useState([]);
  const [genders, setGenders] = useState([]);
  const [types, setTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [modalProductId, setModalProductId] = useState(null);
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);

  // Фильтры
  const [brands, setBrands] = useState([]);
  const [features, setFeatures] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [isAnimating, setIsAnimating] = useState({});


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
    axios.get(`${API_URL}/api/categories`).then(res => setCategories(res.data)).catch(console.error);
    axios.get(`${API_URL}/api/brands`).then(res => setBrands(res.data)).catch(console.error);
    axios.get(`${API_URL}/api/features`).then(res => setFeatures(res.data)).catch(console.error);
    axios.get(`${API_URL}/api/sizes`).then(res => setSizes(res.data)).catch(console.error);
  }, []);

  // Загрузка полов при выборе категории (selectedCategory берется из URL)
  useEffect(() => {
    if (selectedCategory) {
      axios.get(`${API_URL}/api/genders`).then(res => setGenders(res.data)).catch(console.error);
    } else {
      setGenders([]);
    }
  }, [selectedCategory]);

  useEffect(() => {
  const openBrand = queryParams.get('openBrandFilter');
  if (openBrand === 'true') {
    setActiveFilter('brand');
    // Также сбрасываем параметр, чтобы он не мешал при следующих заходах (необязательно)
    queryParams.delete('openBrandFilter');
    navigate('/catalog', { replace: true }); // удаляем параметр из URL
  }
}, []); // выполняется один раз при монтировании

  // Загрузка типов при выборе категории и пола (selectedCategory, selectedGender из URL)
  useEffect(() => {
    if (selectedCategory && selectedGender) {
      axios.get(`${API_URL}/api/types`, { params: { category: selectedCategory } })
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

        const res = await axios.get(`${API_URL}/api/products`, { params });
        const fetchedProducts = res.data;
        // Загружаем изображения для каждого товара
       const productsWithImages = fetchedProducts.map(product => ({
        ...product,
        image_url: product.image_url || 'default-image-.jpg'  // Если картинки нет, ставим дефолт
      }));

        setProducts(productsWithImages);
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

  const isFavorite = (productId) => favorites.some(fav => fav.id === productId);

  const toggleFavorite = async (product) => {
  // Проверяем, авторизован ли пользователь через localStorage
    const isAuthenticated = Boolean(localStorage.getItem('auth_token'));

    if (!isAuthenticated) {
    alert('Пожалуйста, войдите в аккаунт, чтобы добавлять товары в избранное.');
    return;
  }

    setIsLoading(true);

         setIsAnimating((prev) => ({
    ...prev,
    [product.id]: true,
  }));

      setTimeout(() => {
        setIsLoading(false);  // Отключаем анимацию
           setIsAnimating((prev) => ({
    ...prev,
    [product.id]: false, // Сбрасываем анимацию для текущего товара
  }));
    }, 1500);

  try {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id); // Убираем товар из локальных избранных

      if (isAuthenticated) {
        const token = localStorage.getItem('auth_token');
        await axios.delete(`${API_URL}/api/favorites`, { productId: product.id }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } else {
      addToFavorites(product); // Добавляем товар в локальные избранные

      if (isAuthenticated) {
        const token = localStorage.getItem('auth_token');
       await axios.post(`${API_URL}/api/favorites`, {
  product_id: product.id,
  title: product.title,
  description: product.description,
  price: product.price,
  image_url: product.image_url
}, {
  headers: { Authorization: `Bearer ${token}` },
});

      }
    }


  } catch (err) {
    console.error('Ошибка при обновлении избранного:', err);
  }
};

  // Заголовок
  const renderHeader = () => {
    if (selectedType) return selectedType;
    if (selectedGender) return selectedGender;
    if (selectedCategory) return selectedCategory;
    return 'Каталог';
  };

   const getColorInRussian = (color) => {
    return colorTranslation[color] || color;  // Если цвет не найден, возвращаем как есть
  };

const getColorStyle = (color) => {
  // Проверяем, что color не равен null или undefined
  if (!color) {
    return 'gray';  // Если цвет не задан, ставим серый
  }

  // Если это светло-сиреневый цвет
  if (color === 'light-lavender') {
    return '#E6D1F2';  // Например, светло-сиреневый можно записать как HEX #E6D1F2
  }

   // Если это тёмно-синий цвет
  if (color === 'dark-blue') {
    return '#003366';  // Тёмно-синий цвет (HEX)
  }

   // Если это тёмно-коричневый цвет
  if (color === 'dark-brown') {
    return '#3E1F1C';  // Тёмно-коричневый цвет (HEX)
  }

   // Если это бежевый цвет
  if (color === 'beige') {
    return '#F5F5DC';  // Бежевый цвет (HEX)
  }

    // Если это болотный цвет
  if (color === 'swamp') {
    return '#556B2F';  // Болотный цвет (HEX)
  }

  // Если в цвете несколько значений (например, 'red, green, blue')
  if (color.includes(',')) {
    return `linear-gradient(to right, ${color})`;
  }

  // Если это одиночный цвет, возвращаем его как есть
  return color;
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
          <div className="product-image-wrapper">
            <img src={prod.image_url} alt={prod.title} onClick={() => handleOpenProductModal(prod.id)} />
          </div>
          <h4>{prod.title}</h4>
          <p className="brand">Бренд: {prod.brand_name || 'Неизвестно'}</p>
          {prod.sizes && prod.sizes.length > 0 && (
  <p className='size'>Размеры: {prod.sizes.join(', ')}</p>
)}


            <p className='price'>Цена: <span> {prod.price} ₽</span></p>


          {/* Отображение цвета товара */}
         <div className="product-color">
  <p>Цвет: {getColorInRussian(prod.color)}</p>
  <div
    className="color-square"
     style={{
    background: getColorStyle(prod.color),
  }}
  ></div>
</div>


          {/* Отображение количества товара с анимацией */}
          <p className="quantity">
             <span className="quantity-circle"></span>
            <span className="quantity-number">{prod.quantity}  в наличии</span>
          </p>

          <div className="product-actions">
            <button className="view-details" onClick={() => handleOpenProductModal(prod.id)}>
              Подробнее
            </button>
           <div
  className={`favorite-btn ${isAnimating[prod.id] ? 'animate' : ''}`}
  onClick={() => toggleFavorite(prod)}
>
              {isAnimating[prod.id] ? (
                <div className="loading">
                  <svg width="16px" height="12px">
                    <polyline id="back" points="1 6 4 6 6 11 10 1 12 6 15 6"></polyline>
                    <polyline id="front" points="1 6 4 6 6 11 10 1 12 6 15 6"></polyline>
                  </svg>
                </div>
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
