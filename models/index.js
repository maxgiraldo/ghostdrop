var mongoose = require('mongoose');


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var File, User;
var Schema = mongoose.Schema;

var pageSchema = new Schema({
  file_name:  String,
  path_name: String,
  password: String,
  uploader_email: String,
  reader_email: String,
  created_time: {type: Date, default: Date.now},
  duration: String
});

var userSchema = new Schema({
  first_name: String,
  last_name: String,
  email: String,
  username: String,
  password: String,
  documents: Array
});

pageSchema.methods.validPassword = function(pwd){
  return (this.password === pwd);
}

File = mongoose.model('File', pageSchema);
User = mongoose.model('User', userSchema);

module.exports = {"File": File, "User": User};
