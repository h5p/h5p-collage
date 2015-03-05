/**
 * Extends H5P.Collage with a Template class.
 */
(function (Collage, $) {

  /**
   * Collage Template
   *
   * @class
   * @namespace H5P.Collage
   * @param {jQuery} $container
   * @param {String} type
   * @param {Array} clips
   * @param {Number} contentId
   * @param {Number} spacing
   */
  Collage.Template = function ($container, type, clips, contentId, spacing, collage) {
    var self = this;

    // Create template wrapper
    var $wrapper = $('<div/>', {
      'class': 'h5p-collage-template'
    });

    // Keep track of collage clips
    var currentClipIndex = 0;
    var clipInstances = [];

    // Half the spacing
    spacing /= 2;

    /**
     * Not used.
     *
     * @public
     */
    self.fit = function () {
      for (var i = 0; i < clipInstances.length; i++) {
        clipInstances[i].fit();
      }
    };

    /**
     * Add columns to row.
     *
     * @private
     * @param {jQuery} $row
     * @param {Number} num
     */
    var addCols = function ($row, num) {
      for (var i = 0; i < num; i++) {
        // Add column to row
        var $col = $('<div/>', {
          'class': 'h5p-collage-col',
          css: {
            width: (100 / num) + '%',
            borderLeftWidth: (i === 0 ? 0 : spacing + 'em'),
            borderRightWidth: (i === num - 1 ? 0 : spacing + 'em')
          },
          appendTo: $row
        });

        // Add clip to column
        if (!clips[currentClipIndex]) {
          clips[currentClipIndex] = {}; // Add default
        }
        var clip = new Collage.Clip($col, clips[currentClipIndex], contentId);
        clipInstances.push(clip);
        currentClipIndex++;

        collage.trigger('clipAdded', clip);
      }
    };

    /**
     * Add rows to wrapper.
     *
     * @private
     * @param {Array} rows
     */
    var addRows = function (rows) {
      for (var i = 0; i < rows.length; i++) {
        // Add row to wrapper
        var $row = $('<div/>', {
          'class': 'h5p-collage-row',
          css: {
            height: (100 / rows.length) + '%',
            borderTopWidth: (i === 0 ? 0 : spacing + 'em'),
            borderBottomWidth: (i === rows.length - 1 ? 0 : spacing + 'em')
          },
          appendTo: $wrapper
        });

        // Add row columns
        addCols($row, Number(rows[i]));
      }
    };

    // Initialize
    addRows(type.split('-'));
    $wrapper.appendTo($container);
  };

})(H5P.Collage, H5P.jQuery);
