let socket = io();

socket.on('connect', function() {
    console.log('Connected to server');

})

socket.on('disconnect', function() {
    console.log('Disconnected from server');
})

socket.on('newMessage', function(msg) {
    console.log('New Message Recieved', msg);
    let li = $('<li></li>');
    li.text(`${msg.from}: ${msg.text}`);
    $('#messages').append(li);
})

socket.on('newLocationMessage', (msg) => {
    console.log('New Location Recieved', msg);
    let li = $('<li></li>');
    let a = $('<a target="_blank">My current location</a>');
    li.text(`${msg.from}: `);
    a.attr('href', msg.url);
    li.append(a);
    $('#messages').append(li);
})

$('#message-form').on('submit', function(e) {
        e.preventDefault();

        socket.emit('createMessage', {
            from: 'User',
            text: $('[name=message]').val()
        })
    }
    /*, function(data2) {
        console.log('Got it', data2);
    }*/
);

let locationButton = $('#send-location');
locationButton.on('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported by your browser');
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        })
    }, () => {
        alert('Unable to share location');
    })
});