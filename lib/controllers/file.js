'use strict';

var path = require('path');
var fs = require('fs');
var config = require('../config/config');

/**
 * Send partial, or 404 if it doesn't exist
 */


var validExtensions = ['.pdf', '.js', '.rb', '.html', '.docx', '.doc', '.css', '.java', '.less', '.jpg', '.gif', '.png', '.jpeg'];

exports.create_document = function(req, res){

  // var uploader_email = req.body.uploader_email;
  // var reader_email = req.body.reader_email.replace(/,/,"").split(' ').join(', ');

  // var hours = parseInt(req.body.hours) || 0;
  // var minutes = parseInt(req.body.minutes) || 0;
  // var seconds = parseInt(req.body.seconds) || 0;

  //duration in miliseconds
  // var duration = ((hours*60*60)+(minutes*60)+(seconds));
  // console.log("duration is",duration);

  var originalFileName = req.files.file.originalFilename;
  var tempPath       = req.files.file.path;

  var targetPath     = path.resolve(config.root+'/app/views/documents/' + originalFileName);

  if (validExtensions.indexOf(path.extname(targetPath).toLowerCase()) !== -1) {
        fs.rename(tempPath, targetPath, function(err) {
            if (err) throw err;
            console.log("Upload completed!");
        });
    } else {
        fs.unlink(tempPath, function (err) {
            if (err) throw err;
            console.error("For now, "+path.extname(targetPath)+" file extension is not available.");
        });
  }

res.jsonp({});
  // var password = generatePassword();

  // var p = new models.File(
  //   {"uploader_email": uploader_email,
  //   "reader_email": reader_email,
  //   "duration": duration,
  //   "password": password,
  //   "path_name": "/_documents/" + originalFileName});

  // p.save();

  // var nodemailer = require('nodemailer');

  // var smtpTransport = nodemailer.createTransport("SMTP",{
  //     service: "Mandrill",
  //     auth: {
  //         user: "app22068826@heroku.com",
  //         pass: "EoaalHbNVAhauz-W5CcmrA"
  //     }
  // });

  // var global_hostname = "http://localhost:9000"
  // // setup e-mail data with unicode symbols
  // var mailOptions = {
  //     from: "sender@ghostdrop.io", // sender address
  //     to: reader_email+", "+uploader_email, // list of receivers
  //     subject: "File Shared with you", // Subject line
  //     text: "Hello,\n Please go to to"+global_hostname + '/auth/'+p._id.valueOf()+' to retrieve the shared file', // plaintext body
  //     html: '<h3>Hi</h3><p>'+uploader_email+' sent you a file</p>'
  //           +'<p>You will need this password too: '+ password+'</p>' // html body
  //           +'<p>To access it, click <b><a href="' + global_hostname + '/auth/'+p._id.valueOf()+'">here</a></b>'
  // }
  // console.log(global_hostname + "/auth/" + p._id.valueOf());
  // // send mail with defined transport object
  // smtpTransport.sendMail(mailOptions, function(error, response){
  //     if(error){
  //         console.log(error);
  //     }else{
  //         console.log("Message sent: " + response.message);
  //     }
  // });
};