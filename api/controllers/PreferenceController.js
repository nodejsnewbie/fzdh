/**
 * PreferenceController
 *
 * @description :: Server-side logic for managing Preferences
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var _ = require('lodash');
var Promise = require('bluebird');
var path = require('path');
function getLinks(preference) {
  return Preference.findOne(preference.id)
    .populate('link')
    .populate('owner')
    .then(function (preference) {
      var result = preference;
      delete result.link.createdAt;
      delete result.link.updatedAt;
      delete result.link.preferences;
      delete result.link.owners;
      delete result.link.weight;
      delete result.createdAt;
      delete result.updatedAt;
      delete result.owner.passports;
      delete result.owner.preferences;
      delete result.owner.devices;
      delete result.owner.username;
      delete result.owner.createdAt;
      delete result.owner.updatedAt;
      return result;
    })
}
function mapPreferences(user){
  if (user) {
    if (user.preferences) {
      return [user, Promise.map(user.preferences, getLinks)];
    } else {
      return [user, Promise.map([], getLinks)];
    }
  } else {
    return [null,null];
  }
}
module.exports = {
  preference: function (req, res){   //根据用户id获取其偏好
    var id=req.param("userId");
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
  getPreference: function (req, res) {
    var userId=req.param("userId");
    sails.log('getPreference');
    // return res.json({result:userId});
    User.findOne(userId)
      .populate('preferences')
      .then( function(user){
         user.preferences.forEach(function (preference) {
           var preferencese = Preference.find({
             "user": user.id
           })
             .populate('link')
             .then(function (preferencese){
               return preferencese;
             });
           return [user, preferencese];
         })
        })
      .spread(function(user, preferences){
        user.preferences = preferences;
        return res.json(user);
      });
  },
  preferenceList:function (req, res){  //根据目录id获取分类列表
    var userId=req.param("userId");
    sails.log('preferencList');
    User.findOne({username:userId})
      .populate('preferences')
      .exec(function (err,user) {
        if(err) {
          sails.log(err);
          throw err;
        }
        if(user){
          user.preferences.map(function (preference) {
            Preference.findone(preference.id)
              .populate('link')
              .exec(function (err,preference) {
                if(err){
                  sails.log(err);
                  throw err;
                }

              });
          })
          return  res.json(user.preferences);
        } else {
          return  res.json({ status : -1,
            msg: 'someting went wrong' });
        }
      })
  },
  test: function (req,res) {
    sails.log('test');
    var userId=req.param("userId");
    User.findOne({username:userId})
      .populateAll()
      .then(function (user){
         var preferencese= Preference.find({
          "user": user.id
        })
          .populate('link')
          .then(function (preferencese){
            sails.log(preferencese);
            return preferencese;
          });
        return [user, preferencese];
      })
      .spread(function (user, preferencese){
        // user.preferencese = preferencese; // This won't work....
        res.json(user);
      }).catch(function (err){
      if (err) return res.serverError(err);
    });
  },
  getUserPreferences: function(req,res) {
    sails.log('getUserPreferences');
    var userName=req.param("userName");
    User.findOne({username:userName})
      .populate('preferences')
      .then(mapPreferences)
      .spread(function(user, preferences){
        if(user) {
        var result=user;
        result.preferences = preferences;
        result.success=true;
        delete result.username;
        delete result.email;
        delete result.createdAt;
        delete result.updatedAt;
        return  res.json(result);
        } else {
          return   res.json({ success: false, message: 'user not found' });
        }
      })
      .fail(function(err) {
        sails.log(err);
        res.json({ success: false, message: err });
      })
  },
  getDevicePreferences: function(req,res){
    sails.log('getDevicePreferences');
    var deviceId=req.param("deviceId");
    Device.findOne({deviceId:deviceId})
      .populate('owner')
      .exec(function (err,device) {
        if(err){
          sails.log(err);
          throw err;
        }
        if(device){
          sails.log(device);
          var user=device.owner;
          sails.log(user);
          return getPreference(user.username);
        } else {
          User.create({username:deviceId})
          .exec(function (err,user) {
            if(err){
              sails.log(err);
              throw err;
            }

            Device.create({deviceId:deviceId})
              .exec(function (err,device) {
              if(err) {
                 sails.log(err);
                 throw err;
              }
              user.devices.add(device);
              user.save(function (err) {
                if(err){
                  sails.log(err);
                  throw err;
                }
                var filename=path.join(path.dirname(__filename) ,'..','..','assets','uploadFiles','preference.xlsx');
                // path.normalize('/home/george/../folder/code');
                ExcelService.initDefaultPreference(deviceId,filename);
                return getPreference('admin');
              })
          })
        })
      }

    })
    // var getLink = function(preference) {
    //   return Preference.findOne(preference.id).populate('link')
    //     .then(function (preference) {
    //     var result = preference;
    //     delete result.link.createdAt;
    //     delete result.link.updatedAt;
    //     delete result.link.preferences;
    //     delete result.link.owners;
    //     delete result.link.weight;
    //     delete result.createdAt;
    //     delete result.updatedAt;
    //     delete result.owner;
    //     return result;
    //   });
    // };

     function getPreference(username) {
      return User.findOne({username:username})
        .populate('preferences')
        .then(mapPreferences)
        .spread(function (user, preferences) {
          if(user){
          var result = user;
          result.success=true;
          result.preferences = preferences;
          delete result.username;
          delete result.email;
          delete result.createdAt;
          delete result.updatedAt;
          return res.json(result);
          }
          else {
            return   res.json({ success: false, message: 'user not found' });
          }
        })
        .fail(function(err) {
          sails.log(err);
          res.json({ success: false, message: err });
        })
    }
    function getUserPreferencesByCategory() {
      sails.log('getUserPreferencesByCategory');
      var userName=req.param("userName");
      var category=req.param("category");
      var getLinks = function(preference) {
        return Preference.findOne(preference.id)
          .populate('link')
          .then(function (preference) {
            var result = preference;
            delete result.link.createdAt;
            delete result.link.updatedAt;
            delete result.link.preferences;
            delete result.link.owners;
            delete result.link.weight;
            delete result.createdAt;
            delete result.updatedAt;
            delete result.owner;
            return result;
          });
      };
      var mapPreferences = function(user){
        if (user && user.preferences) {
          return [user, Promise.map(user.preferences, getLinks)];
        } else {
          return [user,Promise.map([], getLinks)]
        }
      };
      return User.findOne({username:userName})
        .populate('preferences')
        .then(mapPreferences)
        .spread(function(user, preferences){
          var result=user;
          result.preferences = preferences;
          delete result.username;
          delete result.email;
          delete result.createdAt;
          delete result.updatedAt;
          return  res.json(result);
        });
    }
  }

};


