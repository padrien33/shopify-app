const RedisStore = require('./RedisStore');
const MemoryStore = require('./MemoryStore');

const ENGINES = {
  REDIS: 'redis',
  MEMORY: 'memory',
};

module.exports = class Store {
  constructor(type = ENGINES.MEMORY) {
    switch (type) {
      case ENGINES.REDIS:
        return new RedisStore();
      case ENGINES.MEMORY:
      default:
        if (process.env.NODE_ENV === 'production') {
          console.error('Memory store is not suitable for production!');
        }
        return new MemoryStore();
    }
  }
};
