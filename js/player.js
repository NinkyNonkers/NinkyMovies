let currPlayer = 0

// 0 - YouTube
// 1 - Daily Motion (Deprecated)
// 2 - Vimeo (Deprecated)
// 3 - HTML5

// Gets all the player data
socket.on('getPlayerData', function(data) {
    const roomnum = data.room
    const caller = data.caller

    switch (currPlayer) {
        case 0:
            const curreTime = player.getCurrentTime()
            const st = playerStatus
            socket.emit('get host data', {
                room: roomnum,
                currTime: curreTime,
                state: st,
                caller: caller
            });
            break;
        case 3:
            const currTime = media.currentTime
            const state = media.paused
            socket.emit('get host data', {
                room: roomnum,
                currTime: currTime,
                state: state,
                caller: caller
            });
            break;
        default:
            console.log("Error: invalid player id")
    }
});

// Create Youtube Player
socket.on('createYoutube', function(data) {
    if (currPlayer !== 0) {

        const html5 = document.getElementById('HTML5Area');
        html5.style.display = 'none';

        const you = document.getElementById('playerArea');
        you.style.display = 'block';
        currPlayer = 0

        // The visual queue


        document.getElementById('loveButton').style.display = 'inline-block'
        document.getElementById('inputVideoId').placeholder = 'Video ID / URL'

        console.log("Player state: " + playerStatus)
        // If it is -1, there was an error and needs to resync to host
        if (playerStatus === -1) {
            socket.emit('get video', function(id) {
                player.loadVideoById(id);
                // Auto sync with host after 1000ms of changing video
                setTimeout(function() {
                    socket.emit('sync host', {});
                }, 1000);
            })
        }
    }
});

// Create Daily Motion Player
socket.on('createDaily', function(data) {
    console.log("Error: DailyMotion player has been deprecated in the latest release of NinkyMovies!")
});

// Create Vimeo Player
socket.on('createVimeo', function(data) {
    console.log("Error: DailyMotion player has been deprecated in the latest release of NinkyMovies!")
});

// Create HTML5 Player
socket.on('createHTML5', function(data) {

    if (currPlayer != 3) {

        console.log("changing to html5");

        const you = document.getElementById('playerArea');
        you.style.display = 'none';

        const html5 = document.getElementById('HTML5Area');
        html5.style.display = 'block';
        currPlayer = 3

        document.getElementById('loveButton').style.display = 'none'
        document.getElementById('inputVideoId').placeholder = 'Direct mp4/webm URL'
    }
    else
        console.log("Player is already on HTML5!")
});

