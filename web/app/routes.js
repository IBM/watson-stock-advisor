module.exports = function(app) {

  // server routes

  // frontend routes
  app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
  });

};
