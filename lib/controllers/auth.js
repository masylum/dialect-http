module.exports = function (DIALECT_HTTP) {
  var app = DIALECT_HTTP.app;

  app.post('/auth/form', function (req, res) {
    req.authenticate(['form'], function (error, authenticated) {
      if (authenticated) {
        res.redirect('/');
      } else {
        req.flash('error', 'Incorrect user/password');
        res.redirect('/public/users/login/');
      }
    });
  });

  app.get('/auth/logout', function (req, res) {
    req.logout();
    res.redirect('/', 303);
  });

};
