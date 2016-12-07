/**
 * CategoryController
 *
 * @description :: Server-side logic for managing Preferences
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  preference: function (req, res){
    var id=req.param("id");
    User.findOne(id)
      .populate('preferences')
      .then(function (user) {
        return  res.json(user.preferences);
      })
      .catch(function (err) {
        console.log(err);
        return  res.json({ status : -1,
          error: err });
      });
  },
  categoryList:function (req, res){
    var id=req.param("id");
    Category.findOne(id)
      .populate('links')
      .then(function (category) {
        return  res.json(category.links);
      })
      .catch(function (err) {
        console.log(err);
        return  res.json({ status : -1,
          error: err });
      });
  }
};


