/**
 * SeedController
 *
 * @description :: Server-side logic for managing Seeds
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
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
            category: user.preferences
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
        //	Call to /upload via GET is error

        var uploadFile = req.file('uploadFile');
        // console.log(uploadFile);

        uploadFile.upload({ dirname: '../../assets/uploadFiles' },function onUploadComplete(err, files) {
            //	Files will be uploaded to .tmp/uploads

            if (err) return res.serverError(err);
            //	IF ERROR Return and send 500 error with error

            // console.log(files);
            var file=files[0];
            // console.log(file);
            var fileName=file.filename;
            var filePath=file.fd;
            console.log(filePath);
            if(fileName.split('.')[fileName.split('.').length-1] === 'xlsx'){
                exceltojson = xlsxtojson;
            } else if(fileName.split('.')[fileName.split('.').length-1] === 'xls')
            {
                exceltojson = xlstojson;

            }else {
                return res.end("not an valid file");
                }
            try {
              exceltojson({
                input: filePath,
                output: null, //since we don't need output.json
                    lowerCaseHeaders:true
                }, function(err, result){
                if(err) {
                  return res.json({error_code:1,err_desc:err, data: null});
                }
                // res.json({error_code:0,err_desc:null, data: result});
                var i=0;
                result.forEach(function(preference){
                  Preference.create(preference).exec(function (err, created) {
                    if(err) {
                      console.log(preference);
                      console.log(err);
                    } else {
                      console.log(i++);
                    }

                  });
                });
                return res.send("Database seeded:"+ i);
                // var author=result[0];
                // Author.create(author).exec(function (err, created) {
                //     return res.send("Database seeded");
                // });
              });
            } catch (e){
                res.json({error_code:1,err_desc:"Corupted excel file"});
            }

            //
            // res.json({ status: 200, file: files ,fileName:fileName,exceltojson:exceltojson.toString()});
        });
	},

  importUserPreferenceseFromExcelToDb: function(req,res){
      if (req.method === 'GET')
        return res.json({ 'status': 'GET not allowed' });
      //	Call to /upload via GET is error

      var uploadFile = req.file('uploadFile');
      // console.log(uploadFile);

      uploadFile.upload({ dirname: '../../assets/uploadFiles' },function onUploadComplete(err, files) {
        //	Files will be uploaded to .tmp/uploads

        if (err) return res.serverError(err);
        //	IF ERROR Return and send 500 error with error

        // console.log(files);
        var file=files[0];
        // console.log(file);
        var fileName=file.filename;
        var filePath=file.fd;
        console.log(filePath);
        if(fileName.split('.')[fileName.split('.').length-1] === 'xlsx'){
          exceltojson = xlsxtojson;
        } else if(fileName.split('.')[fileName.split('.').length-1] === 'xls')
        {
          exceltojson = xlstojson;

        }else {
          return res.end("not an valid file");
        }
        try {
          exceltojson({
            input: filePath,
            output: null, //since we don't need output.json
            lowerCaseHeaders:true
          }, function(err, result){
            if(err) {
              return res.json({error_code:1,err_desc:err, data: null});
            }
            result.forEach(function(userPreference){
          Preference.findOne({category:userPreference.preference}).then(function (category){
            if (!category) {
              sails.log('Could not find'+userPreference.preference+', sorry.');
            } else {
              User.findOne({email:userPreference.email}).then(function (user) {
                // Queue up a new pet to be added and a record to be created in the join table
                sails.log(userPreference);
                sails.log('Found "%s"', category);
                sails.log('Found "%s"', user);
                user.preferences.add(category);
                // Save the user, creating the new userPreference and associations in the join table
                user.save(function(err) {
                  sails.log('save error:');
                  sails.log(err);
                  return     res.json({ error: err });
                });
              });
            }
          }) .catch(function (err) {
            sails.log(err);
            return     res.status(500)
              .json({ error: err });
          });
        });
        return res.send("Database seeded:"+ i);
      });
  } catch (e){
    return  res.json({error_code:1,err_desc:"Corupted excel file"});
  }
      });
    }
};

