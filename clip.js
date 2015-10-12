(function ($, Collage, EventDispatcher) {

  /**
   * Collage Clip
   *
   * @class H5P.Collage.Clip
   * @extends H5P.EventDispatcher
   * @param {H5P.jQuery} $container
   * @param {Object} content
   * @param {number} contentId
   */
  Collage.Clip = function ($container, content, contentId) {
    var self = this;

    // Initialize event inheritance
    EventDispatcher.call(self);

    // Shared clip resources
    var $empty, $img, prop, edit;

    /**
     * Initialize the clip content.
     * Loads the image and sizes it correctly.
     *
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
        alt: '',
        appendTo: $container,
        on: {
          load: function () {
            // Stop hiding
            $img.css({
              width: 'auto',
              height: 'auto',
              margin: 0,
              visibility: 'visible'
            }).attr('tabindex', edit ? '0' : '');

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

      if (!self.empty()) {
        self.loading();
        loadImage();
      }
    };

    /**
     * Triggers the loading of the image.
     *
     * @private
     */
    var loadImage = function () {
      $img.attr('src', H5P.getPath(content.image.path, contentId));
    };

    /**
     * Check if the current clip is empty or set.
     *
     * @returns {boolean}
     */
    self.empty = function () {
      return !content.image;
    };

    /**
     * Update the clip with new content.
     *
     * @param {Object} newContent
     */
    self.update = function (newContent) {
      if (newContent) {
        content.image = newContent;
        content.scale = 1;
        content.offset = {
          top: 0,
          left: 0
        };
      }

      if (self.empty()) {
        // Remove loading
        $empty.removeClass('h5p-collage-loading');
      }
      else {
        loadImage();
      }
    };

    /**
     * Hide image and display loading screen.
     */
    self.loading = function () {
      // Hide image
      $img.css({
        width: '',
        height: '',
        margin: ''
      }).attr('tabindex', '');

      $empty.addClass('h5p-collage-loading').prependTo($container);
    };

    /**
     * Append clip to given container.
     *
     * @param {H5P.jQuery} $element
     */
    self.append = function ($element) {
      $container.append($element);
    };

    /**
     * Enables panning and zooming on clip.
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
      function Size(x, y) {
        this.x = x;
        this.y = y;

        /**
         * Letter than
         *
         * @param {Size} size
         * @returns {boolean}
         */
        this.lt = function (size) {
          return this.x < size.x || this.y < size.y;
        };
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

        this.getPx = function () {
          return {
            marginLeft: x + 'px',
            marginTop: y + 'px'
          };
        };

        this.getPs = function () {
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

      /**
       * Keep track of container size
       *
       * @private
       * @returns {Size}
       */
      function getViewPort() {
        return new Size($container.width(), $container.height());
      }

      // Mousewheel zoom enabled while holding the Z key
      var zooming = false;
      H5P.$body.on('keydown', function (event) {
        var keyCode = event.keyCode;
        if (keyCode === 90) {
          zooming = true;
        }
        else if ((keyCode === 107 || keyCode === 171 || keyCode === 187) && $img.is(':focus')) {
          zoom(0.1);
        }
        else if ((keyCode === 109 || keyCode === 173 || keyCode === 189) && $img.is(':focus')) {
          zoom(-0.1);
        }
      });
      H5P.$body.on('keyup', function (event) {
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
       * Zoom in / out on the clip.
       *
       * @private
       * @param {number} delta
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
       * @param {Event} event
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

      /**
       * Makes sure the image covers the whole container.
       * Useful when changing the aspect ratio of the container.
       */
      self.fit = function () {
        var imageSize = {
          width: 'auto',
          height: 'auto',
          margin: content.offset.top + '% 0 0 ' + content.offset.left + '%'
        };

        // Reset size
        $img.css(imageSize);

        var containerSize = new Size($container.width(), $container.height());

        // Find ratios
        var imageRatio = ($img.width() / $img.height());
        var containerRatio = (containerSize.x / containerSize.y);

        // Set new size
        imageSize[imageRatio > containerRatio ? 'height' : 'width'] = (content.scale * 100) + '%';
        $img.css(imageSize);

        // Make sure image covers container
        var offset = new Offset(
          new Size(pxToNum($img.css('marginLeft')), pxToNum($img.css('marginTop'))),
          new Size(0, 0),
          new Size($img.width() - containerSize.x, $img.height() - containerSize.y)
        );
        $img.css(offset.getPx());
        content.offset = offset.getPs();
      };

      $img.on('focus', function () {
        $container.addClass('h5p-collage-focus');
      }).on('blur', function () {
        $container.removeClass('h5p-collage-focus');
      });
    };

    init();
  };


  // Extends the event dispatcher
  Collage.Clip.prototype = Object.create(EventDispatcher.prototype);
  Collage.Clip.prototype.constructor = Collage.Clip;

})(H5P.jQuery, H5P.Collage, H5P.EventDispatcher);
