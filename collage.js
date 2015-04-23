/**
 * Defines the H5P.Collage class
 */
H5P.Collage = (function ($, EventDispatcher) {

  /**
   * Create a new collage.
   *
   * @class
   * @namespace H5P
   * @param {Object} parameters
   * @param {Number} contentId
   */
  function Collage(parameters, contentId) {
    var self = this;

    // Initialize event inheritance
    EventDispatcher.call(self);

    // Content shorthand
    var content = parameters.collage;

    // Create collage wrapper
    var $wrapper = $('<div/>');

    // TODO: Print error if parameters are missing

    // Create new template for adding clips to
    var template = new Collage.Template($wrapper, content.options.spacing);

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
     * Attach the collage to the given container.
     *
     * @public
     * @param {jQuery} $container
     */
    self.attach = function ($container) {
      // Render template
      self.setLayout(content.template);

      // Add to DOM
      $container.addClass('h5p-collage').html('').append($wrapper);
    };

    /**
     * @public
     */
    self.setLayout = function (newLayout) {
      clipInstances = [];
      template.setLayout(newLayout);
    };

    /**
     * @public
     */
    self.setSpacing = function (newSpacing) {
      template.setSpacing(newSpacing);
    };

    /**
     * Handle resize events
     */
    self.on('resize', function () {
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

  return Collage;
})(H5P.jQuery, H5P.EventDispatcher);
