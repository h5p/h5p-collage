/**
 * Extends H5P.Collage with a Template class.
 */
(function (Collage, $) {

  /**
   * Clip
   *
   * @class
   * @namespace H5P.Collage
   */
  Collage.Template = function () {
    console.log('Hello Template!', arguments);
  };

})(H5P.Collage, H5P.jQuery);
