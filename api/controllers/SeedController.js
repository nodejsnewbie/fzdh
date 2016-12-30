/**
 * SeedController
 *
 * @description :: Server-side logic for managing Seeds
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
function processPreference(preference) {
  console.log(preference);
  Category.findOne({category:preference.category}).then(function (category){
    if(category){
      Category.update(preference).exec(function afterwards(err, updated){
        if (err) {
         throw err;
        }
        console.log('Updated Category to have name ' + updated[0].name);
      });
    } else {
      Category.create(preference).exec(function (err, created) {
        var i=0;
        if (err) {
          console.log(preference);
          console.log(err);
        } else {
          console.log(created);
        }
      });
    }
  });

}
function addToCollection(category, preference) {
  category.links.add(preference);
  // Save the category, creating the new link and associations in the join table
  category.save(function (err) {
    if (err) {
     sails.log(err);
     sails.log.info('category already exists!')
    }
  });
}
function addLink(preference, category) {
  var json = {};
  json['title'] = preference.titile;
  json['url'] = preference.url;
  json['weight'] = preference.weight;
  addToCollection(category, json);
}

function addToCatalog(catalog, category) {
  catalog.categories.add(category);
  // Save the category, creating the new link and associations in the join table
  catalog.save(function (err) {
    if (err) {
      sails.log(err);
    }
  });
}

function addCategory(entry, catalog) {
  Category.findOne({category:entry.category}).then(function (category){
    if (!category) {
      sails.log('Could not find '+entry.category+', create new one.');
      Category.create({category:entry.category}).then(function (created) {
        // Queue up a new category to be added and a record to be created in the join table
        addToCatalog(catalog, created);
      })
    } else {
      // Queue up a new category to be added and a record to be created in the join table
      // sails.log(preference);
      if(!category.categories.contains(category)) {
        addToCatalog(catalog, category);
      }
    }
  });
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
  });
}
function processCatalog(entry) {
  Catalog.findOne({name:entry.name}).then(function (found){
    if (!found) {
      sails.log('Could not find '+entry.name+', create new one.');
      Catalog.create({name:entry.name}).then(function (created) {
        addCategory(entry, created);
      })
    } else {
      addCategory(entry, found);
    }
  });
}
function processExcelData(file,callback) {
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
    if((callback && typeof(callback) === "function")){
      result.forEach(callback);
    } else {
        throw new Error("invalid callback function");
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
  //       console.log("authors = ",authors);
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
  //       console.log(err);
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
        console.log(err);
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
  importCatalogFromexcel: function(req,res){
    if (req.method === 'GET')
      return res.json({ 'status': 'GET not allowed' });
    processExcel(req, res,processCatalog);
  }
};
