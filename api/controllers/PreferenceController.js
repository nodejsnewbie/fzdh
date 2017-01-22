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
  preference: function (req, res) {   //根据用户id获取其偏好
    var id = req.param("userId");
    User.findOne(id)
      .populate('preferences')
      .then(function (user) {
        return res.json(user.preferences);
      })
      .catch(function (err) {
        console.log(err);
        return res.json({
          status: -1,
          error: err
        });
      });
  },
  addDefaultCategoryPreferences: function (req, res) {
    var category = req.param("category");
    sails.log('addDefaultCategoryPreferences');
    var userid = req.param("userId");
    sails.log(userid);
    User.findOne({username: 'admin'})
      .then(function (user) {
        //If no user found
        if (user === undefined)
          return res.json({notFound: true});
        // Store Preference Data
        var preferenceData = Preference.find({owner: user.id})
          .populate('link')
          .then(function (preferences) {
            var result = [];
            preferences.forEach(function (preference) {
              if (preference.category == category) {
                var newEntry = preference;
                result.push(newEntry);
              }
            })
            sails.log(result);
            return result;
          })
        return [preferenceData];
      })
      .spread(function (preferenceData) {
          User.findOne({username:userid})
            .exec(function (err, user) {
            if(err) {
              sails.log(err);
              return res.json({success:false,err:err});
            }
            if(user===undefined) {
              return res.json({success:false,err:'user not found'});
            }
            sails.log(user);
            preferenceData.forEach(function (preference) {
              var link= preference.link;
              delete preference.owner;
              delete preference.link;
              delete preference.id;
              delete preference.createdAt;
              delete preference.updatedAt;
              sails.log(preference);
              Preference.create(preference)
                .exec(function(err,entry){
                  if(err) {
                    sails.log(err);
                    // return res.json({success:false,err:err});
                  } else{
                  user.preferences.add(entry);
                  link.preferences.add(entry);
                  link.save(function (err) {
                      if(err) {
                        sails.log(err);
                        return res.json({success:false,err:err});
                      }
                    })
                    user.save(function (err) {
                      if(err) {
                        sails.log(err);
                        return res.json({success:false,err:err});
                      }
                    })
                  }
                })
            })
              return res.json({created: true, data: preferenceData});
        })
      })
      .fail(function (err) {
        console.log(err);
        res.json({notFound: true, error: err});
      });
  },
  test: function (req, res) {
    sails.log('modifyPreferences');
    var catalog = req.param("catalog");
    sails.log(catalog);
    var userName = req.param("userName");
    sails.log(userName);
    // User.findOne({username: 'admin'})
    //   .then(function (user) {
    //     //If no user found
    //     if (user === undefined)
    //       return res.json({notFound: true});
    //     // Store Preference Data
    //     var preferenceData = Preference.find({owner: user.id})
    //       .populate('link')
    //       .then(function (preferences) {
    //         var result = [];
    //         preferences.forEach(function (preference) {
    //           if (preference.category == category) {
    //             var newEntry = preference;
    //             result.push(newEntry);
    //           }
    //         })
    //         sails.log(result);
    //         return result;
    //       })
    //     return [preferenceData];
    //   })
    //   .spread(function (preferenceData) {
    //       User.findOne({username:userid})
    //         .exec(function (err, user) {
    //         if(err) {
    //           sails.log(err);
    //           return res.json({success:false,err:err});
    //         }
    //         if(user===undefined) {
    //           return res.json({success:false,err:'user not found'});
    //         }
    //         sails.log(user);
    //         preferenceData.forEach(function (preference) {
    //           var link= preference.link;
    //           delete preference.owner;
    //           delete preference.link;
    //           delete preference.id;
    //           delete preference.createdAt;
    //           delete preference.updatedAt;
    //           sails.log(preference);
    //           Preference.create(preference)
    //             .exec(function(err,entry){
    //               if(err) {
    //                 sails.log(err);
    //                 // return res.json({success:false,err:err});
    //               } else{
    //               user.preferences.add(entry);
    //               link.preferences.add(entry);
    //               link.save(function (err) {
    //                   if(err) {
    //                     sails.log(err);
    //                     return res.json({success:false,err:err});
    //                   }
    //                 })
    //                 user.save(function (err) {
    //                   if(err) {
    //                     sails.log(err);
    //                     return res.json({success:false,err:err});
    //                   }
    //                 })
    //               }
    //             })
    //         })
    //           return res.json({created: true, data: preferenceData});
    //     })
    //   })
    //   .fail(function (err) {
    //     console.log(err);
    //     res.json({notFound: true, error: err});
    //   });
    return res.json({result:'looks good'});
  },

  getDefaultCategoryPreferences: function (req, res) {
    var category = req.param("category");
    sails.log(category);
    User.findOne({username: 'admin'})
      .then(function (user) {
        //If no user found
        if (user === undefined)
          return res.json({notFound: true});
        // Store Preference Data
        var preferenceData = Preference.find({owner: user.id})
          .populate('link')
          .then(function (preferences) {
            var result = [];
            preferences.forEach(function (preference) {
              if (preference.category == category) {
                var newEntry = preference;
                result.push(newEntry);
              }
            })
            sails.log(result);
            return result;
          })
        return [preferenceData]
      })
      .spread(function (preferenceData) {
        return res.json({success: true, data: preferenceData});
      })
      .fail(function (err) {
        console.log(err);
        res.json({success: false, error: err});
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
           var preferences = Preference.find({
             "user": user.id
           })
             .populate('link')
             .then(function (preferences){
               return preferences;
             });
           return [user, preferences];
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
  modifyCatalogPreferences: function (req,res) {
    sails.log('modifyCatalogPreferences');
    var catalog=req.param('catalog');
    // sails.log(catalog);
    var userName=req.param('userName');
    // sails.log(userName);
    var from =req.param("origin");
    // sails.log(from);
    var to =req.param("des");
    // sails.log(to);
    var toValue = parseInt(to,10);
    var fromValue = parseInt(from,10);
    var increase=toValue-fromValue;
    if(increase==0) {
      return res.json({success:false,msg:'no modification'})
    }
    var direction=increase > 0? 1: -1;
    User.findOne({username:userName})
      .populate('preferences')
      .then(function (user){
        if(user===undefined) {
          return  res.json({err:'user is not exist'});
        }
        var preferenceData=[];
        user.preferences.forEach(function (preference) {
          var originPosition = parseInt(preference.yposition, 10);
          if(preference.name == catalog) {
             sails.log(increase);
             sails.log(fromValue);
             sails.log(originPosition);
             sails.log(toValue);
             sails.log(direction);
             if (originPosition == fromValue) {
                  preference.yposition = toValue;
                  preferenceData.push(preference);
                  sails.log('preference goto des');
                  sails.log(preference);
                } else if (increase * direction >= (originPosition - fromValue) * direction) {
                  preference.yposition = originPosition - direction;
                  sails.log('preference goto new position');
                  sails.log(preference);
                  preferenceData.push(preference);
                }
                else {
                  sails.log("stay unmodified");
                  sails.log(preference);
                }
              }
        // sails.log( user.preferences);
        // return  user.preferences;
        })
        return [preferenceData];
      })
      .spread(function (preferenceData){
        preferenceData.forEach(function (preference) {
          Preference.findOne(preference.id)
            .then(function (found) {
            found.yposition=preference.yposition;
            found.save(function (err) {
              if (err) {
                sails.log(err);
                return res.json({success: false, err: err});
              }
            })
          })
        })
        res.json(preferenceData);
      }).catch(function (err){
        if (err) return res.serverError(err);
      })
  },
  modifyCategoryPreferences: function (req, res) {
    sails.log('modifyCategoryPreferences');
    var columNumber=4;
    var category=req.param('category');
    // sails.log(category);
    var userName=req.param('userName');
    // sails.log(userName);
    var x_from =req.param("x_origin");
    var y_from =req.param("y_origin");
    // sails.log(from);
    var x_to =req.param("x_des");
    var y_to =req.param("y_des");
    // sails.log(to);
    var x_fromValue = parseInt(x_from,10);
    var y_fromValue = parseInt(y_from,10);
    var x_toValue = parseInt(x_to,10);
    var y_toValue = parseInt(y_to,10);
    var increase=y_toValue*(columNumber)+x_toValue-y_fromValue*(columNumber)+x_fromValue;
    if(increase==0) {
      return res.json({success:false,msg:'no modification'})
    }
    var direction=increase > 0? 1: -1;
    User.findOne({username:userName})
      .populate('preferences')
      .then(function (user){
        if(user===undefined) {
          return  res.json({err:'user is not exist'});
        }
        var preferenceData=[];
        user.preferences.forEach(function (preference) {
          var x_originPosition = parseInt(preference.xposition, 10);
          var y_originPosition = parseInt(preference.yposition, 10);
          var originPosition=y_originPosition*columNumber+x_originPosition;
          var fromValue=y_fromValue*columNumber+x_fromValue;
          if(preference.category == category) {
             sails.log(increase);
             sails.log(x_fromValue);
             sails.log(y_fromValue);
            sails.log(originPosition);
             sails.log(x_toValue);
             sails.log(y_toValue);
             sails.log(direction);
             sails.log(preference);
             if (originPosition == fromValue) {
               preference.yposition = y_toValue;
               preference.xposition = x_toValue;
               preferenceData.push(preference);
               sails.log('preference goto des');
               sails.log(preference);
             } else if (increase * direction >= (originPosition - fromValue) * direction) {
               preference.xposition = x_originPosition - direction ;
               if(preference.xposition<0) {
                 preference.xposition=columNumber-1;
                 preference.yposition = y_originPosition - 1;
               } else if(preference.xposition>columNumber-1) {
                 preference.xposition=0;
                 preference.yposition = y_originPosition + 1;
               }
               sails.log('preference goto new position');
               sails.log(preference);
               preferenceData.push(preference);
             }
             else {
               sails.log("stay unmodified");
               sails.log(preference);
             }
          }
        // sails.log( user.preferences);
        // return  user.preferences;
        })
        return [preferenceData];
      })
      .spread(function (preferenceData){
        preferenceData.forEach(function (preference) {
          Preference.findOne(preference.id)
            .then(function (found) {
            found.yposition=preference.yposition;
            found.xposition=preference.xposition;
            found.save(function (err) {
              if (err) {
                sails.log(err);
                return res.json({success: false, err: err});
              }
            })
          })
        })
        res.json(preferenceData);
      }).catch(function (err){
        if (err) return res.serverError(err);
      })
  },

  getDefaultPreferencesByCategory: function (req, res){   //据用户id获取其偏好
    var id=req.param("categoryId");
    User.findOne({id:id})
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


