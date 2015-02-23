/**
 * Extends H5P.Collage with a Clip class.
 */
(function (Collage, $) {

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

    // Create new instance
    H5P.newRunnable(content.type, contentId, $container, true);

    // Find image element
    var $img = $container.find('img');

    /**
     * Handle image loaded.
     */
    $img.one('load', function (event) {
      // Find ratios
      var imageRatio = (this.width / this.height);
      var containerRatio = ($container.width() / $container.height());

      // Make sure image covers the whole container
      if (imageRatio > containerRatio) {
        $img.css('height', (content.scale * 100) + '%');
      }
      else {
        $img.css('width', (content.scale * 100) + '%');
      }

      // Offset image
      $img.css('margin', -content.offset.top + '% 0 0 ' + -content.offset.left + '%');
    });

    /**
     * Not used.
     *
     * @public
     */
    self.fit = function () {

    };
  };

})(H5P.Collage, H5P.jQuery);
