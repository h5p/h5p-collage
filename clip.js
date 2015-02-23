/**
 * Extends H5P.Collage with a Clip class.
 */
(function (Collage, $, EventDispatcher) {

  /**
   * Collage Clip
   *
   * @class
   * @namespace H5P.Collage
   * @param {jQuery} $container
   * @param {Object} content
   * @param {Number} contentId
   */
  Collage.Clip = function ($container, content, contentId) {
    var self = this;

    // Initialize event inheritance
    EventDispatcher.call(self);

    var prop;

    // Create new image element
    var $img = self.$img = $('<img/>', {
      'class': 'h5p-collage-image',
      alt: 'TODO',
      src: H5P.getPath(content.type.params.file.path, contentId),
      appendTo: $container,
      css: {
        width: '1px',
        height: '1px',
        margin: '0 0 0 -1px'
      },
      on: {
        load: function () {
          $img.css({
            width: '',
            height: '',
            margin: ''
          });

          // Find ratios
          var imageRatio = (this.width / this.height);
          var containerRatio = ($container.width() / $container.height());

          // Make sure image covers the whole container
          if (imageRatio > containerRatio) {
            prop = 'height';
          }
          else {
            prop = 'width';
          }
          $img.css(prop, (content.scale * 100) + '%');

          // Offset image
          $img.css('margin', -content.offset.top + '% 0 0 ' + -content.offset.left + '%');
        }
      }
    });

    /**
     * Not used.
     *
     * @public
     */
    self.fit = function () {

    };

    self.append = function ($element) {
      $container.append($element);
    };

    self.remove = function () {
      $img.css({
        width: '1px',
        height: '1px'
      });
    };

    self.updateImage = function (source) {
      content.type.params.file = source;
      content.scale = 1;
      content.offset = {
        top: 0,
        left: 0
      };
      $img.attr('src', H5P.getPath(source.path, contentId));
    };

    self.zoom = function (delta) {
      content.scale += delta;
      if (content.scale < 1) {
        content.scale = 1;
      }
      if (content.scale > 3) {
        content.scale = 3;
      }

      var width = $img.width();
      var height = $img.height();
      $img.css(prop, (content.scale * 100) + '%');

//console.log($img.width() - before);
var style = {
  marginLeft: Number($img.css('marginLeft').replace('px', '')) - (($img.width() - width) / 2),
  marginTop: Number($img.css('marginTop').replace('px', '')) - (($img.height() - height) / 2),
};

          if (style.marginLeft > 0) {
            style.marginLeft = 0;
          }

          if (style.marginTop > 0) {
            style.marginTop = 0;
          }

      $img.css(style);

      // var p = $img[prop]() * (delta / 2);
      // console.log(p);
      // $img.css({
      //   marginLeft: Number($img.css('marginLeft').replace('px', '')) - p,
      //   marginTop: Number($img.css('marginLeft').replace('px', '')) - p
      // });
    };
  };


  // Extends the event dispatcher
  Collage.Clip.prototype = Object.create(EventDispatcher.prototype);
  Collage.Clip.prototype.constructor = Collage.Clip;

})(H5P.Collage, H5P.jQuery, H5P.EventDispatcher);
