// Массив API ключей для ротации
export const API_KEYS = [
  '739c9596-5220-4224-bc7f-b42b4b1d4152',
  '3bb653d6-87f6-4c6d-901a-0a32def49f9e'
];

// Функция для получения следующего API ключа
let currentKeyIndex = 0;
export const getNextApiKey = () => {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}; 