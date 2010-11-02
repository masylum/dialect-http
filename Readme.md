# ExpressDialect

ExpressDialect is a "pluggable" express application that deals with i18n.

This module is builtin upon [dialect](http://github.com/masylum/dialect/), the nodejs alternative to gettext.

Currently [dialect](http://github.com/masylum/dialect/) just provides a MongoDB store,
so you need MongoDB to be installed and running.

## Features

  * An amazing helper _t()_ that you can use to translate your views.
  * A super awesome backend GUI tool to manage your translations.

<img src = "http://github.com/masylum/express-dialect/raw/master/lib/public/images/example.jpg" border = "0" />

## How does it work?

Easy!
Imagine you have this express application:

    var express = require('express'),
        app = express.createServer(),
        connect = require('connect');

    app.get('', function (req, res) {
      res.render('index', {layout: null});
    });

    app.listen(3000);

To "plug" espress_dialect you just need to:

    npm install express-dialect

and then add some lines to your app.

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

    express_dialect(dialect_options, function (error, dialect) {
      app.dynamicHelpers(dialect.dynamic_helpers); // makes t() available

      app.get('', function (req, res) {
        res.render('index', {layout: null});
      });

      app.listen(3000);
      dialect.app.listen(3001); // Starts express-dialect on port 3001
    });

Now open your views and make your strings available to translate.

    h1= t('Post')
    p= t(post.body)

Open your browser and type "http://localhost:3001", if you didn't provide a custom user password type 'admin' and 'admin'.

OMG! Double rainbow! its amazing, isn't it?

## Configuration options

  - *app*: Your current express app.
  - *path*: Where you want to store the JSON files with the cached translations.
  - *store*: 'mongodb'. Other stores will be implemented soon.
  - *database*: 'translations'. Database name you want to store the translations.
  - *title* (optional): Custom title for the backend admin.
  - *username* (optional): username to authenticate. Defaults to 'admin'
  - *password* (optional): password to authenticate. Defaults to 'admin'

## TODO

Don't hesitate on forking the project!

  * Compatibilililitity with dialect's API (counts and contexts missing)
  * Show languages names. (en => English)
  * Make the helper visible, not just on the views.
  * Dashboard on the homepage
