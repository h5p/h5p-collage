/**
 * Extends H5P.Collage with a Template class.
 */
(function ($, EventDispatcher, Collage) {

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
  Collage.Template = function ($container, spacing, layout) {
    var self = this;

    // Initialize event inheritance
    EventDispatcher.call(self);

    // Create template wrapper
    var $wrapper = $('<div/>', {
      'class': 'h5p-collage-template'
    });

    // Half the spacing
    spacing /= 2;

    // Keep track of our rows
    var table = [];

    /**
     * Add columns to row.
     *
     * @private
     * @param {jQuery} $row
     * @param {Number} num
     */
    var addCols = function ($row, num) {
      var cols = [];

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

        self.trigger('columnAdded', $col);
        cols.push($col);
      }

      return cols;
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
        table.push({
          $row: $row,
          cols: addCols($row, Number(rows[i]))
        });
      }
    };

    /**
     * @public
     */
    self.setLayout = function (newLayout) {
      $wrapper.html('');
      addRows(newLayout.split('-'));
    };

    /**
     * @public
     */
    self.setSpacing = function (newSpacing) {
      spacing = newSpacing / 2;

      // Update table styling
      for (var i = 0; i < table.length; i++) {
        var row = table[i];
        row.$row.css({
          borderTopWidth: (i === 0 ? 0 : spacing + 'em'),
          borderBottomWidth: (i === table.length - 1 ? 0 : spacing + 'em')
        });

        for (var j = 0; j < row.cols.length; j++) {
          row.cols[j].css({
            borderLeftWidth: (j === 0 ? 0 : spacing + 'em'),
            borderRightWidth: (j === row.cols.length - 1 ? 0 : spacing + 'em')
          });
        }
      }
    };

    // Initialize right away if we have a layout
    if (layout) {
      self.setLayout(layout);
    }

    // Insert our wrapper into the given container
    $wrapper.appendTo($container);
  };

  // Extends the event dispatcher
  Collage.Template.prototype = Object.create(EventDispatcher.prototype);
  Collage.Template.prototype.constructor = Collage.Template;

})(H5P.jQuery, H5P.EventDispatcher, H5P.Collage);
