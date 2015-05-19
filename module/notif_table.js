var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var NotifSchema   = new Schema({
	User_id: String,
	Message: String,
	Url: String,
	TimeStamp: { type : Date, default: Date.now },
	Status: {type: Number, default: 0}
});
 
module.exports = mongoose.model('Notif_table', NotifSchema);