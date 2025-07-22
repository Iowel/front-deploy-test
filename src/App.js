import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './header';
import Footer from './components/footer';
import SupportButton from './components/support';
import TestCards from './components/TestCards';
import Modal from './components/Modal';
import Soon from './components/soon';
import Carousel from './components/carousel';
import AboutUs from './components/AboutUs';

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

function App() {
  const todayFormatted = getDateFromLocal(getTodayLocal());
  const tomorrowFormatted = getDateFromLocal(getTomorrowLocal());

  return (
    <div className="min-h-screen">
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to={`/date/${todayFormatted}`} replace />} />
        <Route path="/today" element={<Navigate to={`/date/${todayFormatted}`} replace />} />
        <Route path="/tomorrow" element={<Navigate to={`/date/${tomorrowFormatted}`} replace />} />
        <Route path="/date/:date" element={<TestCards />} />
        <Route path="/soon" element={<Soon />} />
        <Route path="/coming-soon" element={<Soon />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
      <div style={{ marginBottom: 30 }}>
        <Carousel />
      </div>
      <Footer />
      <SupportButton />
    </div>
  );
}

export default App;
