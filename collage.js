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
   * @param {Number} id
   */
  function Collage(parameters, id) {
    // Initialize event inheritance
    EventDispatcher.call(self);

    // Create collage wrapper
    var $wrapper = $('<div/>', {
      text: 'Hello Collage!'
    });

    /**
     * Attach the collage to the given container.
     *
     * @public
     * @param {jQuery} $container
     */
    this.attach = function ($container) {
      $container.addClass('h5p-collage').html('').append($wrapper);
    };

    /**
     * @public
     */
    this.resize = function () {
      // var width = $collage.width();
      // $collage.css({
      //   fontSize: ((width / 900) * 16) + 'px',
      //   height: (parameters.collage.heightRatio * width) + 'px'
      // });
    };

    /**
     * @private
     */
    var init = function () {
      console.log(parameters);

    };

    init();
  }

  // Extends the event dispatcher
  Collage.prototype = Object.create(EventDispatcher.prototype);
  Collage.prototype.constructor = Collage;

  return Collage;
})(H5P.jQuery, H5P.EventDispatcher);
