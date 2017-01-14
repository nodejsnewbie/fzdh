/**
 * Created by 丰泽 on 2017/1/13.
 */
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var path = require('path');

function processPreferences(entry, next) {
  sails.log("processPreferences");
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
          // sails.log("findOrCreateLink:          ");
          // sails.log(findOrCreateLink);
          // sails.log("/findOrCreateLink");
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
    }})
}

function processCatalog(entry, next){
  sails.log('processing entry:');
  sails.log(entry);
  Catalog.findOrCreate({name:entry.name})
    .exec(function createFindCB(err, catalog) {
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
  initCatalog: function () {
    var fileName=path.dirname(__filename) + '\\..\\..\\assets\\uploadFiles\\' +'catalog.xlsx';
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
  initDefaultPreference:function(userName){
  User.create({username:userName})
    .then(function (user) {
      var fileName=path.dirname(__filename) + '\\..\\..\\assets\\uploadFiles\\' +'preferences.xlsx';
      ExcelService.processExcel(fileName,processCatalog);
  })
  }
}
