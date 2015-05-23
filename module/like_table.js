var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var LikeSchema   = new Schema({
	User_id: String,
	Liker_id: String,
	Post_id: String
});
 
module.exports = mongoose.model('Like_table', FriendSchema);