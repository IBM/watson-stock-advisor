

/**
 * This job should be required by the main application. It will run daily
 * (but can be configured below). This job triggers an update to the system
 * by invoking the discovery service to retrieve the latest articles and
 * post them to the database
 */

require('../../config')

var CronJob = require('cron').CronJob;
var updateTask = require('../services/stock_update');
var task = new updateTask();

  /*
   * Runs every day at 01:00:00 AM.
   */
var job = new CronJob('00 00 01 * * 0-6', function() {

    console.log("Beginning stock update task");
    task.run();
  }, function () {
    /* This function is executed when the job stops */
    console.log("stock update task stopped");
  },
  true, /* Start the job right now */
  process.env.TIME_ZONE || 'America/Los_Angeles' /* Time zone of this job. */
);