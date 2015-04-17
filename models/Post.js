
var mongoose = require('mongoose')

var PostSchema = new mongoose.Schema({
	username: String,
	givenName: String,
	surname: String,
	title: {type: String, default: 'nice item to sell'},
	description: {type: String, default: 'nice item to sell'},
	price: {type: Number, default: 10},
	sold: {type: Boolean, default: 0},
	created_at: {type: Date, default: Date.now},
	images: String
})

module.exports = mongoose.model('Post', PostSchema)