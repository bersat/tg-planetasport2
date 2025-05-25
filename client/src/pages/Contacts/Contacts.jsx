import React from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../../components/Map'; // Импортируем компонент карты
import './Contacts.css';

function Contacts() {
  const navigate = useNavigate();

  // Функция для обработки клика на хлебные крошки
  const handleBreadcrumbClick = (level) => {
    if (level === 'home') {
      navigate('/'); // Главная страница
    } else if (level === 'contacts') {
      navigate('/contacts'); // Страница контактов
    }
    // Добавь дополнительные уровни, если нужно, например, для категорий
  };

  return (
    <div className="contacts-container">
      {/* Хлебные крошки */}
      <div className="contacts-breadcrumbs">
        <span onClick={() => handleBreadcrumbClick('home')}>Главная</span> —
        <span onClick={() => handleBreadcrumbClick('contacts')}>Контакты</span>
      </div>

      <h1 className="contacts-header">Контакты</h1>

      <div className="contacts-info">
        <div className="contact-block left">
          <h2 className="contact-title">Адрес</h2>
          <p className="contact-text">г. Санкт-Петербург, Большой Сампсониевский пр-т, д. 45</p>
        </div>

        <div className="contact-block right">
          <h2 className="contact-title">Режим работы</h2>
          <p className="contact-text">Пн-Сб: с 10:00 до 21:00</p>
          <p className="contact-text">Вс: с 11:00 до 21:00</p>
        </div>

        <div className="contact-block left">
          <h2 className="contact-title">Телефон</h2>
          <p className="contact-text">+7 (800) 775 48 25</p>
        </div>

        <div className="contact-block right">
          <h2 className="contact-title">E-mail</h2>
          <p className="contact-text">info@planeta-sport.ru</p>
        </div>
      </div>

      <div className="contacts-description">
        <p className="contact-description-text">
          Мы всегда рады вам в нашем флагманском магазине по адресу Санкт-Петербург, Большой Сампсониевский пр., д.45А и в других магазинах нашей сети в разных городах России.
        </p>
      </div>

      <div className="contacts-map">
        <h2 className="map-title">Наши координаты на карте</h2>
        <Map /> {/* Вставляем компонент карты */}
      </div>
    </div>
  );
}

export default Contacts;
