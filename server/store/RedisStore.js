const uuid = require('uuid/v1');
const Redis = require('redis');

module.exports = class RedisStore {
  constructor(redisClientConfig) {
    this.redis = Redis.createClient(redisClientConfig);
  }

  storeUser({ accessToken, shop }, done) {
    const id = uuid();

    this.redis.hmset(id, { accessToken, shop }, err => {
      if (err) {
        return done(err);
      }

      done(null, id);
    });
  }

  getToken(id, done) {
    this.redis.hgetall(id, (err, remoteToken) => {
      if (err) {
        return done(err);
      }

      done(null, remoteToken);
    });
  }
};
