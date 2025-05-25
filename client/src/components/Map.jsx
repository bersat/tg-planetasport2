import React, { useEffect } from 'react';

const Map = () => {
  useEffect(() => {
    const initMap = () => {
      const ymaps = window.ymaps;
      const map = new ymaps.Map('map', {
        center: [59.9389, 30.3146], // Координаты Санкт-Петербурга
        zoom: 15,
      });

      // Добавление маркера на карту
      const placemark = new ymaps.Placemark([59.9389, 30.3146], {
        hintContent: 'Наш магазин',
        balloonContent: 'г. Санкт-Петербург, Большой Сампсониевский пр-т, д. 45',
      });

      map.geoObjects.add(placemark);
    };

    // Проверка на наличие Yandex Maps в window
    if (window.ymaps) {
      initMap(); // Если ymaps уже загружен, инициализируем карту
    } else {
      // Если ymaps еще не загружен, загружаем его
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=YOUR_YANDEX_API_KEY`; // Ваш API ключ
      script.async = true;
      script.onload = initMap; // Инициализация карты после загрузки скрипта
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="map-container">
      <div id="map" style={{ width: '100%', height: '400px', borderRadius: '8px' }}></div>
    </div>
  );
};

export default Map;
