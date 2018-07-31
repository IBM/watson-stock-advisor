/**
 * Copyright 2018 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

const fs = require('fs');
const appRoot = require('app-root-path');
const env_path  = appRoot + '/.env';
require('dotenv').config({path: env_path});

/**
 * Reads the contents of the given fileName and tries to parse them into companies
 * @param {string} fileName - The full (relative) path of the file
 */
function loadCompanies(fileName) {
  var companies = [];
  var lines = fs.readFileSync(fileName, 'utf8').split('\n');
  for (var i=0; i<lines.length; i++) {
    var line = lines[i];
    if (line.trim() !== '') {
      var components = line.split('\t');
      companies.push({
        ticker: components[0],
        name: components[1]
      });
    }
  }
  return companies;
}

//load the companies from files
const dataPath = appRoot + '/app/data/';
const dataFiles = ['NASDAQ_mapping.txt', 'NYSE_mapping.txt'];
var companies = [];

for (var x=0; x<dataFiles.length; x++) {
  var file = dataPath + dataFiles[x];
  companies = companies.concat(loadCompanies(file));
}

//sort companies by name
companies = companies.sort(function(a, b) {
  if (a.name < b.name) {
    return -1;
  } else if (a.name > b.name) {
    return 1;
  }
  return 0;
});

const VCAP = process.env.VCAP_SERVICES;
var configured = true;
var usingEnv = false;
var usingVCAP = false;

if (fs.existsSync(env_path)) {
  usingEnv = true;
  console.log('using env file');
} else if (VCAP) {
  usingVCAP = true;
  console.log('using VCAP');
} else {
  configured = false;
  console.log('.env file not found');
}

function getDBCredentialsUrl(jsonData) {
  var vcapServices = JSON.parse(jsonData);
  // Pattern match to find the first instance of a Cloudant service in
  // VCAP_SERVICES. If you know your service key, you can access the
  // service credentials directly by using the vcapServices object.
  for (var vcapService in vcapServices) {
    if (vcapService.match(/cloudant/i)) {
      return vcapServices[vcapService][0].credentials.url;
    }
  }
}

var theConfig = {
  configured               : configured,
  usingEnv                 : usingEnv,
  usingVCAP                : usingVCAP,
  companies                : companies,
  MAX_ARTICLES_PER_COMPANY : process.env.MAX_ARTICLES_PER_COMPANY || 100,
  MAX_COMPANIES            : process.env.MAX_COMPANIES || 20,
  APP                      : {
    port : process.env.PORT || 8080
  },
  CLOUDANT                 : {
    account  : process.env.CLOUDANT_HOST,
    key      : process.env.CLOUDANT_USERNAME,
    password : process.env.CLOUDANT_PASSWORD,
    db_name  : process.env.DB_NAME || 'stock-data'
  },
  DISCOVERY                : {
    version_date : process.env.DISCOVERY_VERSION_DATE || '2018-03-05',
    env_id       : process.env.DISCOVERY_ENV_ID || 'system'
  }
};

if (VCAP) {
  theConfig.VCAP = VCAP;
  theConfig.CLOUDANT.credentialsURL = getDBCredentialsUrl(VCAP);
}

module.exports = theConfig;
