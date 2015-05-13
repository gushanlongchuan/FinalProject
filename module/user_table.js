var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    Username: String,
	First_name: String,
	Last_name: String,
	Password: String,
	Image_path: String,
	Address: String
});
 
module.exports = mongoose.model('User_table', UserSchema);