const RedisStore = require('./RedisStore');
const MemoryStore = require('./RedisStore');

const ENGINES = {
  REDIS: 'redis',
  MEMORY: 'memory',
};

class Store {
  constructor(type = ENGINES.MEMORY) {
    switch (type) {
      case ENGINES.REDIS:
        return new RedisStore();
      case ENGINES.MEMORY:
      default:
        return new MemoryStore();
    }
  }
}

module.exports = {
  Store,
  ENGINES,
}
