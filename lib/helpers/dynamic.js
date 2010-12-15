module.exports = {
  flashMessages: function (req, res) {
    return function () {
      var messages = req.flash();

      return res.partial('partials/flash_messages', {
        object: messages,
        as: 'types',
        locals: {hasFlashMessages: Object.keys(messages).length},
        dynamicHelpers: false
      });
    };
  }
};
