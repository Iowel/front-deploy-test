// Импортируем необходимые библиотеки и компоненты
import React from 'react';
// React-slick - это библиотека для создания слайдеров
import Slider from 'react-slick';
// Импортируем стили для слайдера
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Импортируем изображения
import gromImage from '../assets/grom.webp';
import na4jdImage from '../assets/na4jd.webp';

// Создаем функциональный компонент слайдера
const ImageSlider = () => {
  // Настройки для слайдера
  const settings = {
    dots: true,        // Точки навигации внизу слайдера (отключены)
    infinite: true,     // Бесконечная прокрутка слайдов
    speed: 500,         // Скорость анимации переключения (в миллисекундах)
    slidesToShow: 1,    // Количество показываемых слайдов одновременно
    slidesToScroll: 1,  // Количество слайдов, прокручиваемых за раз
    autoplay: true,     // Автоматическое переключение слайдов
    autoplaySpeed: 5000,// Интервал автопереключения (5 секунд)
    arrows: true,       // Показывать стрелки навигации
    vertical: false,    // Отключаем вертикальный режим
    adaptiveHeight: true,
    draggable: true,
    swipe: true
  };

  // Массив с контентом для слайдов
  const slides = [
    { id: 1, image: gromImage, alt: 'Изображение Грома' },
    { id: 2, image: na4jdImage, alt: 'Изображение На4жд' }
  ];

  // Возвращаем JSX разметку компонента
  return (
    <div className="absolute inset-0">
      <Slider {...settings}>
        {slides.map((slide) => (
          <div key={slide.id} className="relative h-[480px] flex items-center justify-center">
            {/* Используем тег img для отображения изображения */}
            <img src={slide.image} alt={slide.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {/* Добавляем текстовый элемент поверх изображения */}
            
          </div>
        ))}
      </Slider>
    </div>
  );
};

// Экспортируем компонент, чтобы его можно было импортировать в других файлах
export default ImageSlider; 