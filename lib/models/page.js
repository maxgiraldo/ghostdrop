var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PageSchema = new Schema({
  file_name:  String,
  path_name: String,
  password: String,
  uploader_email: String,
  reader_email: String,
  created_time: {type: Date, default: Date.now},
  duration: String
});


mongoose.model('Page', PageSchema);