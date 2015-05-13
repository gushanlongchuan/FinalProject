var User = require('./test');
var mongoose   = require("mongoose");

module.exports = {	
	save_file:function(path, name){
		var t = new User();
		t.name = name;
		t.path = path;
		t.save(function(err, t) {
		if (err) 
			return console.error(err);
		console.log(t);
		});
		return;
	},
	
	read_file:function(filename){
		User.findOne({ name: filename}, function(err, result) {
			if (err) 
				return console.error(err);
			var id = result._id;
			console.log(id)
		
		});
		return;
	}	
} 

