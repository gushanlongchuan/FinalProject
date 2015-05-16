var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CommentSchema   = new Schema({
	Username: String,
	Comment_username:
	Contend: String,
	TimeStamp: Date
});
 
module.exports = mongoose.model('Comment_table', CommentSchema);