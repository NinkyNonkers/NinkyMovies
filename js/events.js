// These functions just simply play or pause the player
// Created for event listeners

//-----------------------------------------------------------------------------

function playOther(roomnum) {
    socket.emit('play other', {
        room: roomnum
    });
}

socket.on('justPlay', function(data) {
    console.log("currPlayer")
    switch (currPlayer) {
        case 0:
            if (playerStatus === -1 || playerStatus === 2) {
                player.playVideo()
            }
            break;
        case 3:
            if (media.paused) {
                media.play();
            }
            break;
        default:
            console.log("Invalid player id");
    }
});

function pauseOther(roomnum) {
    socket.emit('pause other', {
        room: roomnum
    });
}

socket.on('justPause', function(data) {
    console.log("hiIamPausing!")
    switch (currPlayer) {
        case 0:
            player.pauseVideo()
            break;
        case 3:
            media.pause()
            break;
        default:
            console.log("Invalid player id")
    }
    player.pauseVideo()
});

function seekOther(roomnum, currTime) {
    socket.emit('seek other', {
        room: roomnum,
        time: currTime
    });
    // socket.emit('getData');
}


// Weird for YouTube because there is no built in seek event
// It seeks on an buffer event
// Only syncs if off by over .2 seconds
socket.on('justSeek', function(data) {
    console.log("Seeking Event!")
    currTime = data.time
    switch (currPlayer) {
        case 0:
            var clientTime = player.getCurrentTime();
            if (clientTime < currTime - .2 || clientTime > currTime + .2) {
                player.seekTo(currTime);
                // Forces video to play right after seek
                player.playVideo()
            }
            break;
        case 3:
            var clientTime = media.currentTime
            if (clientTime < currTime - .2 || clientTime > currTime + .2) {
                media.currentTime = currTime
            }
            // playOther(roomnum)
            break;
        default:
            console.log("Invalid player id")
    }
});

// Needs to grab the next video id and change the video
function playNext(roomnum) {
    socket.emit('play next', {}, function(data) {
        const videoId = data.videoId

        // IF queue is empty do not try to change
        if (videoId !== "QUEUE IS EMPTY") {
            // Change the video
            socket.emit('change video', {
                room: roomnum,
                videoId: videoId,
                time: 0
            })
        } else {
            playNextAlert()
        }
    })
}
