// Andrew Lunny and Marak Squires
// Mit yo, copy paste us some credit

// simple fn to get the path given text to translate

// OMG, A GLOBAL VARIABLE!
var translate = {};

(function () {

  var _getEnglishTranslatePath = function (lang, text) {
        // set the default input and output languages to English and Spanish
        var input = lang.input || 'en',
            output = lang.output || 'es';

        return [
          '/ajax/services/language/translate?v=1.0&q=',
          encodeURIComponent(text, lang),
          '&langpair=' + input + '|' + output
        ].join("");
      };

  translate.text = function (lang, text, callback) {

    // this is not a good curry recipe. needs moar spice
    if (typeof lang !== 'object') {
      callback = text;
      text = lang;
    }

    var src = "http://ajax.googleapis.com" + _getEnglishTranslatePath(lang, text) + '&callback=translate._callback',
        self = this,
        script = document.createElement("script");

    script.setAttribute("src", src);

    script.onload = function () {
      try {
        var rsp = self._data.shift();
        callback(rsp.translatedText);
        document.body.removeChild(script);
      } catch (e) {
        //console.log(e)
      }
    };
    document.body.appendChild(script);
  };

  translate._data = [];

  translate._callback = function (rsp) {
    this._data.push(rsp.responseData);
  };

  // OMG, A GLOBAL VARIABLE!
  document.translate = translate;
}());
