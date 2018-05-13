let socket = io();

socket.on('connect', function() {
    console.log('Connected to server');

})

socket.on('disconnect', function() {
    console.log('Disconnected from server');
})

socket.on('newMessage', function(msg) {
    let template = $('#message-template').html();
    let formattedTime = moment(msg.createdAt).format('hh:mm a');
    let html = ejs.render(template, {
        text: msg.text,
        from: msg.from,
        createdAt: formattedTime
    });
    $('#messages').append(html);
})

socket.on('newLocationMessage', (msg) => {
    let template = $('#location-message-template').html();
    let formattedTime = moment(msg.createdAt).format('hh:mm a');
    let html = ejs.render(template, {
        url: msg.url,
        from: msg.from,
        createdAt: formattedTime
    });
    $('#messages').append(html);
})

let messageTextbox = '[name = message]';

$('#message-form').on('submit', function(e) {
    e.preventDefault();

    socket.emit('createMessage', {
        from: 'User',
        text: $(messageTextbox).val()
    });

    $(messageTextbox).val('');
});

let locationButton = $('#send-location');
locationButton.on('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported by your browser');
    }

    locationButton.attr('disabled', 'disabled').text('Sending...');

    navigator.geolocation.getCurrentPosition((position) => {
        locationButton.removeAttr('disabled').text('Send Location');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        })
    }, () => {
        locationButton.removeAttr('disabled');
        alert('Unable to share location').text('Send Location');;
    });
});