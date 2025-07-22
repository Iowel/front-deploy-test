import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const images = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80'
];

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  autoplay: true,
  autoplaySpeed: 5000,
  customPaging: (i) => (
    <div className="w-2 h-2 bg-gray-400 rounded-full mt-4" />
  ),
  appendDots: (dots) => (
    <div className="flex justify-center mt-4">
      <ul className="flex space-x-2">{dots}</ul>
    </div>
  ),
};

const AboutUs = () => (
  <div className="w-full min-h-[calc(100vh-60px)] bg-white flex flex-col items-center py-12 px-4 pt-[80px]">
    <div className="max-w-3xl w-full text-center mb-12">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">О кинотеатре</h1>
      <p className="text-lg text-gray-700 leading-8 mb-4">
        Наш кинотеатр — это современное пространство для настоящих ценителей кино и комфортного отдыха. У нас вы найдёте уютные залы с новейшей системой звука и изображения, авторское меню бара, тематические вечера, детские программы и возможность арендовать зал для частных мероприятий. Мы любим кино и делаем всё, чтобы вы тоже его полюбили!
      </p>
      <p className="text-lg text-gray-700 leading-8">
        Следите за нашими акциями, участвуйте в розыгрышах, приводите друзей и открывайте для себя новые фильмы в лучшей атмосфере города. Добро пожаловать!
      </p>
    </div>
    <div className="w-full max-w-4xl relative">
      <Slider {...sliderSettings}>
        {images.map((img, idx) => (
          <div key={idx} className="px-4">
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <img 
                src={img} 
                alt={`about-slide-${idx}`} 
                className="w-full h-[500px] object-cover transform hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  </div>
);

export default AboutUs; 