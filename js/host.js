//-----------------------------------------------------------------------------
// Host stuff
let host = false
let notifyfix = false

const hostlabel = document.getElementById('hostlabel')


// Sets the host for the room
socket.on('setHost', function(data) {
    notifyfix = true
    console.log("You are the new host!")
    host = true
});
// Unsets the host
socket.on('unSetHost', function(data) {
    console.log("Unsetting host")
    host = false
});

// This grabs data and calls sync FROM the host
socket.on('getData', function(data) {
    socket.emit('sync host', {});
});
// Calls sync
socket.on('syncHost', function(data) {
    syncVideo(roomNum)
});

//Change the host
function changeHost(roomnum) {
    if (!host){
        socket.emit('change host', {
            room: roomnum
        });
        socket.emit('notify alerts', {
            alert: 1,
            user: userName
        })
    }
}
// Change the host label
socket.on('changeHostLabel', function(data) {
    const user = data.username
    // Change label
    hostlabel.innerHTML = "<i class=\"fas fa-user\"></i> Current Host: " + user
})

// When the host leaves, the server calls this function on the next socket
socket.on('autoHost', function(data) {
    changeHost(data.roomnum)
})

// If user gets disconnected from the host, give warning!
function disconnected() {
    // boolean to prevent alert on join
    if (notifyfix) {
    } else {
        notifyfix = true
    }
}

// Grab all host data
function getHostData(roomnum) {
    socket.emit('get host data', {
        room: roomnum
    });
}

// Uses the host data to compare
socket.on('compareHost', function(data) {
    // The host data
    const hostTime = data.currTime

    switch (currPlayer) {
        case 0:
            var currTime = player.getCurrentTime()

            // If out of sync
            if (currTime < hostTime - 2 || currTime > hostTime + 2) {
                disconnected()
            }

            break;
        case 3:
            var currTime = media.currentTime

            // If out of sync
            if (currTime < hostTime - 2 || currTime > hostTime + 2) {
                disconnected()
            }
            break;
        default:
            console.log("Error invalid player id")
    }
});

function test() {
    playerElement.src = playerElement.src + '&controls=0'
}



