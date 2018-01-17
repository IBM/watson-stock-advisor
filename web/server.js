var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');

var port = process.env.PORT || 8080; // set our port

// parse application/json
app.use(bodyParser.json());
// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// override with the X-HTTP-Method-Override header in the request
app.use(methodOverride('X-HTTP-Method-Override'));

// set static files location
app.use(express.static(__dirname + '/public'));

// pass application into routes
require('./app/routes')(app);
require('./app/util/cloudant-db');

// start app
app.listen(port);
console.log('Watson Stock Server starting on port ' + port);
exports = module.exports = app;