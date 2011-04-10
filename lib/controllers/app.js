module.exports = function (DIALECT_HTTP) {
  var app = DIALECT_HTTP.app,
      options = DIALECT_HTTP.options,
      title = options.title + ' | ';

  app.get('/', function (req, res) {
    if (req.session.auth && req.session.auth.user) {

      req.user = req.session.auth.user;

      // TODO: Dashboard
      res.render('index', {
        title: title + 'Edit your translations',
        translations: [],
        locale: null
      });
    } else {
      res.render('public/users/login', {
        title: title + 'Login',
        email: null,
        password: null,
        layout: 'public'
      });
    }
  });

  app.get('/public/users/login', function (req, res) {
    res.render('public/users/login', {
      title: title + 'Login',
      email: null,
      password: null,
      layout: 'public'
    });
  });

};
