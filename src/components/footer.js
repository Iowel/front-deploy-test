import React from 'react';
import { FaVk, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const getDateFromLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const getTodayLocal = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};
const getTomorrowLocal = () => {
  const today = getTodayLocal();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
};

const todayFormatted = getDateFromLocal(getTodayLocal());
const tomorrowFormatted = getDateFromLocal(getTomorrowLocal());

const links = [
  { to: `/date/${todayFormatted}`, text: 'Сегодня' },
  { to: `/date/${tomorrowFormatted}`, text: 'Завтра' },
  { to: '/coming-soon', text: 'Скоро' },
  { to: '/about', text: 'О нас' },
];

const contacts = [
  'г. Волгоград, СНТ Волго-Ахтуба, ст.3',
  'будни 10:45-23:00',
  'выходные 10:10-00:00',
  'Реклама и сотрудничество: +7 905 064 09 42',
  'nevarezpadre23@gmail.com',
  'ООО "Меркурий" ',
  'ИНН 3435146498'
  ,
];

const Footer = () => (
  <footer className="bg-[#f6f8fa] border-t border-[#e0e7ef] py-16">
    <div className="container mx-auto flex flex-col md:flex-row gap-16 justify-start md:justify-center">
      <div className="md:w-1/3 w-full">
        <h2 className="font-montserrat text-2xl font-semibold mb-6 text-[#22223b]">Кинотеатр</h2>
        <ul className="flex flex-col gap-2">
          {links.map((link, i) => (
            <li key={i}>
              <Link
                to={link.to}
                className="font-montserrat text-[#6b7280] hover:text-[#3b82f6] transition-colors text-base no-underline px-1 py-1 rounded-md hover:bg-[#e0e7ef]"
                onClick={() => window.scrollTo(0, 0)}
              >
                {link.text}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="md:w-2/3 w-full flex flex-col items-start">
        <h2 className="font-montserrat text-2xl font-semibold mb-6 text-[#22223b]">Контакты кинотеатр "Меркурий"</h2>
        <div className="flex flex-col gap-2 mb-6">
          {contacts.map((c, i) =>
            c.includes('@') || c.includes('+7') ? (
              <span key={i} className="font-montserrat text-[#6b7280]">
                {c.split(':')[0]}:
                <a href={c.includes('@') ? `mailto:${c.split(': ')[1]}` : `tel:${c.split(': ')[1].replace(/\s/g,'')}`} className="text-[#3b82f6] underline hover:text-[#2563eb] ml-1">{c.split(': ')[1]}</a>
              </span>
            ) : (
              <span key={i} className="font-montserrat text-[#6b7280]">{c}</span>
            )
          )}
        </div>
        <div className="flex gap-8 mt-2">
          {/* <a href="#" className="text-[#6b7280] hover:text-[#3b82f6] text-2xl"><FaVk /></a> */}
          {/* <a href="#" className="text-[#6b7280] hover:text-[#3b82f6] text-2xl"><FaWhatsapp /></a> */}
          <a href="#" className="text-[#6b7280] hover:text-[#3b82f6] text-2xl"><FaTelegramPlane /></a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
