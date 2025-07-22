import React, { useState, useEffect, useRef } from 'react';
import spbIcon from '../assets/sbp.svg';
import bankCardIcon from '../assets/bank_card.svg';
import Loader from './Loader';

export default function PaymentStepButton({ isActive, isDone, onClick, disabled }) {
  let colorClass = 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100';
  if (isDone) colorClass = 'bg-emerald-500 text-white border-emerald-500 shadow';
  else if (isActive) colorClass = 'bg-blue-600 text-white border-blue-600 shadow';
  return (
    <button
      className={
        'px-5 py-1 rounded-full border text-[15px] font-medium transition-all ' + colorClass
      }
      style={{ minWidth: 80, outline: 'none' }}
      onClick={onClick}
      disabled={disabled}
    >
      Оплата
    </button>
  );
}

export function PaymentStep({ selectedPayment, setSelectedPayment, onClose, selectedSeats, selectedSession, movie }) {
  const [showCancelPaymentDialog, setShowCancelPaymentDialog] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardDate, setCardDate] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const cardDateRef = useRef(null);
  const cardCVVRef = useRef(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const emailRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (cardNumber.length === 16) {
      setTimeout(() => cardDateRef.current?.focus(), 0);
    }
  }, [cardNumber]);

  useEffect(() => {
    if (cardDate.length === 4) {
      setTimeout(() => cardCVVRef.current?.focus(), 0);
    }
  }, [cardDate]);

  useEffect(() => {
    if (email.includes('@')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [email]);

  useEffect(() => {
    if (phone.length === 10 && emailRef.current) {
      emailRef.current.focus();
    }
  }, [phone]);

  useEffect(() => {
    function handleMessage(e) {
      if (e.data === 'success') {
        setIsLoading(false);
        setIsSuccess(true);
        const cacheKey = `seats_${movie.movieId}_${selectedSession.date}_${selectedSession.time}`;
        let currentSeats = JSON.parse(localStorage.getItem(cacheKey)) || Array.from({ length: 9 * 14 }, (_, i) => ({
          row: Math.floor(i / 14) + 1,
          seat: (i % 14) + 1,
          taken: false
        }));
        
        currentSeats = currentSeats.map(seat => ({
          ...seat,
          taken: seat.taken || selectedSeats.some(s => s.row === seat.row && s.seat === seat.seat)
        }));
        
        localStorage.setItem(cacheKey, JSON.stringify(currentSeats));
      } else if (e.data === 'error') {
        setIsLoading(false);
        setIsError(true);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedSeats, selectedSession, movie]);

  useEffect(() => {
    if (isSuccess || isError) {
      const timer = setTimeout(() => onClose(), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, isError, onClose]);

  if (isSuccess) {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.1)' }}>
        <div style={{ width: 370, minHeight: 480, background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px rgba(0,0,0,0.10)', padding: '28px 28px 18px 28px', display: 'flex', flexDirection: 'column', gap: 18, pointerEvents: 'auto', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="#e6fbe6" stroke="#22c55e" strokeWidth="6" />
              <polyline
                points="40,65 56,80 82,48"
                fill="none"
                stroke="#22c55e"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 100,
                  strokeDashoffset: 100,
                  animation: 'draw-check 1s forwards',
                }}
              />
            </svg>
            <style>{`@keyframes draw-check { to { stroke-dashoffset: 0; } }`}</style>
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#222', marginTop: 24, textAlign: 'center' }}>Оплата прошла успешно.<br />Билет отправлен на ваш email</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.1)' }}>
        <div style={{ width: 370, minHeight: 480, background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px rgba(0,0,0,0.10)', padding: '28px 28px 18px 28px', display: 'flex', flexDirection: 'column', gap: 18, pointerEvents: 'auto', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="#fee2e2" stroke="#ef4444" strokeWidth="6" />
              <line x1="40" y1="40" x2="80" y2="80" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: 'draw-cross 1s forwards' }} />
              <line x1="80" y1="40" x2="40" y2="80" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: 'draw-cross 1s forwards' }} />
            </svg>
            <style>{`@keyframes draw-cross { to { stroke-dashoffset: 0; } }`}</style>
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#222', marginTop: 24, textAlign: 'center' }}>Произошла ошибка.<br />Обратитесь в тех.поддержку.</div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: 370,
          minHeight: 480,
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
          padding: '28px 28px 18px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          pointerEvents: 'auto'
        }}
      >
        {/* Быстрая оплата / Вход */}
        <div className="flex flex-col gap-1 mb-2">
          <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-gray-100 font-medium text-[17px] cursor-pointer">
            Быстрая оплата <span className="text-blue-500 text-xl">✓</span>
          </div>
        </div>
        <div className="text-gray-500 text-[13px] font-semibold mb-1" style={{letterSpacing: 1}}>ВЫБЕРИТЕ СПОСОБ ОПЛАТЫ</div>
        {/* Способы оплаты */}
        <div className="flex flex-col gap-2 mb-2">
          <div
            className={`flex items-center px-3 py-2 rounded-lg cursor-pointer border-2 ${selectedPayment === 'sbp' ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-gray-100'}`}
            onClick={() => setSelectedPayment('sbp')}
            tabIndex={0}
            role="button"
            aria-pressed={selectedPayment === 'sbp'}
          >
            <img src={spbIcon} alt="СПБ" style={{width: 32, height: 32, borderRadius: 8, marginRight: 12, objectFit: 'contain'}} />
            <span className="font-medium text-[16px] flex-1">Система быстрых платежей</span>
            {selectedPayment === 'sbp' && <span className="text-blue-500 text-xl">✓</span>}
          </div>
          <div
            className={`flex items-center px-3 py-2 rounded-lg cursor-pointer border-2 ${selectedPayment === 'card' ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-gray-100'}`}
            onClick={() => setSelectedPayment('card')}
            tabIndex={0}
            role="button"
            aria-pressed={selectedPayment === 'card'}
          >
            <img src={bankCardIcon} alt="Карта" style={{width: 32, height: 32, borderRadius: 8, marginRight: 12, objectFit: 'contain'}} />
            <span className="font-medium text-[16px] flex-1">Банковская карта</span>
            {selectedPayment === 'card' && <span className="text-blue-500 text-xl">✓</span>}
          </div>
          <div
            className={`flex items-center px-3 py-2 rounded-lg cursor-pointer border-2 ${selectedPayment === 'pushkin' ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-gray-100'}`}
            onClick={() => {}}
            tabIndex={-1}
            role="button"
            aria-pressed={false}
            style={{ cursor: 'not-allowed', opacity: 0.5 }}
          >
            <span style={{width: 32, height: 32, background: '#b6ff6b', borderRadius: 8, marginRight: 12, display: 'inline-block'}} />
            <span className="font-medium text-[16px] flex-1">Пушкинская карта</span>
            {/* чекбокс не показываем, так как disabled */}
          </div>
        </div>
        {selectedPayment === 'sbp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <span style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#222',
                fontSize: 16,
                pointerEvents: 'none',
                fontFamily: 'inherit',
                letterSpacing: '1px',
              }}>+7</span>
              <input
                type="tel"
                placeholder="Номер телефона"
                value={
                  phone
                    ? phone
                        .replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')
                        .trim()
                    : ''
                }
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(val);
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: 10,
                  border: '1px solid #e0e7ef',
                  fontSize: 16,
                  outline: 'none',
                  background: '#f8fafc',
                  fontFamily: 'inherit',
                  letterSpacing: '1px',
                }}
                maxLength={13}
              />
            </div>
          </div>
        )}
        {selectedPayment === 'card' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={19}
              placeholder="Номер карты"
              value={cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ').trim()}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                setCardNumber(val);
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #e0e7ef',
                fontSize: 16,
                outline: 'none',
                background: '#f8fafc',
                letterSpacing: '1px',
              }}
            />
            {cardNumber.length === 16 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                <input
                  ref={cardDateRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={5}
                  placeholder="MM/YY"
                  value={cardDate.length > 2 ? `${cardDate.slice(0, 2)}/${cardDate.slice(2)}` : cardDate}
                  onChange={e => {
                    const val = e.target.value.replace(/[^\d/]/g, '').slice(0, 5);
                    setCardDate(val);
                  }}
                  style={{
                    width: 90,
                    padding: '10px 6px',
                    borderRadius: 10,
                    border: '1px solid #e0e7ef',
                    fontSize: 16,
                    outline: 'none',
                    background: '#f8fafc',
                    textAlign: 'center',
                  }}
                />
                <input
                  ref={cardCVVRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={3}
                  placeholder="CVV"
                  value={cardCVV}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                    setCardCVV(val);
                  }}
                  style={{
                    width: 90,
                    padding: '10px 6px',
                    borderRadius: 10,
                    border: '1px solid #e0e7ef',
                    fontSize: 16,
                    outline: 'none',
                    background: '#f8fafc',
                    textAlign: 'center',
                  }}
                />
              </div>
            )}
          </div>
        )}
        {(selectedPayment === 'sbp' || selectedPayment === 'card') && (
          <div style={{ marginTop: 12 }}>
            <input
              ref={emailRef}
              type="email"
              placeholder="Электронная почта"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: email && /[а-яА-Я]/.test(email) ? '1px solid red' : '1px solid #e0e7ef',
                fontSize: 16,
                outline: 'none',
                background: '#f8fafc',
              }}
            />
            {email && /[а-яА-Я]/.test(email) && (
              <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>неверный email</div>
            )}
            {email.includes('@') && !/[а-яА-Я]/.test(email) && (
              (selectedPayment === 'sbp' && phone.length === 10) ||
              (selectedPayment === 'card' && cardNumber.length === 16 && cardDate.length === 5 && cardCVV.length === 3)
            ) && (
              <div style={{ marginTop: 20 }}>
                <button
                  className="w-full bg-blue-500 text-white text-[18px] font-medium px-8 py-3 rounded-lg hover:bg-blue-600 transition"
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => {
                      setIsLoading(false);
                      setIsSuccess(true);
                      const cacheKey = `seats_${movie.movieId}_${selectedSession.date}_${selectedSession.time}`;
                      let currentSeats = JSON.parse(localStorage.getItem(cacheKey)) || Array.from({ length: 9 * 14 }, (_, i) => ({
                        row: Math.floor(i / 14) + 1,
                        seat: (i % 14) + 1,
                        taken: false
                      }));
                      
                      currentSeats = currentSeats.map(seat => ({
                        ...seat,
                        taken: seat.taken || selectedSeats.some(s => s.row === seat.row && s.seat === seat.seat)
                      }));
                      
                      localStorage.setItem(cacheKey, JSON.stringify(currentSeats));
                    }, 1500);
                  }}
                >
                  Оплатить
                </button>
              </div>
            )}
          </div>
        )}
        <div className="text-gray-500 text-[13px] mt-1">
          Введите почту, на которую мы пришлём билет.<br />
          В следующий раз почту вводить не нужно.
        </div>
      </div>
      {isLoading && (
        <div style={{position:'absolute',inset:0,zIndex:1000,background:'rgba(255,255,255,0.7)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Loader overlay={false} />
        </div>
      )}
    </div>
  );
} 