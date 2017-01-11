/**
 * SeedController
 *
 * @description :: Server-side logic for managing Seeds
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Promise = require('bluebird');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");

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
function addLink(link, category) {
  var json = {};
  json['title'] = link.titile;
  json['url'] = link.url;
  json['weight'] = link.weight;
  category.links.add(json);
  // Save the category, creating the new link and associations in the join table
  category.save(function (err) {
    if (err) {
      sails.log(err);
    }
  });
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

function processLink(link) {
  Category.findOne({category:link.category}).then(function (category){
    if (!category) {
      sails.log('Could not find '+link.category+', create new one.');
      Category.create({category:link.category}).then(function (created) {
        // Queue up a new category to be added and a record to be created in the join table
        addLink(link, created);
      })
    } else {
      // Queue up a new category to be added and a record to be created in the join table
      // sails.log(preference);
      addLink(link, category);
    }
  }) .catch(function (err) {
    sails.log(err);
  });
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
          sails.log("findOrCreateLink:          ");
          sails.log(findOrCreateLink);
          sails.log("/findOrCreateLink");
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
          sails.log('user:');
          sails.log(user);
          sails.log('-----------------user-----------------------');
          Preference.findOrCreate({owner:user.id,category:entry.category,name:entry.name,xposition:parseInt(entry.xposition, 10),yposition:parseInt(entry.yposition, 10),link:findOrCreateLink.id})
            .exec(function (err,preference) {
              if(err){
                throw err;
              }
             sails.log('newPreference:');
             sails.log(preference);
             // newPreference.links.add(findOrCreateLink);
             //  newPreference.save(function(err) {
             //    if (err) {
             //       throw err;
             //      }
             //    })
             //    user.preferences.add(newPreference);
             //    user.save(function (err) {
             //      if (err) {
             //        throw err;
             //      }
             //    })
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
        sails.log('no such catalog:'+catalog.name+'   skip');
      }
  })
}
function processPreferencese(entry,next) {
  sails.log("processPreferencese");
  User.findOrCreate({username:entry.user})
    .populate('preferences')
    .exec(function (err,user) {
      if(err){
        sails.log(err);
        return next();
      }
      try {
        sails.log("addPreference");
        addPreference(entry,user);
      } catch (err){
        sails.log(err);
        return next();
      }
      return next();
  })
}
function processCatalog(entry, next){
  Catalog.findOrCreate({name:entry.name})
    .exec(function createFindCB(err, catalog) {
      if(err){
        sails.log(err);
        return next();
      }
      try {
        addCategory(entry, catalog);
      } catch (err){
        sails.log(err);
        return next();
      }
      return next();
    })
}
function processDevice(entry, next){
  Device.findOne({deviceId:entry.deviceId})
    .exec(function (err, device) {
      if(err){
        sails.log(err);
        return next();
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

function processExcelData(file,iteratee) {
  sails.log("process file: "+file.filename);
  var exceltojson = getExcelToJson(file);
  // sails.log("exceltojson "+exceltojson.toString());
  exceltojson({
      input: file.fd,
      output: null, //since we don't need output.json
      lowerCaseHeaders: true
    }, function (err, result) {
      if (err) {
       throw err;
      }
      // res.json({error_code:0,err_desc:null, data: result});
      // var i = 0;
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
function getExcelToJson(file) {
  var fileName = file.filename;
  var filePath = file.fd;
  var exceltojson=null;
  if (fileName.split('.')[fileName.split('.').length - 1] === 'xlsx') {
    exceltojson = xlsxtojson;
  } else if (fileName.split('.')[fileName.split('.').length - 1] === 'xls') {
    exceltojson = xlstojson;
  } else {
    throw new Error("invalid file extension");
  }
  return exceltojson;
}
function processExcel(req, res,callback) {
  var uploadFile = req.file('uploadFile');
  uploadFile.upload({dirname: '../../assets/uploadFiles'}, function onUploadComplete(err, files) {
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
  // bios: function(req, res) {
  //   Author.find({})
  //     .then(function (authors) {
  //       sails.log("authors = ",authors);
  //       var bs = [];
  //       authors.forEach(function (author) {
  //         bs.push({
  //           name: author.fullName,
  //           bio: author.bio
  //         });
  //       });
  //       res.json(bs);
  //     })
  //     .catch(function (err) {
  //       sails.log(err);
  //       res.status(500)
  //         .json({ error: err });
  //     });
  // },

  // run: function(req, res) {
	// 	Author.create({
	// 		fullName: "Fred Flintstone",
	// 		bio: "Lives in Bedrock, blogs in cyberspace",
	// 		username: "fredf",
	// 		email: "fred@flintstone.com"
	// 	}).exec(function (err, author) {
	// 		Entry.create({
	// 			title: "Hello",
	// 			body: "Yabba dabba doo!",
	// 			author: author
	// 		}).exec(function (err, created) {
	// 			Entry.create({
	// 				title: "Quit",
	// 				body: "Mr Slate is a jerk",
	// 				author: author.id
	// 			}).exec(function (err, created) {
	// 				return res.send("Database seeded");
	// 			});
	// 		});
	// 	});
	// },

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
    processExcel(req, res,processCatalog);
  },
  importPreferencese: function(req,res){
    if (req.method === 'GET')
      return res.json({ 'status': 'GET not allowed' });
    processExcel(req, res,processPreferencese);
  }
};
