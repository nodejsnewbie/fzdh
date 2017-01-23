/**
 * Created by 丰泽 on 2017/1/13.
 */
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var path = require('path');

function processPreferences(entry, next) {
  sails.log("processPreferences");
  sails.log(entry);
  User.findOrCreate({username:entry.user})
    .populate('preferences')
    .exec(function (err,user) {
      if(err){
        sails.log('err arised:'+'will skip this entry');
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


function processorFactory(user){
  return function (entry, next) {
    entry.user=user.username;
    processPreferences(entry,next);
  }
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

function buildPreference(catalog,user,entry) {
  catalog.categories.forEach(function (category) {
    if (category.category == entry.category) {
      Link.findOrCreate({title: entry.title, url: entry.url})
        .exec (function (err,findOrCreateLink) {
          if(err){
            throw err;
          }
          if(entry.imagepath) {
            var image=importImage(entry.imagepath);
            Link.update(link.id,{image:image})
              .exec(function afterwards(err, updated){
                if (err) {
                  // handle error here- e.g. `res.serverError(err);`
                  throw err;
                }
                console.log('Updated Link to have image ' + updated[0].image);
              });
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
              sails.log(preference);
            })
        })
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

function processCatalog(entry, next){
  sails.log('processing entry:');
  sails.log(entry);
  Catalog.findOrCreate({name:entry.name})
    .populate('categories')
    .exec(function (err, catalog) {
      if(err){
        sails.log(err);
      }
      try {
        addCategory(entry, catalog);
      } catch (err){
        sails.log(err);
      }
      return next();
    })
}
function addCategory(entry, catalog) {
  Category.findOrCreate({category:entry.category})
    .exec(function createFindCB(err, category) {
    if (err){
      throw err;
    }
    if (catalog.categories.indexOf(category) ===-1){
      sails.log('!!!!!**********************************************!!!!!')
      sails.log(catalog.categories);
      sails.log('**********************************************')
      sails.log('category:');
      sails.log(category);
      sails.log('----**********************************************------')
      addToCatalog(catalog, category);
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
function getExcelToJson(fileName) {
  if (fileName.split('.')[fileName.split('.').length - 1] === 'xlsx') {
    return xlsxtojson;
  } else if (fileName.split('.')[fileName.split('.').length - 1] === 'xls') {
    return xlstojson;
  } else {
    throw new Error("invalid fileName extension");
  }
}
function processExcelData(fileName,iteratee) {
  sails.log("process fileName: "+fileName);
  var exceltojson = getExcelToJson(fileName);
  exceltojson({
    input: fileName,
    output: null, //since we don't need output.json
    lowerCaseHeaders: true
  }, function (err, result) {
    if (err) {
      throw err;
    }
    if((iteratee && typeof(iteratee) === "function")){
      async.eachSeries(result, iteratee, function afterwards (err) {
        if (err) {
          throw err;
        }
      sails.log('all done!  Import finished successfully.');
      });
    } else {
      sails.log(iteratee);
      throw new Error("invalid iteratee function");
    }

  })
}


function processExcelForUser(fileName,user,iteratee) {
  sails.log("process fileName: "+fileName);
  var exceltojson = getExcelToJson(fileName);
  exceltojson({
    input: fileName,
    output: null, //since we don't need output.json
    lowerCaseHeaders: true
  }, function (err, result) {
    if (err) {
      throw err;
    }
    if((iteratee && typeof(iteratee) === "function")){
      async.eachSeries(result, iteratee(user), function afterwards (err) {
        if (err) {
          sails.log('Import failed, error details:\n',err);
          throw err;
        }
        sails.log('all done!  Import finished successfully.');
      });
    } else {
      sails.log(iteratee);
      throw new Error("invalid iteratee function");
    }

  })
}

module.exports = {
  initCatalog: function (fileName) {
    ExcelService.processExcel(fileName,processCatalog);
  },

  processExcel: function (fileName, callback) {
    try {
      processExcelData(fileName, callback);
    }
    catch (ex) {
      sails.log(ex);
      throw ex;
    }
  },
  initDefaultPreference:function(userName,filename){
  User.findOrCreate({username:userName})
    .then(function (user) {
      sails.log(user);
      var processor=processorFactory(user);
      ExcelService.processExcel(filename,processor);
  })
  },
  copyFile:function (soure,dest) {
    var fs = require('fs');
    var path = require('path');
    //
    // var fileName = "coverflow-3.0.1.zip";
    //
    // var sourceFile = path.join(__dirname, fileName);
    // var destPath = path.join(__dirname, "dest", fileName);
    var readStream = fs.createReadStream(soure);
    var writeStream = fs.createWriteStream(dest);
    readStream.pipe(writeStream);
    console.log("拷贝完成")
  }
}
