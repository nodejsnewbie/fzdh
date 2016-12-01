/**
 * SystemController
 *
 * @description :: Server-side logic for managing Systems
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  /**
   * `SystemController.version()`
   */
  version: function (req, res) {
    return res.json({
      version: '0.1'
    });
  }
};

