var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var FriendSchema   = new Schema({
   User_id: String,
   Friend_id: String
});
 
module.exports = mongoose.model('Friend_table', FriendSchema);