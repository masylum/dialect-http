var express = require('express'),
    app = express.createServer(),
    connect = require('connect'),
    express_dialect = require('./../lib/express-dialect'),
    dialect_options = {
      app: app,
      path: __dirname + '/data',
      title: 'dialect test',
      store: 'mongodb',
      database: 'translations'
    };

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

express_dialect(dialect_options, function (error, dialect) {
  app.dynamicHelpers(dialect.dynamic_helpers);

  app.get('', function (req, res) {
    res.render('index', {layout: null});
  });

  app.listen(3000);
  dialect.app.listen(3001);
});
