/**
 * CategoryController
 *
 * @description :: Server-side logic for managing Preferences
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  catalogList:function (req, res){  //根据目录id获取分类列表
    var id=req.param("id");
    Catalog.findOne(id)
      .populate('categories')
      .then(function (catalog) {
        if(catalog){
          return  res.json(catalog.categories);
        } else {
          return  res.json({ status : -1,
            msg: 'no such catalog' });
        }
      })
      .catch(function (err) {
        console.log(err);
        return  res.json({ status : -1,
          error: err });
      });
  },
  catalogs:function (req, res){   //获取所有目录名
    Catalog.find({})
      .then(function (catalogs) {
        var result = [];
        catalogs.forEach(function (catalog) {
          console.log("catalogs = ",catalogs);
          result.push({
            title: catalog.name,
            id:catalog.id
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
  },
  clearCatalog: function (req,res) {
    Catalog.destroy({}).exec(function (err){
      if (err) {
        return res.negotiate(err);
      }
      sails.log('Catalog is empty.');
      return res.json('Catalog 已经清空');
    });
  }
};


