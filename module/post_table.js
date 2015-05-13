var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PostSchema   = new Schema({
    Username: String,
	User_id: String,
	Title_of_post: String,
	Description: String,
	Price: Numnber,
	TimeStamp: { type : Date, default: Date.now },
	Image_path: String,
	Status: Number
});
 
module.exports = mongoose.model('Post_table', PostSchema);