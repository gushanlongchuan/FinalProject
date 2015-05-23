var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var FriendSchema   = new Schema({
	User_id: String,
	Friend_id: String,
	Username: String,
	Friendname: String,
	User_picture: String,
	Friend_picture: String
});
 
module.exports = mongoose.model('Friend_table', FriendSchema);