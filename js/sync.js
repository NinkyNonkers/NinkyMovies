let outerVideoId = "M7lc1UVf-VE"


// Calls the play video function on the server
function playVideo(rn) {
    socket.emit('play video', {
        room: rn
    });

}


// Calls the sync function on the server
function syncVideo(rmnum) {
    let currTime = 0
    let state
    const videoID = outerVideoId


    switch (currPlayer) {
        case 0:
            currTime = player.getCurrentTime();
            state = playerStatus
            console.log("current time: " + currTime)
            break;
        case 3:
            currTime = media.currentTime;
            state = media.paused;
            break;
        default:
            console.error("invalid player id")
    }

    // Required due to vimeo asyncronous functionality

    socket.emit('sync video', {
        room: rmnum,
        time: currTime,
        state: state,
        videoId: videoID,
        playerId: currPlayer
    });

}

// This return the current time
function getTime() {
    switch (currPlayer) {
        case 0:
            return player.getCurrentTime();
        case 3:
            return media.currentTime;
        default:
            console.error("invalid player id")
    }
}

function seekTo(time) {
    switch (currPlayer) {
        case 0:
            player.seekTo(time)
            player.playVideo()
            break;
        case 3:
            media.currentTime = currTime
            media.play()
            break;
    }
}

// This parses the ID out of the video link
function idParse(videoId) {
    // If user enters a full link
    if (videoId.includes("https://") || videoId.includes("http://") || videoId.includes(".com/")) {
        // Do some string processing with regex
        let match = "";
        let myRegex;
        switch (currPlayer) {
            case 0:
                if (videoId.includes("youtu.be")) {
                    myRegex = /.+youtu\.be\/([A-Za-z0-9\-_]+)/g
                    match = myRegex.exec(videoId)
                    if (match != null) {
                        return match[1]
                    }
                } else {
                    myRegex = /.+watch\?v=([A-Za-z0-9\-_]+)/g
                    match = myRegex.exec(videoId)
                    if (match != null) {
                        return match[1]
                    }
                }
                videoId = "invalid"
                break
            case 3:
                return videoId
            default:
                console.log("Error invalid videoId")
        }
    }
    return videoId
}


function changeVideoParse(rmid) {
    const videoId = document.getElementById("inputVideoId").value
    changeVideo(rmid, videoId)
}

// Change playVideo
function changeVideo(roomid, rawId) {
    const videoId = idParse(rawId)

    if (videoId !== "invalid") {
        const time = getTime()
        // Actually change the video!
        socket.emit('change video', {
            room: roomid,
            videoId: videoId,
            time: time
        });
    } else {
        console.log("User entered an invalid video url :(")
    }
}


// This just calls the sync host function in the server
socket.on('getData', function(data) {
    socket.emit('sync host', {});
});

function changePlayer(playerroom, playerId) {
    if (playerId !== currPlayer) {
        socket.emit('change player', {
            room: playerroom,
            playerId: playerId
        });
    }
}

// Change a single player
function changeSinglePlayer(playerId) {
    return new Promise((resolve, reject) => {
        if (playerId !== currPlayer) {
            socket.emit('change single player', {
                playerId: playerId
            });
        }
        resolve("socket entered change single player function")
    })
}


// Calls the play/pause function
socket.on('playVideoClient', function(data) {
    // Calls the proper play function for the player
    switch (currPlayer) {
        case 0:
            play()
            break;
        case 3:
            html5Play()
            break;
        default:
            console.error("invalid player id")
    }
});

socket.on('pauseVideoClient', function(data) {
    switch (currPlayer) {
        case 0:
            player.pauseVideo();
            break;
        case 3:
            media.pause()
            break;
        default:
            console.error("invalid player id")
    }
});

// Syncs the video client
socket.on('syncVideoClient', function(data) {
    const currTime = data.time
    const state = data.state
    const videoId = data.videoId
    const playerId = data.playerId
    console.log("current time: " + currTime)
    console.log("current id: " + id + " " + videoId)
    console.log("state: " + state)

    // This switchs you to the correct player
    // Should only happen when a new socket joins late

    // Current issue: changePlayer is called asynchronously when we need this function to wait for it to finish

    // Change the player if necessary
    if (currPlayer !== playerId) {
        // This changes the player then recalls sync afterwards on the host
        changeSinglePlayer(playerId)
    } else {
        // This syncs the time and state
        switch (currPlayer) {
            case 0:
                player.seekTo(currTime);
                // Sync player state
                // IF parent player was paused
                // If state is -1 (unstarted) the video will still start as intended
                if (state === 2) {
                    player.pauseVideo();
                }
                // If not paused
                else {
                    player.playVideo();
                }
                break;

            case 3:
                media.currentTime = currTime

                // Sync player state
                // IF parent player was paused
                if (state) {
                    media.pause()
                } else {
                    media.play()
                }
                break;

            default:
                console.error("invalid player id")
        }
    }

});

socket.on('changeVideoClient', function(data) {
    let videoId = data.videoId;

    // This is getting the video id from the server
    // The original change video call updates the value for the room
    // This probably is more inefficient than just passing in the parameter but is safer?
    socket.emit('get video', function(id) {
        videoId = id
        // This changes the video
        id = videoId

        switch (currPlayer) {
            case 0:
                player.loadVideoById(videoId);
                break;
            case 3:
                htmlLoadVideo(videoId)
                break;
            default:
                console.error("Error invalid player id")
        }
    })

    // Auto sync with host after 1000ms of changing video
    setTimeout(function() {
        socket.emit('sync host', {});
    }, 1000);

});


// Change time
socket.on('changeTime', function(data) {
    const time = data.time
    player.seekTo(time);
});