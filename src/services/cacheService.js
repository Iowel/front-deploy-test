const CACHE_PREFIX = 'cinema_cache_';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

class CacheService {
  static set(key, data, ttl = DEFAULT_TTL) {
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  }

  static get(key) {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;

    const { data, timestamp, ttl } = JSON.parse(item);
    const now = Date.now();

    // Проверяем не истек ли срок хранения
    if (now - timestamp > ttl) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return data;
  }

  static remove(key) {
    localStorage.removeItem(CACHE_PREFIX + key);
  }

  static clear() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }

  static getStats() {
    const keys = Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX));
    
    return {
      totalItems: keys.length,
      items: keys.map(key => {
        const item = JSON.parse(localStorage.getItem(key));
        return {
          key: key.replace(CACHE_PREFIX, ''),
          age: Date.now() - item.timestamp,
          ttl: item.ttl
        };
      })
    };
  }

  // Новые методы для работы с сеансами
  static setSessions(movieId, date, sessions) {
    const key = `sessions_${movieId}_${date}`;
    this.set(key, sessions);
  }

  static getSessions(movieId, date) {
    const key = `sessions_${movieId}_${date}`;
    return this.get(key);
  }
}

export default CacheService; 