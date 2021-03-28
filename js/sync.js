let outerVideoId = "M7lc1UVf-VE"


// Calls the play video function on the server
function playVideo(rn) {
    // dailyPlayer.play();
    //vimeoPlayer.play()
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
            console.log("I am host and my current time is " + currTime + state)
            break;
        case 3:
            currTime = media.currentTime;
            state = media.paused;
            break;
        default:
            console.log("Error invalid player id")
    }

    // Required due to vimeo asyncronous functionality
    if (currPlayer !== 2) {
        socket.emit('sync video', {
            room: rmnum,
            time: currTime,
            state: state,
            videoId: videoID
        });
    }
}

// This return the current time
function getTime() {
    switch (currPlayer) {
        case 0:
            return player.getCurrentTime();
        case 3:
            return media.currentTime;
        default:
            console.log("Error invalid player id")
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



// Change to previous video


function loveLive(rrr) {
    const time = getTime()
    // love live, love4eva, why, gee, what is love, stay, starlight, bad boy
    // likey, spring love, palette, roller coaster, DNA, I, peekaboo, wee woo
    // rookie, russian roulette, i want you back, TT, whistle, ddu du ddu du, turtle, 24/7
    // something new, #cookie jar, lion heart, i will show you, bubble pop, girl front, love cherry motion, ice cream cake
    // stay (taeyeon), ordinary love, 11:11, SObeR, I'm so sick, heaven, genie, dinosaur
    // Travel, blow your mind, pop/stars, BBIBBI, gotta go, galaxy, my trouble, blue
    // love scenario, dance the night away, solo, some, yes or yes, when the wind blows, hi high, don't forget,
    // Uh Oh!, Workaholic, 25, through the night, four seasons, bom, runaway, don't
    // psycho, fancy, feel special, leave (park bo young), blueming,
    const video_roulette = [
        '97uviVyw0_o', 'tIWpr3tHzII', 'WkdtmT8A2iY', 'U7mPqycQ0tQ',
        'i0p1bmr0EmE', 'FzVR_fymZw4', 'eNmL4JiGxZQ', 'J_CFBjAyPWE',
        'V2hlQkVJZhE', 'erErBFKPbMY', 'd9IxdwEFk1c', '900X9fDFLc4',
        'MBdVXkSdhwU', '4OrCA1OInoo', '6uJf2IT2Zh8', 'wLfHuClrQdI',
        'J0h8-OTC38I', 'QslJYDX3o8s', 'X3H-4crGD6k', 'ePpPVE-GGJw',
        'dISNgvVpWlo', 'IHNzOHi8sJs', 'sErJjrLswEw', '-j6XPEUKzn0',
        'im1UUY8dQIk', 'rRgTMs_bGuI', 'nVCubhQ454c', 'MCEcWcIww5k',
        'bw9CALKOvAI', 'tyInv6RWL0Q', 'VBbeuXW8Nko', 'glXgSSOKlls',
        'k9_XH1YibcY', 'xGav-z5yRiU', 'WLJyhhNCHi0', 'DgT4CPv_CCE',
        'F4oHuML9U2A', 'L9ro1KjkJMg', '6SwiSpudKWI', '8Oz7DG76ibY',
        'xRbPAVnqtcs', '08ATpBqlAIk', 'UOxkGD8qRB4', 'nM0xDI5R50E',
        'HlN2BXNJzxA', '9U8uA702xrE', 'JRdcPhDkNYw', 'F34e6LYro-4',
        'vecSVX1QYbQ', 'Fm5iP0S1z9w', 'b73BI9eUkjM', 'hZmoMyFXDoI',
        'mAKsZ26SabQ', 'o3pOzegB-7w', '846cjX0ZTrk', 'TcytstV1_XE',
        'ycYLPbtxU1Q', 'mrAIqeULUL0', 'SNS2tOGGGRk', 'BzYnNdJhZQw',
        '4HG_CJzyX6A', 'AsXxuIdpkWM', 'rloIUIKLFfY', 'IB6kViGA3rY',
        'uR8Mrt1IpXg', 'kOHB85vDuow', '3ymwOvzhwHs', 'NmY6wo3rEso',
        'D1PvIWdJ8xo'
    ]

    // Random number between 0 and 68 inclusive
    const random = Math.floor(Math.random() * (69))
    // Only for YouTube testing
    socket.emit('change video', {
        room: rrr,
        videoId: video_roulette[random],
        time: time
    })
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
            console.log("Error invalid player id")
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
            console.log("Error invalid player id")
    }
});

// Syncs the video client
socket.on('syncVideoClient', function(data) {
    const currTime = data.time
    const state = data.state
    const videoId = data.videoId
    const playerId = data.playerId
    console.log("current time is: " + currTime)
    console.log("curr vid id: " + id + " " + videoId)
    console.log("state" + state)



    // This switchs you to the correct player
    // Should only happen when a new socket joins late

    // Current issue: changePlayer is called asynchronously when we need this function to wait for it to finish
    // changeSinglePlayer(playerId)
    // currPlayer = playerId

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
                    console.log("paused?")
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
                console.log("Error invalid player id")
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
                console.log("Error invalid player id")
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