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
  },
  globalSettings: function (req, res) {   //根据用户id获取配置
    return res.json(sails.config.serviceConfig);
  },
  users: function(req, res) {
    User.find({})
      .then(function (users) {
        var bs = [];
        users.forEach(function (user) {
          bs.push(user);
        });
        res.json(bs);
      })
      .catch(function (err) {
        console.log(err);
        res.status(500)
          .json({ error: err });
      });
  },
};

