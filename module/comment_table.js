var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CommentSchema   = new Schema({
    Post_id: String,
	User_id: String,
	Username: String,
	Content: String,
	TimeStamp: {type: Date, default: Date.now}
});
 
module.exports = mongoose.model('Comment_table', CommentSchema);