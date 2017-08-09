const uuid = require('uuid/v1');

module.exports = class RedisStore {
  constructor(redisClientConfig) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Memory store is not meant for production environments and WILL LEAK MEMORY ' +
        'Please change your SHOPIFY_APP_STORAGE_ENGINE environment variable.'
      )
    }

    this.store = {};
  }

  storeUser({ accessToken, shop }, done) {
    const id = uuid();

    this.store = {
      ...this.store,
      [id]: { accessToken, shop },
    };

    done(null, id);
  }

  getToken(id, done) {
    const {accessToken} = this.store[id];

    if (!accessToken) {
      return done(err);
    }

    done(null, remoteToken);
  }
}
