/**
 * SeedController
 *
 * @description :: Server-side logic for managing Seeds
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Promise = require('bluebird');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");

function processLink(link,next) {
  sails.log('entry:');
  sails.log(link);
  Category.findOne({category:link.category})
    .populate('links')
    .then(function (category){
    if (!category) {
      sails.log('Could not find '+link.category+', skip');
    } else {
      addLink(link, category);
    }
  }) .catch(function (err) {
    sails.log(err);
    throw err;
  })
  return next();
}

function addLink(link, category) {
  Link.findOrCreate({url:link.url,title:link.title,weight:link.weight})
    .populate('owners')
    .exec(function (err,linkEntry) {
      if(err){
        throw err;
      }
      else {
        async.series([
          function(callback) {
            if(link.imagepath) {
              var image=importImage(link.imagepath);
              Link.update(linkEntry.id,{image:image})
                .exec(function afterwards(err, updated){
                  if (err) {
                    callback(err, 'link.imagepath');
                  }
                  console.log('Updated Link to have image ' + updated[0].image);
                });
            }
            callback(null, 'link.imagepath');
          },
          function(callback) {
            if(link.classification) {
              console.log('find classification:'+ link.classification);
              Classification.findOrCreate({classification:link.classification})
                .then(function (classification) {
                  classification.sites.add(linkEntry.id);
                  classification.save(function (err) {
                    if (err) {
                      throw err;
                    }
                  });
                })
                .catch(function (err) {
                  callback(err,'link.classification');
                })
            }
            callback(null,'link.classification');
          },
          function(callback) {
            linkEntry.owners.add(category.id);
            linkEntry.save(function (err) {
              if (err) {
                callback(err,'linkEntry.owners.add');
              }
            });
            callback(null,'linkEntry.owners.add');
          }

        ]), function(err, results) {
          sails.log('don results!!!!!!!!!!!!!!!!!!');
          sails.log(results);
        };
      }
    })

}
function importImage(imagePath) {
  try {
  sails.log(imagePath);
  var fs = require('fs');
  var path = require('path');
  var dst = path.resolve(sails.config.appPath, 'assets/images',path.basename(imagePath));
  fs.writeFileSync(dst, fs.readFileSync(imagePath));
  } catch (err) {
    sails.log(err);
    throw err;
  }
  return  require('util').format('%s/%s','images', path.basename(imagePath))
}
// function isLinkExist(link,category){
//   link.owners.forEach(function(owner) {
//     sails.log("compare:")
//     sails.log(owner.category);
//     sails.log(category.category);
//     if (owner.category == category.category) {
//       sails.log(owner.category == category.category);
//       return true;
//     }
//   });
//   sails.log("hi");
//   return false;
// }

function isLinkExist(link,category){
  var mark = false;
  link.owners.forEach(function(owner)  {
    if (owner.category == category.category) {
      mark = true;
    }
  });
  return mark;
  // return link.owners.every(owner=>owner.category === category.category)
}

function processPreference(preference) {
  sails.log(preference);
  Category.findOne({category:preference.category}).then(function (category){
    if(category){
      Category.update(preference).exec(function afterwards(err, updated){
        if (err) {
         throw err;
        }
        sails.log('Updated Category to have name ' + updated[0].name);
      });
    } else {
      Category.create(preference).exec(function (err, created) {
        var i=0;
        if (err) {
          sails.log(preference);
          sails.log(err);
        } else {
          sails.log(created);
        }
      });
    }
  });

}


function addCategory(entry, catalog) {
  Category.findOrCreate({category:entry.category}).exec(function createFindCB(err, category) {
       if (err){
         throw err;
       }
        if (catalog.categories.indexOf(category) ===-1){
          sails.log(catalog.categories);
          sails.log(category);
          addToCatalog(catalog, category);
          }
  })
}
function addPreferenceLink(preference, link) {
  preference.links.add(link);
  preference.save(function (err) {
    if (err) {
      sails.log(err);
    }
  });
}

function addLinkToPreference(preference, entry) {
  Link.findOne({url:entry.url}).then(function (found) {
    if(found){
      if(preference.links.indexof(found)===-1){
        addPreferenceLink(preference,found);
      }
    } else {
      Link.create({url: entry.url}).then(function (link) {
        Category.findOne({category:entry.category}).then(function (category) {
          if(category) {
            if(category.links.indexof(category)===-1) {
              addLink(link, category);
            }
          } else {
            sails.log("no such category"+ entry.category);
          }
        }).then(addPreferenceLink(preference,link));
      })
    }
  })
}


function isPreferencExist(user,entry,link){
  user.preferences.forEach(function(preference) {
      if (preference.category === entry.category && preference.name === entry.name && preference.links.indexOf(link) != -1) {
        return true;
      }
    });
  return false;
}
function buildPreference(catalog,user,entry) {
    catalog.categories.forEach(function (category) {
    if (category.category == entry.category) {
      Link.findOrCreate({title: entry.title, url: entry.url})
        .exec (function (err,findOrCreateLink) {
           if(err){
              throw err;
           }
          Category.findOne({id:category.id})
            .populate('links')
            .exec( function (err,myCategory) {
              if(err) {
                throw err;
              }
              sails.log('category:');
              sails.log(myCategory);
              myCategory.links.add(findOrCreateLink);
              myCategory.save(function (err) {
                  if (err) {
                    throw err;
                  }
                })
              })
            Preference.findOrCreate({owner:user.id,category:entry.category,name:entry.name,xposition:parseInt(entry.xposition, 10),yposition:parseInt(entry.yposition, 10),link:findOrCreateLink.id})
            .exec(function (err,preference) {
              if(err){
                throw err;
              }
             sails.log('newPreference:');
             sails.log(preference)
             })
            })
      }})
}

function addPreference(entry, user) {
  sails.log(entry);
  Catalog.findOne({name:entry.name})
    .populate('categories')
    .exec(function (err, catalog){
      if(err){
        throw err;
      }
      if(catalog){
      buildPreference(catalog,user, entry);
      } else {
        sails.log('no such catalog:'+entry.name+'   skip');
      }
  })
}
function processPreferences(entry, next) {
  sails.log("processPreferences");
  User.findOrCreate({username:entry.user})
    .populate('preferences')
    .exec(function (err,user) {
      if(err){
        sails.log(err)
      }
      try {
        sails.log("addPreference");
        addPreference(entry,user);
      } catch (err){
        sails.log(err)
      }
      return next();
  })
}


function addUser(entry, device) {
  User.Create({username:entry.deviceId}).exec(function createFindCB(err, user) {
       if (err){
         throw err;
       }
        if (catalog.categories.indexOf(user) ===-1){
          sails.log(user);
          addToCatalog(catalog, user);
          }
  })
}
function addToCatalog(catalog, category) {
  catalog.categories.add(category);
  catalog.save(function (err) {
    if (err) {
      sails.log(err);
      throw err;
    }
  });
}

function processDevice(entry, next){
  Device.findOne({deviceId:entry.deviceId})
    .exec(function (err, device) {
      if(err){
        sails.log(err)
      }
      if(device){
        sails.log('device whith deviceId'+entry.diviceId+' already existed, skip')
      } else {
        User.create({username:entry.deviceId}).exec(function (err,user) {
          if(err){
            sails.log(err);
            throw err;
          }
          Device.create({deviceId:entry.deviceId}).exec(function (err,device) {
            user.devices.add(device);
            user.save(function (err) {
              if(err){
                sails.log(err);
                throw err;
              }
            })
          });
        })
      }
      return next();
    })
}

function getExcelToJson(fileName) {
  if (fileName.split('.')[fileName.split('.').length - 1] === 'xlsx') {
    return xlsxtojson;
  } else if (fileName.split('.')[fileName.split('.').length - 1] === 'xls') {
    return xlstojson;
  } else {
    throw new Error("invalid fileName extension");
  }
}

function processExcelData(file,iteratee) {
  sails.log("process file: "+file.filename);
  var exceltojson = getExcelToJson(file.filename);
  exceltojson({
      input: file.fd,
      output: null, //since we don't need output.json
      lowerCaseHeaders: true
    }, function (err, result) {
      if (err) {
       throw err;
      }
    if((iteratee && typeof(iteratee) === "function")){
      async.eachSeries(result, iteratee, function afterwards (err) {
        if (err) {
          sails.log('Import failed, error details:\n',err);
          throw err;
        }
        sails.log('all done!  Import finished successfully.');
      });
    } else {
        sails.log(iteratee);
        throw new Error("invalid iteratee function");
    };

   })
}

function processExcel(req, res,callback) {
  var uploadFile = req.file('uploadFile');
  var filename = uploadFile._files[0].stream.filename;
  uploadFile.upload({
    dirname: require('path').resolve(sails.config.appPath, 'assets/uploadFiles'),
    saveAs: filename, /* optional. default file name */
    maxBytes: 5 * 1024 * 1024 //5 MB
  }, function onUploadComplete(err, files) {
    var file = files[0];
    try {
      processExcelData(file,callback);
      return res.json({result: "Data seeded"});
    }
    catch (ex) {
      return res.json({error_code: 1, err_desc: ex.toString()});
    }
  });
}
function process(req, res) {
  var uploadFile = req.file('uploadFile');
  var filename = uploadFile._files[0].stream.filename;
  uploadFile.upload({
    dirname: require('path').resolve(sails.config.appPath, 'assets/uploadFiles'),
    saveAs: filename, /* optional. default file name */
    maxBytes: 5 * 1024 * 1024 //5 MB
  }, function onUploadComplete(err, files) {
    var file = files[0];
    try {
      processExcelData(file,callback);
      return res.json({result: "Data seeded"});
    }
    catch (ex) {
      return res.json({error_code: 1, err_desc: ex.toString()});
    }
  });
}
function processUserPreference(userPreference) {
  Category.findOne({category: userPreference.preference}).then(function (category) {
    sails.log(userPreference);
    if (!category) {
      sails.log('Could not find' + userPreference.preference + ', skip.');
    } else {
      User.findOne({email: userPreference.email}).then(function (user) {
        if (user) {
          // Queue up a new category to be added and a record to be created in the join table
          user.preferences.add([category.id]);
          // Save the user, creating the new userPreference and associations in the join table
          user.save(function (err) {
            sails.log(err);
            sails.log.info('category already exists!');
          });
        } else {
          sails.log('Could not find user with email: ' + userPreference.email + ', skip.');
        }
      });
    }
  })
}
module.exports = {
  processCatalog : function(entry, next){
  sails.log('processing entry:');
  sails.log(entry);
  Catalog.findOrCreate({name:entry.name})
    .exec(function createFindCB(err, catalog) {
      if(err){
        sails.log(err)
      }
      try {
        addCategory(entry, catalog);
      } catch (err){
        sails.log(err)
      }
      return next();
    })
},

  preferences: function(req, res) {
    User.find({})
      .populate('preferences')
      .then(function (users) {
        var bs = [];
        users.forEach(function (user) {
          bs.push({
            email: user.email,
            category: user.preferences,
            uid:user._id
          });
        });
        res.json(bs);
      })
      .catch(function (err) {
        sails.log(err);
        res.status(500)
          .json({ error: err });
      });
  },


  importPreferenceseFromExcelToDb: function(req,res){
        if (req.method === 'GET')
            return res.json({ 'status': 'GET not allowed' });
        processExcel(req, res,processPreference);
	},

  importUserPreferenceseFromExcelToDb: function(req,res){
      if (req.method === 'GET')
        return res.json({ 'status': 'GET not allowed' });
      //	Call to /upload via GET is error
       processExcel(req, res,processUserPreference);
    },

  importLinksFromExcelToDb: function(req,res){
    if (req.method === 'GET')
      return res.json({ 'status': 'GET not allowed' });
    processExcel(req, res,processLink);
  },
  importDeviceFromexcel: function(req,res){
    if (req.method === 'GET')
      return res.json({ 'status': 'GET not allowed' });
    processExcel(req, res,processDevice);
  },
  importCatalogFromexcel: function(req,res){
    if (req.method === 'GET')
      return res.json({ 'status': 'GET not allowed' });
    processExcel(req, res,sails.controllers.seed.processCatalog);
  },
  importPreferencese: function(req,res){
    if (req.method === 'GET')
      return res.json({ 'status': 'GET not allowed' });
    processExcel(req, res,processPreferences);
  }
};
