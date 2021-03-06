/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `config/404.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on routes, check out:
 * http://links.sailsjs.org/docs/config/routes
 */

module.exports.routes = {


  // Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, etc. depending on your
  // default view engine) your home page.
  //
  // (Alternatively, remove this and add an `index.html` file in your `assets` directory)
  '/': 'FlashController.home',

  'get /login': 'AuthController.login',
  'get /logout': 'AuthController.logout',
  'get /register': 'AuthController.register',

  'post /auth/local': 'AuthController.callback',
  'post /auth/local/:action': 'AuthController.callback',

  'get /auth/:provider': 'AuthController.provider',
  'get /auth/:provider/callback': 'AuthController.callback',
  'get /auth/:provider/:action': 'AuthController.callback',

  // Custom routes here...
  '/importPreferenceseFromExcelToDb':{
    view: 'uploadfile'  // view 'uploadfile' in views directory will loaded automatically
  },
  '/importUserPreferenceseFromExcelToDb':{
    view: 'importUserPreference'  // view 'uploadfile' in views directory will loaded automatically
  },
  '/importLinksFromExcelToDb': {
    view: 'importLinks'
  },
  '/importCatalogFromexcel': {
    view: 'importCatalog'
  },
  '/importPreferences': {
    view: 'importPreferences'
  },
  'get /users': 'SystemController.users',
  'get /classifications': 'ClassificationController.getClassifications',
  'get /version': 'SystemController.version',
  'get /category': 'CategoryController.categories',
  'get /category/:id/links': 'CategoryController.categoryList',
  'get /preference/device/:deviceId': 'PreferenceController.getDevicePreferences',
  'get /preference/user/:userName': 'PreferenceController.getUserPreferences',
  'get /preference/user/:userName/:category': 'PreferenceController.getUserPreferencesByCategory',
  'get /preference/:id ': 'PreferenceController.preference',
  // 'post /preference/:catalog': 'PreferenceController.test',
  'put /preference/:catalog': 'PreferenceController.modifyCatalogPreferences',
  'put /preference/category/:category': 'PreferenceController.modifyCategoryPreferences',
  'get /defaultPreferences/:category': 'PreferenceController.getDefaultCategoryPreferences',
  'post /defaultPreferences/:category': 'PreferenceController.addDefaultCategoryPreferences',
  'get /catalog/:id': 'CatalogController.catalogList',
  'get /catalogs' : 'CatalogController.catalogs',
  'delete /clearCatalog': 'CatalogController.clearCatalog',
  'delete /clearPreference': 'PreferenceController.clearPreferences',
  'post /initPreference': 'PreferenceController.initPreferences'
  // If a request to a URL doesn't match any of the custom routes above,
  // it is matched against Sails route blueprints.  See `config/blueprints.js`
  // for configuration options and examples.

};
