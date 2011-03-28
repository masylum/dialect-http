jQuery().busy('defaults', {img: '/images/busy.gif', hide: false});
jQuery().busy('preload');

$(function () {
  var current_locale = $('#current_locale').val(),
      base_locale = $('#base_locale').val(),

      getTextarea = function ($el) {
        return $el.parent().prev();
      },

      updateForm = function ($textarea) {
        var $form = $textarea.parent(),
            $text_bar = $('h1.bars'),
            parts = $text_bar.text().split(' ')[0].split('/'),
            pending,
            total;

        pending = parts[0];
        total = parts[1];

        if ($textarea.val() && !$textarea.data('old_value')) {
          pending++;
          $form.removeClass('pending').addClass('ok');
        } else if (!$textarea.val() && $textarea.data('old_value')) {
          pending--;
          $form.removeClass('ok').addClass('pending');
        }

        $text_bar.text(pending + '/' + total + ' ' + $text_bar.text().split(' ')[1]);

        $('div.bars a').eq(0).css({width: ((pending / total) * 100) + '%'});
        $('div.bars a').eq(1).css({width: (100 - ((pending / total) * 100)) + '%'});
      };

  $('textarea.translation')
    .each(function () {
      $(this).data('old_value',  $(this).val());
    })
    .change(function () {
      var $textarea = $(this),
          old_value = $textarea.data('old_value'),
          new_value = $textarea.val();

      if (old_value !== new_value) {
        $.ajax({
          type: 'POST',
          url: '/' + current_locale + '/translate/',
          data: {
            translation: new_value,
            original: $textarea.prevAll('input').val()
          },
          success: function () {
            $textarea.busy('hide');
          },
          dataType: 'text'
        });

        $textarea.busy({title: 'saving...'});

        updateForm($textarea);

        $textarea.data('old_value',  new_value);
      }
    });

  $('a.clean').click(function () {
    var $textarea = getTextarea($(this));
    $textarea.val('').change();
    return false;
  });

  $('a.get_original').click(function () {
    var $textarea = getTextarea($(this)),
        $original = $textarea.prev().prev();

    $textarea.val($original.val()).change();
    return false;
  });

  $('a.autotranslate').click(function () {
    var $textarea = getTextarea($(this)),
        $original = $textarea.prev().prev();

    document.translate.text({input: base_locale, output: current_locale}, $original.val(), function (result) {
      $textarea.val(result).change();
    });

    return false;
  });
});
