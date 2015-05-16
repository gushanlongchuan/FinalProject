var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PostSchema   = new Schema({
    Username: String,
	Title_of_post: String,
	Description: String,
	Price: Number,
	TimeStamp: { type : Date, default: Date.now },
	Image_path: String,
	Status: {type: Number, default: 0}
});
 
module.exports = mongoose.model('Post_table', PostSchema);