var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var FriendSchema   = new Schema({
   Username: String,
   Friendname: String
});
 
module.exports = mongoose.model('Friend_table', FriendSchema);