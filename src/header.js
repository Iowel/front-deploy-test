import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from './assets/logo.png';
import logoTrens from './assets/logo_trenspng.png';
import ImageSlider from "./components/ImageSlider";
import Calendar from "./components/Calendar";

// Получаем дату в формате YYYY-MM-DD из локальной даты
const getDateFromLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Получаем начало текущего дня в локальном времени
const getTodayLocal = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Получаем начало завтрашнего дня в локальном времени
const getTomorrowLocal = () => {
  const today = getTodayLocal();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
};

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const todayFormatted = getDateFromLocal(getTodayLocal());
  const tomorrowFormatted = getDateFromLocal(getTomorrowLocal());
  const isAboutPage = location.pathname === '/about';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Сброс selectedDate при переходе на дату
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'date' && pathParts[2]) {
      const dateParts = pathParts[2].split('-');
      if (dateParts.length === 3) {
        setSelectedDate(new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2])));
      }
    }
  }, [location.pathname]);

  const formatDate = (date) => {
    if (!date) return '';
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - userTimezoneOffset);
    const formattedDate = localDate.toISOString().split('T')[0];
    navigate(`/date/${formattedDate}`);
  };

  const handleNavLinkClick = (to) => {
    if (to === "/today") {
      const now = new Date();
      const utcDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      setSelectedDate(utcDate);
    } else if (to === "/tomorrow") {
      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1));
      setSelectedDate(tomorrow);
    } else {
      setSelectedDate(null);
    }
  };

  const isEmailValid = email.includes('@') && email.includes('.');

  const handleEmailSubmit = () => {
    setIsEmailSent(true);
    // Показываем лоадер 1.5 секунды
    setTimeout(() => {
      setShowCheckmark(true);
      // Закрываем модальное окно через 2 секунды после показа галочки
      setTimeout(() => {
        setIsModalOpen(false);
        setIsEmailSent(false);
        setShowCheckmark(false);
        setEmail('');
      }, 2000);
    }, 1500);
  };

  const navLinks = [
    { 
      to: `/date/${todayFormatted}`, 
      text: "Сегодня",
      onClick: () => {
        setSelectedDate(getTodayLocal());
      }
    },
    { 
      to: `/date/${tomorrowFormatted}`, 
      text: "Завтра",
      onClick: () => {
        setSelectedDate(getTomorrowLocal());
      }
    },
    { to: "/coming-soon", text: "Скоро" },
    { to: "/about", text: "О нас" },
  ];

  const commonLinkStyles = `font-montserrat px-4 py-3 rounded-md transition-all duration-200 ${ 
    isAboutPage || scrolled 
      ? "text-black/70 hover:bg-gray-100 hover:text-black" 
      : "text-white/90 hover:bg-white/10 hover:text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]"
  }`;

  const mobileLinkStyles = "font-montserrat px-4 py-3 rounded-md transition-all duration-200 text-black/70 hover:bg-gray-100 hover:text-black";

  const isTodayNavActive = selectedDate === null && location.pathname === "/today";

  return (
    <div className="relative">
      <header className={`fixed top-0 left-0 w-full h-[60px] transition-all duration-300 z-50 ${
        isAboutPage || scrolled 
          ? "bg-white border-b-[1px] border-black" 
          : "bg-transparent border-b border-white/30"
      }`}>
        <div className="container mx-auto h-full px-4">
          <div className="flex items-center justify-between h-full">
            {/* Logo: вставь сюда <img src={logo} alt="Логотип" className="h-8" /> после импорта PNG */}
            <div
              className="flex-shrink-0"
              style={{ width: 200, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isAboutPage || scrolled ? (
                <img src={logo} alt="Логотип" style={{ width: 200, height: 150, objectFit: 'contain' }} />
              ) : (
                <img src={logoTrens} alt="Логотип прозрачный" style={{ width: 200, height: 150, objectFit: 'contain' }} />
              )}
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`${commonLinkStyles} mx-2`}
                  onClick={() => {
                    if (link.onClick) link.onClick();
                    handleNavLinkClick(link.to);
                  }}
                >
                  {link.text}
                </Link>
              ))}
              <Calendar 
                selectedDate={selectedDate} 
                onDateChange={handleDateSelect} 
                className="ml-[30px]" 
                scrolled={isAboutPage || scrolled} 
                isTodayNavActive={isTodayNavActive} 
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className={`${commonLinkStyles} mx-2`}
              >
                Личный кабинет
              </button>
            </nav>
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute right-4 top-[70px] w-[280px] bg-white rounded-xl shadow-lg overflow-hidden">
              <nav className="flex flex-col py-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`${mobileLinkStyles} my-1`}
                    onClick={() => {
                      if (link.onClick) link.onClick();
                      handleNavLinkClick(link.to);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {link.text}
                  </Link>
                ))}
                <div>
                  <Calendar 
                    selectedDate={selectedDate} 
                    onDateChange={handleDateSelect} 
                    isTodayNavActive={isTodayNavActive}
                    scrolled={isAboutPage || scrolled}
                  />
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`${mobileLinkStyles} my-1`}
                >
                  Личный кабинет
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Email Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[530px] h-[360px] relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEmail('');
                setIsEmailSent(false);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {!isEmailSent ? (
              <>
                <h2 className="text-2xl font-semibold mb-8">Введите почту</h2>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Электронная почта"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleEmailSubmit}
                  disabled={!isEmailValid}
                  className={`absolute bottom-8 right-8 px-6 py-2 rounded-lg transition-all duration-200 ${
                    isEmailValid 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Далее
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  {!showCheckmark ? (
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-lg text-gray-700">Письмо с подтверждением отправлено на почту</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!isAboutPage && (
        <div className="w-full h-[480px] bg-transparent -mt-[60px]">
          <ImageSlider />
        </div>
      )}
    </div>
  );
};

export default Header; 