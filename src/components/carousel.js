import React, { useState, useEffect, useRef } from 'react';
import Loader from './Loader';
import Modal from './Modal';
import smileBoxImage from '../assets/smile_box.jpg';
import kinoRentImage from '../assets/kino_rent.jpg';
import bDayKinoImage from '../assets/b-day_kino.jpg';
import artLektImage from '../assets/art_lekt.jpg';
import salesImage from '../assets/sales.jpg';
import certImage from '../assets/cert.jpg';

const staticPosts = [
  {
    image: certImage,
    title: 'Подарочные сертификаты в кино',
    content: 'Идеальный подарок для киноманов! Подарочные сертификаты в кинотеатр "Меркурий" - это возможность выбрать любой фильм, сеанс и место. Доступны сертификаты различных номиналов. Приобретайте в кассах кинотеатра или на сайте. Подарите яркие эмоции и впечатления от похода в кино! Пожалуйста, отправьте свою заявку на электронный адрес nevarezpadre23@gmail.com или свяжитесь по телефону +7 (905) 064 09 42'
  },
  {
    image: kinoRentImage,
    title: 'Кинозал напрокат',
    content: 'Хотите устроить незабываемый праздник или провести мероприятие в уникальной атмосфере? Арендуйте наш кинозал! Идеально подходит для частных показов, корпоративов, дней рождений и презентаций. Оборудование высокого класса, комфортные кресла и возможность организации кейтеринга. Свяжитесь с нами для уточнения деталей и бронирования.'
  },
  {
    image: smileBoxImage,
    title: 'Смайл Бокс для ваших детей',
    content: 'Специальное предложение для семей с детьми! При покупке билета на детский фильм получите бесплатный "Смайл Бокс" с попкорном и напитком. В боксе также найдете игрушку-сюрприз из любимого мультфильма. Предложение действует по выходным дням.'
  },
  {
    image: bDayKinoImage,
    title: 'Отметьте день рождения в кинотеатре "Меркурий"',
    content: 'Отпразднуйте свой День Рождения в кинотеатре "Меркурий"! Специальные предложения для именинников и их гостей: аренда зала, выбор фильма, праздничное оформление и угощения. Сделайте свой праздник ярким и запоминающимся в кругу друзей и близких. Подробности и бронирование по телефону или на сайте.'
  },
  {
    image: salesImage,
    title: 'Специальная цена билетов - 190 рублей',
    content: 'В кинотеатре "Балтика" для пенсионеров, ветеранов ВОВ, ветеранов боевых действий и зрителей с ограниченными возможностями действует специальная цена на билеты в кино – 190 рублей.\n\nПожалуйста, не забудьте взять с собой соответствующий документ и предъявить его в кассе до оплаты билета. Этот документ должен принадлежать лицу, приобретающему билет:\n\nветеран боевых действий;\nпенсионное свидетельство;\nсправка пенсионера;\nпенсионное свидетельство сотрудников полиции и военнослужащих;\nпаспорт (при предъявлении паспорта предоставлять скидку женщинам - от 55 лет, мужчинам ‑ от 60 лет);\nсвидетельство ветерана труда;\nпенсионный проездной с фотографией.'
  },
  {
    image: artLektImage,
    title: 'Киноночь: theatreHD #АртЛекторий',
    content: 'Ежемесячный марафон классического кино! В эту субботу с 22:00 до 6:00 утра вас ждут лучшие фильмы всех времен. В программе: "Крестный отец", "Звездные войны", "Матрица". Билет на весь марафон включает неограниченный попкорн и напитки.'
  },
];

const CARD_WIDTH = 400;
const CARD_GAP = 24;
const VISIBLE_COUNT = 3;
const EXTENDED = [...staticPosts, ...staticPosts.slice(0, VISIBLE_COUNT), ...staticPosts.slice(0, VISIBLE_COUNT)];
const MAX_INDEX = staticPosts.length;

const Carousel = () => {
  const [current, setCurrent] = useState(0);
  const [transition, setTransition] = useState(true);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  // IntersectionObserver для отслеживания видимости карусели
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Автопрокрутка
  useEffect(() => {
    if (modalOpen || !isVisible) return; // Останавливаем автопрокрутку, если открыта модалка или карусель не видна
    let interval;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        interval = setInterval(() => {
          setCurrent((c) => c + 1);
        }, 2000);
      }
    };
    interval = setInterval(() => {
      setCurrent((c) => c + 1);
    }, 2000);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [modalOpen, isVisible]);

  const translateX = -(current * (CARD_WIDTH + CARD_GAP));

  if (loading) return (
    <div style={{ position: 'relative', minHeight: 260 }}>
      <Loader overlay />
    </div>
  );

  return (
    <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', marginTop: 32 }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Акции и новости</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, overflow: 'hidden', position: 'relative' }}>
        <div
          ref={containerRef}
          style={{
            display: 'flex',
            gap: CARD_GAP,
            transition: transition ? 'transform 0.6s cubic-bezier(.4,1,.4,1)' : 'none',
            transform: `translateX(${translateX}px)`,
            width: (CARD_WIDTH + CARD_GAP) * EXTENDED.length,
          }}
          onTransitionEnd={() => {
            if (current === MAX_INDEX) {
              setTransition(false);
              setCurrent(0);
              setTimeout(() => setTransition(true), 20);
            }
          }}
        >
          {EXTENDED.map((post, idx) => (
            <div key={idx}
              style={{
                width: CARD_WIDTH,
                minHeight: 220,
                borderRadius: 18,
                overflow: 'hidden',
                background: 'transparent !important',
                boxShadow: 'none !important',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s, box-shadow 0.2s, border 0.2s, box-shadow 0.2s',
                border: '2px solid transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.border = '2px solid #3b82f6'}
              onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'}
              onClick={() => {
                setModalData({
                  nameRu: post.title,
                  posterUrl: post.image,
                  genres: [],
                  movieId: post.id || 0,
                  times: [],
                  description: post.content
                });
                setModalOpen(true);
              }}
            >
              <img src={post.image} alt={post.title} style={{ width: CARD_WIDTH, height: 180, objectFit: 'cover', borderTopLeftRadius: 18, borderTopRightRadius: 18 }} />
              <div style={{ padding: '12px 16px', fontSize: 18, color: '#222', fontWeight: 500, textAlign: 'left', width: '100%' }}>
                {post.title}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: current === idx ? '#3b82f6' : '#ccc',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} movie={modalData} showStepper={false} modalStyle={{ width: 1280, height: 855 }} contentStyle={{ padding: 40 }} />
    </div>
  );
};

export default Carousel; 