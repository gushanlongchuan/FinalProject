
// create a new websocket
var socket = io.connect("http://localhost:3000");


function acceptNotif(id) {
	//send socket
	socket.emit('notif', {'id': id})
	//hide
	$('#'+id).hide()
	//decrease count
	$('.noti_bubble').html( $('.noti_bubble').html() - 1 )
	if ($('.noti_bubble').html() == "0") {
		$('.noti_bubble').hide()
	}
}


socket.emit('imhere', {'token': local_data})
// on message received we print all the data inside the #container div
socket.on('newnotif', function (data) {
	console.log(data)
	//console.log(local_data)	
});

