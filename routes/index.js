var models = require('../models/')
var path = require('path');
var fs = require('fs');
var generatePassword = require('password-generator');
/*
 * GET home page.
 */
exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.viewer = function(req, res) {
	res.render('viewer');
};

exports.create_doc = function(req, res){

  var uploader_email = req.body.uploader_email;
  var reader_email = req.body.reader_email.replace(/,/,"").split(' ').join(', ');

  var hours = parseInt(req.body.hours) || 0;
  var minutes = parseInt(req.body.minutes) || 0;
  var seconds = parseInt(req.body.seconds) || 0;

  //duration in miliseconds
  var duration = ((hours*60*60)+(minutes*60)+(seconds));
  console.log("duration is",duration);

  var originalFileName = req.files.file_name.originalFilename;
  var tempPath       = req.files.file_name.path;

  var targetPath     = path.resolve('public/_documents/' + originalFileName);

	if (path.extname(targetPath).toLowerCase() === '.pdf') {
        fs.rename(tempPath, targetPath, function(err) {
            if (err) throw err;
            console.log("Upload completed!");
        });
    } else {
        fs.unlink(tempPath, function (err) {
            if (err) throw err;
            console.error("For now, only .pdf files are allowed!");
        });
  }
  var password = generatePassword();

  var p = new models.File(
    {"uploader_email": uploader_email,
    "reader_email": reader_email,
    "duration": duration,
    "password": password,
    "path_name": "/_documents/" + originalFileName});

  p.save();

	var nodemailer = require('nodemailer');

  var smtpTransport = nodemailer.createTransport("SMTP",{
      service: "Mandrill",
      auth: {
          user: "app22068826@heroku.com",
          pass: "EoaalHbNVAhauz-W5CcmrA"
      }
  });

  // setup e-mail data with unicode symbols
  var mailOptions = {
      from: "sender@ghostdrop.io", // sender address
      to: reader_email+", "+uploader_email, // list of receivers
      subject: "File Shared with you", // Subject line
      text: "Hello,\n Please go to to"+global_hostname + '/auth/'+p._id.valueOf()+' to retrieve the shared file', // plaintext body
      html: '<h3>Hi</h3><p>'+uploader_email+' sent you a file</p>'
            +'<p>You will need this password too: '+ password+'</p>' // html body
            +'<p>To access it, click <b><a href="' + global_hostname + '/auth/'+p._id.valueOf()+'">here</a></b>'
  }
  console.log(global_hostname + "/auth/" + p._id.valueOf());

  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
          console.log(error);
      }else{
          console.log("Message sent: " + response.message);
      }
  });

  res.redirect('/success');
}


exports.success = function(req, res){
  res.render('success');
}


exports.create_user = function(req, res){
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var u = new models.User()
  u.save();
  res.render('index')
}

// exports.enter_password = function(req, res){
//   var id = req.params.id
//   res.render('index', {id: id})
// }

exports.enter_password = function(req, res){
  var password = req.body.password;
  var id = req.body.id;


  models.File.findOne({ _id: id }, function (err, doc) {

  	if (err) {
  		res.redirect(global_hostname + '/timeout');
  	}
    if (!doc.validPassword(password)) {
      res.redirect('/');
    }
    else{
      // doc.path('expired_by').expires(doc[exist_time]);//change string to number value
      // doc.save();;
      res.render('viewer', {"path_name" : doc.path_name, "doc_id" : id, "uploader_email": doc.uploader_email, "reader_email": doc.reader_email});//we have to offer up something that the show page would use
    }
  });
};

exports.auth = function(req, res) {
	var id = req.params.id;
	models.File.findOne({ _id: id }, function (err, doc) {
    if (doc) {
      res.render('password', {"id": id});
    }
    else{
      res.render('timeout');
    }
  });

}

exports.error = function(req, res) {
	res.render('timeout');
}

exports.notify = function(req, res) {
	var uploader_email = req.body.uploader_email;
  var reader_email = req.body.reader_email;

	var nodemailer = require('nodemailer');

  var smtpTransport = nodemailer.createTransport("SMTP",{
      service: "Gmail",
      auth: {
          user: "uploader.bot.314159",
          pass: "legalhackathon"
      }
  });

  // setup e-mail data with unicode symbols
  var mailOptions = {
      from: "uploader.bot.314159@gmail.com", // sender address
      to: uploader_email, // list of receivers
      subject: "Notification from Ghostdrop: save attempt on your file", // Subject line
      text: reader_email+" attempted to save your file. We have revoked his/her access.",
      html: '<p>'+reader_email+' attempted to save your file. We have revoked his/her access.</p>'
  }

  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
          console.log(error);
      }else{
          console.log("Message sent: " + response.message);
      }
  });
  res.json({});
}
















