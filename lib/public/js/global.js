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
            parts = $text_bar.text().match(/[0-9]+/g),
            ok, pending, missing, total;

        total   = parts[0];
        ok      = parts[1];
        pending = parts[2];
        missing = parts[3];

        if ($textarea.data('old_value')) {
          if ($textarea.val()) {
            if ($form.hasClass('ok')) {
              pending++;
              ok--;
              $form.removeClass('ok').addClass('pending');
            }
          } else {
            missing++;
            if ($form.hasClass('ok')) {
              ok--;
              $form.removeClass('ok').addClass('missing');
            } else {
              pending--;
              $form.removeClass('pending').addClass('missing');
            }
          }
        } else {
          if ($textarea.val()) {
            missing--;
            pending++;
            $form.removeClass('missing').addClass('pending');
          }
        }

        $text_bar.text(total + ' strings, ' + ok + ' translated, ' + pending + ' pending, ' + missing + ' missing');

        var percent_ok = (ok / total) * 100;
        var percent_pending = (pending / total) * 100;

        $('div.bars a').eq(0).css({width: percent_ok + '%'});
        $('div.bars a').eq(1).css({width: percent_pending + '%'});
        $('div.bars a').eq(2).css({width: (100 - percent_ok - percent_pending) + '%'});
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
