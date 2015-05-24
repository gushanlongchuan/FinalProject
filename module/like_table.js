var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var LikeSchema   = new Schema({
	Liker_id: String,
	Post_id: String
});
 
module.exports = mongoose.model('Like_table', LikeSchema);