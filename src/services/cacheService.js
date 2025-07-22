// const CACHE_PREFIX = 'cinema_cache_';
// const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

// class CacheService {
//   static set(key, data, ttl = DEFAULT_TTL) {
//     const item = {
//       data,
//       timestamp: Date.now(),
//       ttl
//     };
//     try {
//       localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
//     } catch (e) {
//       console.warn('CacheService set error:', e);
//     }
//   }

//   static get(key) {
//     const itemStr = localStorage.getItem(CACHE_PREFIX + key);
//     if (!itemStr) return null;

//     try {
//       const { data, timestamp, ttl } = JSON.parse(itemStr);
//       const now = Date.now();

//       // Проверяем не истек ли срок хранения
//       if (now - timestamp > ttl) {
//         localStorage.removeItem(CACHE_PREFIX + key);
//         return null;
//       }
//       return data;
//     } catch (e) {
//       console.warn('CacheService get error parsing JSON:', e);
//       localStorage.removeItem(CACHE_PREFIX + key);
//       return null;
//     }
//   }

//   static remove(key) {
//     localStorage.removeItem(CACHE_PREFIX + key);
//   }

//   static clear() {
//     Object.keys(localStorage)
//       .filter(key => key.startsWith(CACHE_PREFIX))
//       .forEach(key => localStorage.removeItem(key));
//   }

//   static getStats() {
//     const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX));

//     return {
//       totalItems: keys.length,
//       items: keys.map(key => {
//         try {
//           const item = JSON.parse(localStorage.getItem(key));
//           return {
//             key: key.replace(CACHE_PREFIX, ''),
//             age: Date.now() - item.timestamp,
//             ttl: item.ttl
//           };
//         } catch {
//           return {
//             key: key.replace(CACHE_PREFIX, ''),
//             age: null,
//             ttl: null
//           };
//         }
//       })
//     };
//   }

//   // Методы для кеширования сеансов (sessions)

//   static setSessions(movieId, date, sessions) {
//     const dateStr = String(date);
//     const key = `sessions_${movieId}_${dateStr}`;
//     console.log('Cache set sessions:', key, sessions);
//     this.set(key, sessions);
//   }

//   static getSessions(movieId, date) {
//     const dateStr = String(date);
//     const key = `sessions_${movieId}_${dateStr}`;
//     return this.get(key);
//   }
// }

// export default CacheService;
