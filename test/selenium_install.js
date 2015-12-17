var selenium = require('selenium-standalone');
var cb = function(){
  console.log('end');
}
selenium.install({
  // check for more recent versions of selenium here:
  // https://selenium-release.storage.googleapis.com/index.html
  version: '2.45.0',
  baseURL: 'https://selenium-release.storage.googleapis.com',
  drivers: {
    chrome: {
      // check for more recent versions of chrome driver here:
      // https://chromedriver.storage.googleapis.com/index.html
      version: '2.9',
      arch: process.arch,
      baseURL: 'https://chromedriver.storage.googleapis.com'
    },
    ie: {
      // check for more recent versions of internet explorer driver here:
      // https://selenium-release.storage.googleapis.com/index.html
      version: '2.48.0',
      arch: process.arch,
      baseURL: 'https://selenium-release.storage.googleapis.com'
    }
  },
  logger: function(message) {

  },
  progressCb: function(totalLength, progressLength, chunkLength) {

  }
}, cb);