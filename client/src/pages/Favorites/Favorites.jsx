import React, { useEffect, useState } from 'react';
import { useFavorites } from '../../components/FavoritesContext';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import './Favorites.css';

function Favorites() {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();
  const navigate = useNavigate();

  const [sliderEnabled, setSliderEnabled] = useState(false);
  const containerRef = React.createRef();

  // Логирование структуры данных для проверки
  useEffect(() => {
    console.log(favorites);  // Посмотрим, что хранится в favorites
  }, [favorites]);

  // Рассчитываем общую сумму
  const totalPrice = favorites.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1; // Если quantity не число, используем 1
    return total + price * quantity;
  }, 0);

  // Рассчитываем количество товаров (суммируем все quantity)
  const totalQuantity = favorites.reduce((total, item) => {
    const quantity = Number(item.quantity) || 1; // Если quantity не число, используем 1
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

  // Функция для открытия товара в модальном окне на странице каталога
  const openProductInModal = (productId) => {
    navigate(`/catalog?productId=${productId}`);
  };

  // Проверяем размер контейнера и активируем карусель
  useEffect(() => {
    const checkSliderEnable = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setSliderEnabled(favorites.length * 250 > containerWidth); // 250px - ширина товара с отступами
      }
    };

    checkSliderEnable();
    window.addEventListener('resize', checkSliderEnable);

    return () => {
      window.removeEventListener('resize', checkSliderEnable);
    };
  }, [favorites.length]);

  return (
    <div className="favorites-container" ref={containerRef}>
      <h1 className="favorites-header">Избранные товары</h1>
      {favorites.length === 0 ? (
        <p className="favorites-message">Ваш список избранных товаров пуст.</p>
      ) : (
        <div>
          {/* Проверяем, нужно ли использовать карусель */}
          {sliderEnabled ? (
            <Slider {...settings}>
              {favorites.map((item) => (
                <div key={item.id} className="favorite-item">
                  <img src={item.image_url} alt={item.title} />
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                  <span>{item.price} ₽</span>
                  <div className="favorite-actions">
                    <button
                      className="details-btn"
                      onClick={() => openProductInModal(item.id)}
                    >
                      Подробнее
                    </button>
                    <div className="remove-icon" onClick={() => removeFromFavorites(item.id)}>
                      <FaTrash className="icon-remove" />
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <div className="favorites-row">
              {favorites.map((item) => (
                <div key={item.id} className="favorite-item">
                  <img src={item.image_url} alt={item.title} />
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                  <span>{item.price} ₽</span>
                  <div className="favorite-actions">
                    <button
                      className="details-btn"
                      onClick={() => openProductInModal(item.id)}
                    >
                      Подробнее
                    </button>
                    <div className="remove-icon" onClick={() => removeFromFavorites(item.id)}>
                      <FaTrash className="icon-remove" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="total">
            <span>Итого: {totalPrice} ₽</span>
            <span>Количество товаров: {totalQuantity}</span>
            <button className="clear-favorites-btn" onClick={clearFavorites}>
              Очистить избранное
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Favorites;
