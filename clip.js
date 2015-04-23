/**
 * Extends H5P.Collage with a Clip class.
 *
 * TODO: Make sure we support all browsers: cursor, animations
 */
(function (Collage, $, EventDispatcher) {

  /**
   * Collage Clip
   *
   * TODO: Allow rotating images?
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

    // Shared clip resources
    var $empty, $img, prop, edit;

    /**
     * @private
     */
    var init = function () {
      // Displayed when there's no clip content
      $empty = $('<div/>', {
        'class': 'h5p-collage-empty',
        appendTo: $container,
      });

      // Create new image element
      $img = $('<img/>', {
        'class': 'h5p-collage-image' + (edit ? ' h5p-collage-edit' : ''),
        alt: 'TODO',
        appendTo: $container,
        on: {
          load: function () {
            // Stop hiding
            $img.css({
              width: 'auto',
              height: 'auto',
              margin: 0,
              visibility: 'visible'
            }).attr('tabindex', edit ? '1' : '');

            // Remove loading
            $empty.removeClass('h5p-collage-loading').detach();

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
            $img.css('margin', content.offset.top + '% 0 0 ' + content.offset.left + '%');
          }
        }
      });

      if (content.image) {
        self.loading();
        loadImage();
      }
    };

    /**
     * @private
     */
    var loadImage = function () {
      $img.attr('src', H5P.getPath(content.image.path, contentId));
    };

    /**
     * @public
     */
    self.update = function (newContent) {
      content.image = newContent;
      content.scale = 1;
      content.offset = {
        top: 0,
        left: 0
      };
      loadImage();
    };

    /**
     * @public
     */
    self.loading = function () {
      // Hide image
      $img.css({
        width: '',
        height: '',
        margin: ''
      }).attr('tabindex', '');

      $empty.addClass('h5p-collage-loading').prependTo($container);
    };

    /**
     * @public
     */
    self.append = function ($element) {
      $container.append($element);
    };

    /**
     * @public
     *
     * TODO: Keyboard support
     * TODO: Touch support
     */
    self.enableRepositioning = function () {
      edit = true;

      /**
       * A helpers that makes it easier to keep track of size.
       *
       * @private
       * @class
       * @param {Number} x
       * @param {Number} y
       */
      function Size(x, y) {
        this.x = x;
        this.y = y;
      }

      /**
       * Helps calculate a new offset for the image.
       *
       * @private
       * @class
       * @param {Size} current
       * @param {Size} delta change
       * @param {Size} max value
       */
      function Offset(current, delta, max) {
        var x = current.x - delta.x;
        var y = current.y - delta.y;

        if (x > 0) {
          x = 0;
        }
        else if (x < -max.x) {
          x = -max.x;
        }

        if (y > 0) {
          y = 0;
        }
        else if (y < -max.y) {
          y = -max.y;
        }

        this.getPx = function () {
          return {
            marginLeft: x + 'px',
            marginTop: y + 'px'
          };
        };

        this.getPs = function () {
          var viewPort = getViewPort();
          var p = viewPort.x / 100;
          return {
            left: x / p,
            top: y / p
          };
        };
      }

      /**
       * Converts css pixel values to number
       *
       * @private
       * @returns {Number}
       */
      function pxToNum(px) {
        return Number(px.replace('px', ''));
      }

      // Keep track of container size (not loaded until used)
      var getViewPort = (function () {
        var viewPort;
        return function () {
          if (!viewPort) {
            viewPort = new Size($container.width(), $container.height());
          }
          return viewPort;
        };
      })();

      // Mousewheel zoom enabled while holding the Z key
      var zooming = false;
      H5P.$body.on('keydown', function (event) {
        if (event.keyCode === 90) {
          zooming = true;
        }
        else if ((event.keyCode === 107 || event.keyCode === 171) && $img.is(':focus')) {
          zoom(0.1);
        }
        else if ((event.keyCode === 109 || event.keyCode === 173) && $img.is(':focus')) {
          zoom(-0.1);
        }
      });
      H5P.$body.on('keyup', function (event) {
        if (event.keyCode === 90) {
          zooming = false;
        }
      });
      $img.on('mousewheel DOMMouseScroll', function (event) {
        $img.focus();
        if (zooming) {
          if (event.originalEvent.wheelDelta) {
            zoom(event.originalEvent.wheelDelta > 0 ? 0.1 : -0.1);
            return false;
          }
          else if (event.originalEvent.detail) {
            zoom(event.originalEvent.detail > 0 ? -0.1 : 0.1);
            return false;
          }
        }
      });

      /**
       * @private
       */
      var zoom = function (delta) {
        // Increase / decrease scale
        content.scale += delta;

        // Keep withing boundries
        if (content.scale < 1) {
          content.scale = 1;
        }
        if (content.scale > 3) {
          content.scale = 3;
        }

        // Keep track of size before scaling
        var before = new Size($img.width(), $img.height());

        // Scale
        $img.css(prop, (content.scale * 100) + '%');

        // ... and after scaling
        var after = new Size($img.width(), $img.height());

        var viewPort = getViewPort();
        var offset = new Offset(
          new Size(pxToNum($img.css('marginLeft')), pxToNum($img.css('marginTop'))),
          new Size(((after.x - before.x) / 2), ((after.y - before.y) / 2)),
          new Size(after.x - viewPort.x, after.y - viewPort.y)
        );
        $img.css(offset.getPx());
        content.offset = offset.getPs();
      };

      // Make it possible to pan / move the image around
      var startPos, currentOffset, maxOffset, lastOffset;
      $img.on('mousedown', function (event) {
        if (event.button !== 0) {
          return; // Only left click
        }

        var viewPort = getViewPort();
        currentOffset = new Size(pxToNum($img.css('marginLeft')), pxToNum($img.css('marginTop')));
        maxOffset = new Size($img.width() - viewPort.x, $img.height() - viewPort.y);
        startPos = new Size(event.pageX, event.pageY);

        H5P.$body
          .bind('mouseup', release)
          .bind('mouseleave', release)
          .bind('mousemove', move)
          .addClass('h5p-no-select');

        $img.addClass('h5p-collage-grabbed').focus();

        return false;
      });

      /**
       * Move image
       *
       * @private
       */
      var move = function (event) {
        lastOffset = new Offset(
          currentOffset,
          new Size(startPos.x - event.pageX, startPos.y - event.pageY),
          maxOffset
        );
        $img.css(lastOffset.getPx());
      };

      /**
       * Image released, stop moving
       *
       * @private
       */
      var release = function () {
        H5P.$body
          .unbind('mouseup', release)
          .unbind('mouseleave', release)
          .unbind('mousemove', move)
          .removeClass('h5p-no-select');

        $img.removeClass('h5p-collage-grabbed');

        if (lastOffset) {
          content.offset = lastOffset.getPs();
        }
      };
    };

    init();
  };


  // Extends the event dispatcher
  Collage.Clip.prototype = Object.create(EventDispatcher.prototype);
  Collage.Clip.prototype.constructor = Collage.Clip;

})(H5P.Collage, H5P.jQuery, H5P.EventDispatcher);
