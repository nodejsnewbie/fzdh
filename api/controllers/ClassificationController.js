/**
 * ClassificationController
 *
 * @description :: Server-side logic for managing Classifications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  getClassifications: function (req, res) {
    sails.log('getClassifications');
    return Classification.find({})
      .populate('sites')
      .then(function (classifications) {
        var result = classifications;
        result.forEach(function (classification) {
          delete classification.createdAt;
          delete classification.updatedAt;
          classification.sites.forEach(function (site) {
            delete site.createdAt;
            delete site.updatedAt;
            delete site.id;
            delete site.weight;
          })
        })
        return res.json(result);
      })
      .fail(function (err) {
        sails.log(err);
        res.json({success: false, message: err.message});
      })
  }
};

