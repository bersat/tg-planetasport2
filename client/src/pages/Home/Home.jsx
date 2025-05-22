import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './HomePage.css';

const banners = [
  { title: 'Новая коллекция', image: '/img/atom.png', link: '/catalog?category=Одежда&gender=Женский' },
  { title: 'Летняя обувь', image: '/img/hike.png', link: '/catalog?category=Обувь&gender=Мужской' },
  { title: 'Аксессуары', image: '/img/sale.png', link: '/catalog?category=Аксессуары&gender=Унисекс' },
  { title: 'Аксессуары', image: '/img/sale2.png', link: '/catalog?category=Аксессуары&gender=Унисекс' },
];


const categories = [
  { name: 'Мужская одежда', category: 'Одежда', gender: 'Мужская' },
  { name: 'Мужская обувь', category: 'Обувь', gender: 'Мужская' },
  { name: 'Женская одежда', category: 'Одежда', gender: 'Женская' },
  { name: 'Женская обувь', category: 'Обувь', gender: 'Женская' },
  { name: 'Аксессуары унисекс', category: 'Аксессуары', gender: 'Унисекс' },
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Карусель */}
      <Swiper
        modules={[Pagination, Autoplay]}
        autoplay={{ delay: 3000 }}
        pagination={{ clickable: true }}
        loop={true}
        className="carousel"
      >
        <SwiperSlide><img src="/img/atom.png" alt="Slide 1" /></SwiperSlide>
        <SwiperSlide><img src="/img/sale.png" alt="Slide 2" /></SwiperSlide>
              <SwiperSlide><img src="/img/sale2.png" alt="Slide 3" /></SwiperSlide>
              <SwiperSlide><img src="/img/hike.png" alt="Slide 3" /></SwiperSlide>
      </Swiper>

      {/* Баннеры */}
      <div className="banners">
        {banners.map((b, idx) => (
          <div
            key={idx}
            className="banner"
            onClick={() => navigate(b.link)}
          >
            <img src={b.image} alt={b.title} />
            <div className="banner-title">{b.title}</div>
          </div>
        ))}
      </div>

      {/* Категории */}
      <div className="categories">
        <h2>Категории</h2>
        <div className="category-buttons">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => navigate(`/catalog?category=${cat.category}&gender=${cat.gender}`)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
