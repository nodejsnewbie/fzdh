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

  ExcelService.initCatalog();
  ExcelService.initDefaultPreference('admin');
  sails.services.passport.loadStrategies();
  cb();
};
