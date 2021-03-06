let socket = io();

function scrollToBottom() {
    let messages = $('#messages');
    let newMessage = messages.children('li:last-child');
    let clientHeight = messages.prop('clientHeight');
    let scrollTop = messages.prop('scrollTop');
    let scrollHeight = messages.prop('scrollHeight');
    let newMessageHeight = newMessage.innerHeight();
    let lastMessageHeight = newMessage.prev().innerHeight();

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}

socket.on('connect', function() {
    let params = $.deparam(window.location.search);

    socket.emit('join', params, (err) => {
        if (err) {
            alert(err);
            window.location.href = '/';
        } else {
            console.log('no error');
        }
    });
})

socket.on('disconnect', function() {
    console.log('Disconnected from server');
});

socket.on('updateUserList', (users) => {
    let ul = $('<ul></ul>');
    users.forEach(function(users) {
        ul.append($('<li></li>').text(users));
    });

    $('#users').html(ul);
});

socket.on('newMessage', function(msg) {
    let template = $('#message-template').html();
    let formattedTime = moment(msg.createdAt).format('hh:mm a');
    let html = ejs.render(template, {
        text: msg.text,
        from: msg.from,
        createdAt: formattedTime
    });
    $('#messages').append(html);
    scrollToBottom();
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
    scrollToBottom();
})

let messageTextbox = '[name = message]';

$('#message-form').on('submit', function(e) {
    e.preventDefault();

    socket.emit('createMessage', {
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
console.log(users)