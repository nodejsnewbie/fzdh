/**
 * CategoryController
 *
 * @description :: Server-side logic for managing Preferences
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  preference: function (req, res){   //根据用户id获取其偏好
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
  categoryList:function (req, res){  //根据分类id获取分类列表
    var id=req.param("id");
    Category.findOne(id)
      .populate('links')
      .then(function (category) {
        if(category){
          return  res.json(category.links);
        } else {
          return  res.json({ status : -1,
            msg: 'no such category' });
        }

      })
      .catch(function (err) {
        console.log(err);
        return  res.json({ status : -1,
          error: err });
      });
  },
  categories:function (req, res){   //获取所有分类
    Category.find({})
      .then(function (categories) {
        var result = [];
        categories.forEach(function (category) {
          console.log("categories = ",categories);
          result.push({
            title: category.category,
            id:category.id
          });

        });
       return res.json(result);
      })
      .catch(function (err) {
            console.log(err);
            return res.json({
              status: -1,
              error: err
            });
      });
  }
};


