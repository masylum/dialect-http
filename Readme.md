# dialect-http

dialect-http is a web client to manage your dialect translations.

This module is builtin upon [dialect](http://github.com/masylum/dialect/) using the mongodb store.

<img src = "https://github.com/masylum/dialect-http/raw/master/lib/public/images/example.jpg" border = "0" />

[Tutorial + screencast](http://happynerds.tumblr.com/post/5161855930/dealing-with-translations-in-nodejs)

## Features

- Easy to configure.
- Users with roles.
- Autotranslate.
- Approval system.
- Context and plurals handling.

## Installation

Install it using npm. It will create a binary on your `/usr/local/`.

    npm install dialect-http -g

## Configuration options

  - `title`: Custom title for the backend.
  - `users`: Users with acces to the translations
    - `username`: Username to authenticate. Defaults to 'admin'
    - `password`: Password to authenticate. Defaults to 'admin'
    - `locales`: Locales that this user can edit. Defaults to all.
    - `can_approve`: Approval permission within user's locales. Defaults to 'true'
  - `port`: Port number where the application will be running.
  - `sessions_db`: mongodb connection string.
  - `dialect`: Object containing dialect options.

Check [dialect](http://github.com/masylum/dialect/) documentation to see which dialect options can you pass.

## How does it work?

Easy!

First edit a configuration file like this:

    // dialect-http.js
    module.exports = {
      title: 'My app',
      users: [
        { username: 'foo',
          password: 'bar'
        },
        { username: 'joao',
          password: 'gilberto',
          locales: ['pt'],
          can_approve: false
        }
      ],
      port: 3001,

      dialect: {
        locales: ['en', 'es'],
        store: {
          mongodb: {
            collection: 'my_translations'
          }
        }
      }
    }

    $ dialect-http --config dialect-http.js

Open your browser and type "http://localhost:3001".

## License

(The MIT License)

Copyright (c) 2010-2011 Pau Ramon <masylum@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
