// Calls the play video function on the server
function playVideo(roomnum) {
    socket.emit('play video', {
        room: roomnum
    });
}

// Calls the sync function on the server
function syncVideo(roomnum) {
    var currTime = 0
    var state
    var videoId = id


    switch (currPlayer) {
        case 0:
            currTime = player.getCurrentTime();
            state = playerStatus
            console.log("I am host and my current time is " + currTime + state)
            break;
        case 1:
        case 2:
            console.log("Error: the player trying to be synced has been deprecated")
            break;
        case 3:
            currTime = media.currentTime;
            state = media.paused;
            break;
        default:
            console.log("Error invalid player id")

    }

    socket.emit('sync video', {
        room: roomnum,
        time: currTime,
        state: state,
        videoId: videoId
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
        default:
            console.log("Error: Invalid player id");
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
            case 1:
                myRegex = /.+\/(.+)/g
                if (videoId.includes("playlist")) {
                    myRegex = /.+video=(.+)/g
                }

                match = myRegex.exec(videoId)
                if (match != null) {
                    console.log("You entered a link, but you really meant " + match[1])
                    return match[1]
                }
                videoId = "invalid"
                break
            case 2:
                myRegex = /.+\/(.+)/g
                match = myRegex.exec(videoId)
                if (match != null) {
                    console.log("You entered a link, but you really meant " + match[1])
                    return match[1]
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

// This parses the ID out of the video link
function playlistParse(videoId) {
    // If user enters a full link
    if (videoId.includes("https://") || videoId.includes("http://") || videoId.includes(".com/")) {
        // Do some string processing with regex
        switch (currPlayer) {
            case 0:
                const myRegex = /.+&list=([A-Za-z0-9\-_]+)/g
                const match = myRegex.exec(videoId)
                if (match != null) {
                    return match[1]
                }
                break;

            case 1:
                break;
            case 2:
                break;
            case 3:
                break;
            default:
                console.log("Error invalid player")
        }
    }
    return "invalid"
}


// QueueVideo
function enqueueVideo(roomnum, rawId) {
    videoId = idParse(rawId)
    playlistId = playlistParse(rawId)

    if (playlistId != "invalid") {
      socket.emit('enqueue playlist', {
          room: roomnum,
          playlistId: playlistId,
          user: username
      })
    } else if (videoId != "invalid") {
        socket.emit('enqueue video', {
            room: roomnum,
            videoId: videoId,
            user: username
        })
    } else {
        console.log("User entered an invalid video url :(")
        invalidURL()
    }
}


function changeVideoParse(roomnum) {
  var videoId = document.getElementById("inputVideoId").value
  changeVideo(roomnum, videoId)
}

// Change playVideo
function changeVideo(roomnum, rawId) {
    var videoId = idParse(rawId)

    if (videoId != "invalid") {
        var time = getTime()
        console.log("The time is this man: " + time)
        // Actually change the video!
        socket.emit('change video', {
            room: roomnum,
            videoId: videoId,
            time: time
        });
    } else {
        console.log("User entered an invalid video url :(")
        invalidURL()
    }
    //player.loadVideoById(videoId);
}

// Does this even work?
function changeVideoId(roomnum, id) {
    document.getElementById("inputVideoId").innerHTML = id;
    socket.emit('change video', {
        room: roomnum,
        videoId: id
    });
}

// Change to previous video
function prevVideo(roomnum) {
    // This gets the previous video
    socket.emit('change previous video', {
        room: roomnum
    }, function(data) {
        // Actually change the video!
        var prevTime = data.time
        var time = getTime()
        socket.emit('change video', {
            room: roomnum,
            videoId: data.videoId,
            time: time,
            prev: true
        }, function(data) {
            // Set to the previous time
            setTimeout(function() {
                seekTo(prevTime)
            }, 1200);
        });
    });
}

function loveLive(roomnum) {
    var time = getTime()
    // love live, love4eva, why, gee, what is love, stay, starlight, bad boy
    // likey, spring love, palette, roller coaster, DNA, I, peekaboo, wee woo
    // rookie, russian roulette, i want you back, TT, whistle, ddu du ddu du, turtle, 24/7
    // something new, #cookie jar, lion heart, i will show you, bubble pop, girl front, love cherry motion, ice cream cake
    // stay (taeyeon), ordinary love, 11:11, SObeR, I'm so sick, heaven, genie, dinosaur
    // Travel, blow your mind, pop/stars, BBIBBI, gotta go, galaxy, my trouble, blue
    // love scenario, dance the night away, solo, some, yes or yes, when the wind blows, hi high, don't forget,
    // Uh Oh!, Workaholic, 25, through the night, four seasons, bom, runaway, don't
    // psycho, fancy, feel special, leave (park bo young), blueming,
    var video_roulette = [
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
    var random = Math.floor(Math.random() * (69))
    // Only for YouTube testing
    socket.emit('change video', {
        room: roomnum,
        videoId: video_roulette[random],
        time: time
    })
}

// Get time - DEPRECATED
// socket.on('getTime', function(data) {
//     var caller = data.caller
//     var time = player.getCurrentTime()
//     console.log("Syncing new socket to time: " + time)
//     socket.emit('change time', {
//         time: time,
//         id: caller
//     });
// });

// This just calls the sync host function in the server
socket.on('getData', function(data) {
    console.log("Hi im the host, you called?")
    socket.emit('sync host', {});
});

function changePlayer(roomnum, playerId) {
    if (playerId != currPlayer) {
        console.log("changing player")
        socket.emit('change player', {
            room: roomnum,
            playerId: playerId
        });
    }
    else
        console.log("Error: could not change player to the same value!")
}

// Change a single player
function changeSinglePlayer(playerId) {
    return new Promise((resolve, reject) => {
        if (playerId != currPlayer) {
            socket.emit('change single player', {
                playerId: playerId
            });
        }
        resolve("socket entered change single player function")
    })
}



//------------------------------//
// Client Synchronization Stuff //
//------------------------------//

var roomnum = 1
var id = "M7lc1UVf-VE"

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
        case 1:
        case 2:
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
    var currTime = data.time
    var state = data.state
    var videoId = data.videoId
    var playerId = data.playerId
    console.log("current time is: " + currTime)
    console.log("curr vid id: " + id + " " + videoId)
    console.log("state" + state)


    // This switchs you to the correct player
    // Should only happen when a new socket joins late

    // Current issue: changePlayer is called asynchronously when we need this function to wait for it to finish

    // Change the player if necessary
    if (currPlayer != playerId) {
        // This changes the player then recalls sync afterwards on the host
        changeSinglePlayer(playerId)
    } else {
        // This syncs the time and state
        switch (currPlayer) {
            case 0:
                var clientTime = player.getCurrentTime();
                // Only seek if off by more than .1 seconds
                // CURRENTLY ALL SET TO TRUE TO TO SYNCING ISSUES
                player.seekTo(currTime);

                // Sync player state
                // IF parent player was paused
                // If state is -1 (unstarted) the video will still start as intended
                if (state == 2) {
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

// Change video
socket.on('changeVideoClient', function(data) {
    var videoId = data.videoId;
    console.log("video id is: " + videoId)

    // This is getting the video id from the server
    // The original change video call updates the value for the room
    // This probably is more inefficient than just passing in the parameter but is safer?
    socket.emit('get video', function(id) {
        console.log("it really is " + id)
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
        console.log("resyncing with host after video change")
        socket.emit('sync host', {});
    }, 1000);

});

// Change time
socket.on('changeTime', function(data) {
    var time = data.time
    player.seekTo(time);
});
