const socket = io();

const $sendmsg = document.querySelector('#sendmsg');
const $forminput = document.querySelector('input');
const $formbutton = document.querySelector('button');
const $sendloc = document.querySelector('#send-loc');

socket.on('message', (msg) => {
    console.log(msg);
})

$sendmsg.addEventListener('submit',(e) => {
    e.preventDefault();

    $formbutton.setAttribute('disabled', 'disabled');

    const msg = e.target.elements.message.value;
    socket.emit('sendMessage',msg, () => {
        $formbutton.removeAttribute('disabled');
        console.log('The msg was delivered successfully!');
    });
})

$sendloc.addEventListener('click', () => {
    if(!navigator.geolocation)
        return alert('Geolocation is not supported by your browser.')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendlocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        }, () => {
            console.log('Location shared!');
        });
    })
})
