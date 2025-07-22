import React, { useState, useEffect } from 'react';

const SupportButton = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [isChat, setIsChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [position, setPosition] = useState({ x: window.innerWidth - 380, y: window.innerHeight - 480 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [operatorMessage, setOperatorMessage] = useState(false);
  const [operatorReplied, setOperatorReplied] = useState(false);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    setIsDragging(true);
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseEnter = () => {
    // document.body.style.overflow = 'hidden';
  };

  const handleMouseLeave = () => {
    // document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (!isChat || operatorReplied) return;
    const timer = setTimeout(() => {
      setOperatorMessage(true);
      setOperatorReplied(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [isChat, operatorReplied]);

  const handleSend = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setIsChat(true);
      setMessages([...messages, { name, message, time: getCurrentTime() }]);
      setMessage('');
      setTimeout(() => {
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
      if (!operatorReplied) {
        setTimeout(() => {
          setMessages(prev => [...prev, { name: 'Оператор', message: 'Спасибо за обращение! Мы скоро свяжемся с вами.', time: getCurrentTime() }]);
          setTimeout(() => {
            const chatContainer = document.querySelector('.chat-container');
            if (chatContainer) {
              chatContainer.scrollTop = chatContainer.scrollHeight;
            }
          }, 100);
        }, 2500);
      }
    }, 1800);
  };

  return (
    <>
      {/* Круглая кнопка поддержки */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e90ff 60%, #00c6fb 100%)',
          boxShadow: '0 4px 24px rgba(30,144,255,0.18)',
          border: 'none',
          display: open ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          cursor: 'pointer',
          transition: 'box-shadow 0.2s',
        }}
        title="Техподдержка"
      >
        {/* SVG иконка поддержки — кастомный path */}
        <svg width="36" height="36" viewBox="0 0 363 363" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M277.73,94.123c0,10.997-8.006,17.685-13.852,22.593c-2.214,1.859-6.335,5.251-6.324,6.518 c0.04,4.97-3.956,8.939-8.927,8.939c-0.025,0-0.05,0-0.075,0c-4.936,0-8.958-3.847-8.998-8.792 c-0.079-9.747,7.034-15.584,12.75-20.383c4.485-3.766,7.426-6.416,7.426-8.841c0-4.909-3.994-8.903-8.903-8.903 c-4.911,0-8.906,3.994-8.906,8.903c0,4.971-4.029,9-9,9s-9-4.029-9-9c0-14.834,12.069-26.903,26.904-26.903 C265.661,67.253,277.73,79.288,277.73,94.123z M248.801,140.481c-4.971,0-8.801,4.029-8.801,9v0.069 c0,4.971,3.831,8.966,8.801,8.966s9-4.064,9-9.035S253.772,140.481,248.801,140.481z M67.392,203.174c-4.971,0-9,4.029-9,9 s4.029,9,9,9h0.75c4.971,0,9-4.029,9-9s-4.029-9-9-9H67.392z M98.671,203.174c-4.971,0-9,4.029-9,9s4.029,9,9,9h0.749 c4.971,0,9-4.029,9-9s-4.029-9-9-9H98.671z M363,59.425v101.301c0,23.985-19.232,43.448-43.217,43.448H203.066 c-2.282,0-4.161-0.013-5.733-0.046c-1.647-0.034-3.501-0.047-4.224,0.033c-0.753,0.5-2.599,2.191-4.378,3.83 c-0.705,0.649-1.503,1.363-2.364,2.149l-33.022,30.098c-2.634,2.403-6.531,3.025-9.793,1.587c-3.262-1.439-5.552-4.669-5.552-8.234 v-95.417H43.72c-14.062,0-25.72,11.523-25.72,25.583v101.301c0,14.061,11.659,25.116,25.72,25.116h130.374 c2.245,0,4.345,1.031,6.003,2.545L207,317.523v-85.539c0-4.971,4.029-9,9-9s9,4.029,9,9v105.938c0,3.565-2.04,6.747-5.303,8.186 c-1.167,0.515-2.339,0.718-3.566,0.718c-2.204,0-4.378-0.905-6.069-2.449l-39.457-36.204H43.72c-23.986,0-43.72-19.13-43.72-43.116 V163.757c0-23.985,19.734-43.583,43.72-43.583H138V59.425c0-23.986,19.885-43.251,43.871-43.251h137.913 C343.768,16.174,363,35.439,363,59.425z M345,59.425c0-14.061-11.157-25.251-25.217-25.251H181.871 C167.81,34.174,156,45.364,156,59.425v69.833v83.934l18.095-16.353c0.838-0.765,1.777-1.465,2.462-2.097 c8.263-7.614,10.377-8.831,21.155-8.609c1.47,0.031,3.221,0.042,5.354,0.042h116.717c14.06,0,25.217-11.388,25.217-25.448V59.425z"
            fill="#fff"/>
        </svg>
      </button>

      {/* Модальное окно поддержки в правом нижнем углу */}
      {open && (
        <div
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            minWidth: 340,
            maxWidth: 380,
            width: '90vw',
            background: '#fff',
            borderRadius: 18,
            boxShadow: '0 8px 32px rgba(30,40,60,0.18)',
            padding: '32px 28px 24px 28px',
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            animation: 'fadeIn .2s',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Кнопка закрытия */}
          <button
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              background: 'none',
              border: 'none',
              fontSize: 22,
              color: '#888',
              cursor: 'pointer',
            }}
            aria-label="Закрыть"
          >×</button>
          <div style={{ fontWeight: 700, fontSize: 22, color: '#1e293b', marginBottom: 6 }}>Напишите нам, операторы в сети!
          </div>
          {isChat ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="chat-container" style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 14, scrollbarWidth: 'thin', scrollbarColor: '#e0e7ef transparent', scrollBehavior: 'smooth' }}>
                {messages.map((msg, index) => (
                  <div key={index} style={{ padding: '10px 14px', borderRadius: 10, background: '#f0f9ff', border: '1px solid #e0e7ef', fontSize: 16, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong>{msg.name}</strong>
                      <span style={{ color: '#888', fontSize: 12 }}>{msg.time}</span>
                    </div>
                    <div>{msg.message}</div>
                  </div>
                ))}
              </div>
              <style>{`
                .chat-container::-webkit-scrollbar {
                  width: 6px;
                }
                .chat-container::-webkit-scrollbar-track {
                  background: transparent;
                }
                .chat-container::-webkit-scrollbar-thumb {
                  background-color: #e0e7ef;
                  border-radius: 3px;
                }
              `}</style>
              <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <textarea
                  placeholder="Ваш вопрос или сообщение..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid #e0e7ef',
                    fontSize: 16,
                    minHeight: 80,
                    resize: 'none',
                    outline: 'none',
                    background: '#f8fafc',
                  }}
                  required
                />
                <button
                  type="submit"
                  disabled={sent}
                  style={{
                    marginTop: 8,
                    background: 'linear-gradient(135deg, #1e90ff 60%, #00c6fb 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 18,
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 0',
                    cursor: sent ? 'not-allowed' : 'pointer',
                    boxShadow: sent ? 'none' : '0 2px 8px rgba(30,144,255,0.10)',
                    opacity: sent ? 0.7 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {sent ? 'Отправлено!' : 'Отправить'}
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid #e0e7ef',
                  fontSize: 16,
                  outline: 'none',
                  background: '#f8fafc',
                }}
                required
              />
              <input
                type="email"
                placeholder="E-mail для связи"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid #e0e7ef',
                  fontSize: 16,
                  outline: 'none',
                  background: '#f8fafc',
                }}
                required
              />
              <textarea
                placeholder="Ваш вопрос или сообщение..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid #e0e7ef',
                  fontSize: 16,
                  minHeight: 80,
                  resize: 'none',
                  outline: 'none',
                  background: '#f8fafc',
                }}
                required
              />
              <button
                type="submit"
                disabled={sent}
                style={{
                  marginTop: 8,
                  background: 'linear-gradient(135deg, #1e90ff 60%, #00c6fb 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 18,
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 0',
                  cursor: sent ? 'not-allowed' : 'pointer',
                  boxShadow: sent ? 'none' : '0 2px 8px rgba(30,144,255,0.10)',
                  opacity: sent ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {sent ? 'Отправлено!' : 'Отправить'}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
};

export default SupportButton; 