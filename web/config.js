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
const env_path  = appRoot + '/.env'
require('dotenv').config({path: env_path})

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
      })
    }
  }
  return companies;
}

//load the companies from files
const dataPath = './app/data/';
const dataFiles = ['NASDAQ_mapping.txt', 'NYSE_mapping.txt'];
var companies = [];

for (var x=0; x<dataFiles.length; x++) {
  var file = dataPath + dataFiles[x];
  companies = companies.concat(loadCompanies(file));
}

var configured = false;

if (fs.existsSync(env_path)) {
  configured = true;
} else {
  console.log(".env file not found")
}

module.exports = {
  configured : configured,
  companies  : companies
}
