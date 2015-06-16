H5P.Collage = (function ($, EventDispatcher) {

  /**
   * Create a new collage.
   *
   * @class H5P.Collage
   * @extends H5P.EventDispatcher
   * @param {Object} parameters
   * @param {number} contentId
   */
  function Collage(parameters, contentId) {
    var self = this;

    // Initialize event inheritance
    EventDispatcher.call(self);

    // Content defaults
    setDefaults(parameters, {
      collage: {
        template: '2-1',
        options: {
          heightRatio: 0.75,
          spacing: 0.5,
          frame: true
        },
        clips: []
      }
    });
    var content = parameters.collage;
    var $wrapper;

    // Create new template for adding clips to
    var template = new Collage.Template(content.options.spacing);

    // Keep track of collage clips
    var clipInstances;

    // Add clips to columns
    template.on('columnAdded', function (event) {
      var $col = event.data;
      var clipIndex = clipInstances.length;

      // Set default
      if (!content.clips[clipIndex]) {
        content.clips[clipIndex] = {};
      }

      // Add new clip
      var clip = new Collage.Clip($col, content.clips[clipIndex], contentId);
      clipInstances.push(clip);

      self.trigger('clipAdded', clip);
    });

    /**
     * Creates the HTML the first time the collage is attaced.
     *
     * @private
     */
    var createHtml = function () {
      // Create collage wrapper
      var wrapperOptions = {
        'class': 'h5p-collage-wrapper',
        css: {}
      };
      if (content.options.frame) {
        wrapperOptions.css.borderWidth = content.options.spacing + 'em';
      }
      $wrapper = $('<div/>', wrapperOptions);

      // Add template
      template.appendTo($wrapper);

      // Render template
      self.setLayout(content.template);
    };

    /**
     * Make sure all the clips cover their containers.
     *
     * @private
     */
    var fitClips = function () {
      for (var i = 0; i < clipInstances.length; i++) {
        clipInstances[i].fit();
      }
    };

    /**
     * Attach the collage to the given container.
     *
     * @param {H5P.jQuery} $container
     */
    self.attach = function ($container) {
      if ($wrapper === undefined) {
        createHtml();
      }

      // Add to DOM
      $container.addClass('h5p-collage').html('').append($wrapper);
    };

    /**
     * Set a new collage layout.
     *
     * @param {string} newLayout
     */
    self.setLayout = function (newLayout) {
      clipInstances = [];
      template.setLayout(newLayout);
    };

    /**
     * Set the spacing between the collage clips.
     *
     * @param {number} newSpacing
     */
    self.setSpacing = function (newSpacing) {
      template.setSpacing(newSpacing);
      fitClips();
    };

    /**
     * Set the frame around the collage.
     *
     * @param {number} newFrameWidth
     */
    self.setFrame = function (newFrameWidth) {
      $wrapper.css('borderWidth', newFrameWidth + 'em');
      fitClips();
    };

    /**
     * Set the height / aspect ratio of the collage.
     *
     * @param {number} newHeight
     */
    self.setHeight = function (newHeight) {
      // Update template
      $wrapper.css('height', ($wrapper.width() * newHeight) + 'px');
      fitClips();
    };

    /**
     * Handle resize events
     */
    self.on('resize', function () {
      if ($wrapper === undefined) {
        return;
      }

      var width = $wrapper.width();
      $wrapper.css({
        fontSize: ((width / 480) * 16) + 'px',
        height: (content.options.heightRatio * width) + 'px'
      });
    });
  }

  // Extends the event dispatcher
  Collage.prototype = Object.create(EventDispatcher.prototype);
  Collage.prototype.constructor = Collage;

  /**
   * Simple recusive function the helps set default values without
   * destroying object references.
   *
   * @param {object} params values
   * @param {object} values default values
   */
  var setDefaults = function (params, values) {
    for (var prop in values) {
      if (values.hasOwnProperty(prop)) {
        if (params[prop] === undefined) {
          params[prop] = values[prop];
        }
        else if (params[prop] instanceof Object && !(params[prop] instanceof Array)) {
          setDefaults(params[prop], values[prop]);
        }
      }
    }
  };

  return Collage;
})(H5P.jQuery, H5P.EventDispatcher);
