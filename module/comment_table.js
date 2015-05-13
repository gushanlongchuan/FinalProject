var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CommentSchema   = new Schema({
    Post_id: String,
	User_id: String,
	User_name: String,
	Contend: String,
	TimeStamp: Date
});
 
module.exports = mongoose.model('Comment_table', CommentSchema);