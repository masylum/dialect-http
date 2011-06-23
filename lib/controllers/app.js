module.exports = function (DIALECT_HTTP) {
  var app = DIALECT_HTTP.app,
      options = DIALECT_HTTP.options,
      title = options.title + ' | ',

      _dashboard = function (req, res) {
        req.user = req.session.auth.user;

        function map() {
          if (this.translation && this.approved) {
            emit(this.locale, {ok: 1, pending: 0, missing: 0});
          } else if (this.translation && !this.approved) {
            emit(this.locale, {ok: 0, pending: 1, missing: 0});
          } else {
            emit(this.locale, {ok: 0, pending: 0, missing: 1});
          }
        }

        function reduce(k, vals) {
          var i, res = {ok: 0, pending: 0, missing: 0};
          for (i in vals) {
            res.ok += vals[i].ok;
            res.pending += vals[i].pending;
            res.missing += vals[i].missing;
          }
          return res;
        }

		console.log( DIALECT_HTTP.dialect.store.collection.mapReduce);
        DIALECT_HTTP.dialect.store.collection.mapReduce(map, reduce, function (err, coll) {
			console.log(coll);
          if (coll) {
            coll.find({}, function (err, cursor) {
				console.log(cursor)
              cursor.toArray(function (err, docs) {
				  console.log(docs);
                var stats = {};
                docs.forEach(function (stat) {
                  stats[stat._id] = stat.value;
                });
                res.render('dashboard', {
                  title: title + 'Edit your translations',
                  stats: stats,
                  locale: null
                });
              });
            });
          } else {
            res.render('dashboard', {
              title: title + 'Edit your translations',
              stats: {},
              locale: null
            });
          }
        });
      };

  app.get('/', function (req, res) {
    if (req.session.auth && req.session.auth.user) {
      _dashboard(req, res);
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
