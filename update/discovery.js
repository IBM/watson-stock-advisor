
const config = require('./config.js');
var Discovery = require('watson-developer-cloud/discovery/v1');
var discovery = new Discovery({
   version      : process.env.DISCOVERY_VERSION,
   version_date : process.env.DISCOVERY_VERSION_DATE
});
 
var utils = require('./utils.js');

//retrieving titles for 5 documents for 'IBM Watson'
function query(topic) {
  
  var promise = new Promise(function(resolve, reject) {
    discovery.query({ environment_id: process.env.DISCOVERY_ENV_ID, collection_id: 'news-en', query: topic, count:5 }, function(error, data) {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
    });
  });
  
  return promise;
}

module.exports = {
  query : query
}
