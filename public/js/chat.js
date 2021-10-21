const socket = io();

const $sendmsg = document.querySelector('#sendmsg');
const $forminput = document.querySelector('input');
const $formbutton = document.querySelector('button');
const $sendloc = document.querySelector('#send-loc');
const $msg = document.querySelector('#msg');

//Templates
const msgTmp = document.querySelector('#msg-template').innerHTML;
const locTmp = document.querySelector('#loc-template').innerHTML;
const sidebarTmp = document.querySelector('#sidebar-template').innerHTML;

const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix: true});

const autoscroll = () => {
    //new message
    const $newmsg = $msg.lastElementChild;

    //new message height
    const newmsgStyle = getComputedStyle($newmsg);
    const newmsgMargin = parseInt(newmsgStyle.marginBottom);
    const newmsgHeight = $newmsg.offsetHeight + newmsgMargin;
    
    const visiblHeight = $msg.offsetHeight

    const contentHeight = $msg.scrollHeight

    const scrollOffset = $msg.scrollTop + visiblHeight;

    if(contentHeight - newmsgHeight <= scrollOffset){
        $msg.scrollTop = $msg.scrollHeight
    }
}

socket.on('message', (msg) => {
    console.log(msg.username);
     const html = Mustache.render(msgTmp, {
        username: msg.username,
        msg: msg.text, 
        createdAt: moment(msg.createdAt).format("h:mm a"),
     });
     $msg.insertAdjacentHTML('beforeend',html);
     autoscroll();
})

socket.on('locationMsg',(msg) => {
    console.log(msg.url);
    const html = Mustache.render(locTmp, {
        username: msg.username,
        url: msg.url,
        createdAt: moment(msg.createdAt).format("h:mm a"),
    })
    $msg.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('room',({room,users}) =>{
    const html = Mustache.render(sidebarTmp, {
        room,
        users,
    })
    document.querySelector('#sidebar').innerHTML = html;
})

$sendmsg.addEventListener('submit',(e) => {
    e.preventDefault();

    $formbutton.setAttribute('disabled', 'disabled');

    const msg = e.target.elements.message.value;
    socket.emit('sendMessage',msg, () => {
        $formbutton.removeAttribute('disabled');
        $forminput.value = ''; 
        $forminput.focus();
        console.log('The msg was delivered successfully!');
    });
})

$sendloc.addEventListener('click', () => {
    $sendloc.setAttribute('disabled', 'disabled');
    if(!navigator.geolocation)
        return alert('Geolocation is not supported by your browser.')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendlocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        }, () => {
            $sendloc.removeAttribute('disabled');

            console.log('Location shared!');
        });
    })
})

socket.emit('join',{username,room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
});