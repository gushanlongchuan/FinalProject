
// create a new websocket
var socket = io.connect(window.location.href.split('/').slice(0,3).join([separator='/']));

// Send info to server when user accepts notif
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

// Hide notif when 0
$(document).ready(function(){
	if ($('.noti_bubble').html() == "0") {
		$('.noti_bubble').hide()
	}
})

// Emit first socket
socket.emit('imhere', {'token': local_data})

// On message received 
socket.on('newnotif', function (data) {
	console.log(data)
	// add notif to dropdown
	$('#notifs_dd').append('<li id="' + data._id + '" style="margin-top: 5px;"><a href="' + data.Url + '" style="display: inline;">' + data.Message + '</a><button class="btn btn-xs btn-success center" onclick="acceptNotif(\'' + data._id + '\')" style="float: right;">OK</button></li>')
	// increase count
	$('.noti_bubble').html( parseInt($('.noti_bubble').html()) + 1 )
});

