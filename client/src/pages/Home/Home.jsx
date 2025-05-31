import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './HomePage.css';

const banners = [
  { image: '/img/les.png', link: '/catalog?category=Одежда&gender=Женский' },
  { image: '/img/podarok.png', link: '/catalog?category=Обувь&gender=Мужской' },
  { image: '/img/kayland.png', link: '/catalog?category=Аксессуары&gender=Унисекс' },
];


const categories = [
  { name: 'Мужская одежда', category: 'Одежда', gender: 'Мужская', image:'/img/mens-jacket.png' },
  { name: 'Мужская обувь', category: 'Обувь', gender: 'Мужская', image:'/img/menfoot.png' },
  { name: 'Женская одежда', category: 'Одежда', gender: 'Женская', image:'/img/Jacket-For-Women.png' },
  { name: 'Женская обувь', category: 'Обувь', gender: 'Женская', image:'/img/womenfoot.png' },
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
              <SwiperSlide><img src="/img/sale3.png" alt="Slide 1" /></SwiperSlide>
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
    <div
      key={idx}
      className="category-card"
      onClick={() => navigate(`/catalog?category=${cat.category}&gender=${cat.gender}`)}
    >
      <img src={cat.image} alt={cat.name} className="category-image" />
      <span className="category-name">{cat.name}</span>
    </div>
  ))}
</div>

              <div style={{ borderTop: "1px solid #4d4b4b",borderBottom:"1px solid #4d4b4b", marginTop: '50px' }} >
                    <div style={{marginTop:"50px", marginBottom:"50px"}} className="banner">
                  <img src="/img/sale4.png" alt="sale4" />
              </div>
              </div>
          </div>
                {/* О компании */}
      <div style={{marginTop:"40px"}} className="about-section">
        <p>О компании</p>

                  <h2>Интернет-магазин</h2>
              <h2>Планета Спорт</h2>
        <p>
          «Планета Спорт» – это сеть мультибрендовых магазинов, в которых представлены товары для экстремального спорта,
          активного отдыха и путешествий. Мы специализируемся на outdoor-продукции. В ассортименте есть всё необходимое
          для альпинизма, горнолыжного спорта, сноубординга, скалолазания, треккинга, пешего туризма, кемпинга, бега
          и активной повседневной жизни. Люди с самыми разными outdoor-интересами: от профессиональных спортсменов
          до любителей семейного отдыха на природе – могут приобрести в наших магазинах подходящую одежду и экипировку.
        </p>
      </div>

    </div>
  );
}

export default Home;
