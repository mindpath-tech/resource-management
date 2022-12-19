/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./lib/src/config').ormConfig;
} else {
  module.exports = require('./src/config').ormConfig;
}
