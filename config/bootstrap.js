/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://links.sailsjs.org/docs/config/bootstrap
 */
var path = require('path');
module.exports.bootstrap = function(cb) {

  // It's very important to trigger this callack method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  // User.create({username:'admin',email:'admin@fzdh.com',''})
  //   .exec(function(err, numVideos) {
  //     if (err) {
  //       return cb(err);
  //     }
  //     if (numVideos > 0) {
  //       console.log('Number of video records: ', numVideos);
  //       return cb();
  //     } })
  var fileName=path.join(path.dirname(__filename) ,'..','assets','initConfigFile','catalog.xlsx');
  var dest=path.join(path.dirname(__filename) ,'..','assets','uploadFiles','catalog.xlsx');
  ExcelService.copyFile(fileName,dest);
  ExcelService.initCatalog(fileName);
  fileName=path.join(path.dirname(__filename) ,'..','assets','initConfigFile','preference.xlsx');
  dest=path.join(path.dirname(__filename) ,'..','assets','uploadFiles','preference.xlsx');
  ExcelService.copyFile(fileName,dest);
  ExcelService.initDefaultPreference('admin',fileName);
  sails.services.passport.loadStrategies();
  cb();
};
