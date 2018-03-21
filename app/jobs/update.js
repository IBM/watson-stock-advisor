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

/**
 * This job should be required by the main application. It will run daily
 * (but can be configured below). This job triggers an update to the system
 * by invoking the discovery service to retrieve the latest articles and
 * post them to the database
 */

require('../../config');

const CronJob = require('cron').CronJob;
const updateTask = require('../services/stockUpdate');
const task = new updateTask();

/*
 * Runs every day at 01:00:00 AM.
 */
new CronJob('00 00 01 * * 0-6', function() {

  console.log('Beginning stock update task');
  task.run();
}, function () {
  /* This function is executed when the job stops */
  console.log('stock update task stopped');
},
true, /* Start the job right now */
process.env.TIME_ZONE || 'America/Los_Angeles' /* Time zone of this job. */
);

