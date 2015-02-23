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

    /**
     * Attach the collage to the given container.
     *
     * @public
     * @param {jQuery} $container
     */
    this.attach = function ($container) {
      // Set template
      var template = new Collage.Template($wrapper, content.template, content.clips, contentId, content.options.spacing, self);

      $container.addClass('h5p-collage').html('').append($wrapper);
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

      //template.fit();
    });
  }

  // Extends the event dispatcher
  Collage.prototype = Object.create(EventDispatcher.prototype);
  Collage.prototype.constructor = Collage;

  return Collage;
})(H5P.jQuery, H5P.EventDispatcher);
