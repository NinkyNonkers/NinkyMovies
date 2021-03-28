const tag = document.createElement('script');
const playerElement = document.getElementById('player');
tag.id = 'iframe-demo';
tag.src = 'https://www.youtube.com/iframe_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;

let playerStatus = -1;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        playerVars: {
            autoplay: 0,
            rel: 0,
            controls: 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
    console.log(document.getElementById('player').src)
}

function onPlayerReady(event) {
    playerElement.style.borderColor = '#00000000';
}

function changeBorderColor(playerStatus) {
    let color;
    if (playerStatus === -1) {
        color = "#37474F"; // unstarted = gray
    } else if (playerStatus === 0) {
        color = "#FFFF00"; // ended = yellow
    } else if (playerStatus === 1) {
        color = "#33691E"; // playing = green
    } else if (playerStatus === 2) {
        color = "#DD2C00"; // paused = red
    } else if (playerStatus === 3) {
        color = "#AA00FF"; // buffering = purple
    } else if (playerStatus === 5) {
        color = "#FF6DOO"; // video cued = orange
    }
    if (color) {
        playerElement.style.borderColor = color;
    }
}

function onPlayerStateChange(event) {
    playerStatus = event.data;

    // Event Listeners
    switch (playerStatus) {
        case 0:
            // Video Ended
            // Go to next in queue
            if (host) {
                playNext(roomNum)
            }
            break;
        case 1:
            console.log(host)
            if (host) {
                playOther(roomNum)
            } else {
                getHostData(roomNum)
            }
            break;
        case 2:
            if (host) {
                pauseOther(roomNum)
            }
            break;
        case 3:
            const currTime = player.getCurrentTime();
            if (host) {
                seekOther(roomNum, currTime)
            }
            break;
    }

}

function play() {
    if (playerStatus === -1 || playerStatus === 2) {
        player.playVideo();
    } else {
        player.pauseVideo();
    }
}

socket.on('get title', function(data, callback) {
    //TODO: rework this to use built in requests instead of jquery
    const videoId = data.videoId
    const user = data.user

    const request = new XMLHttpRequest();
    request.open('GET', 'https://www.googleapis.com/youtube/v3/videos', true);

    request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            // Success!
            var resp = this.response;
            console.log("Title resolving is currently a WIP!")
            return;
            socket.emit('notify alerts', {
                alert: 0,
                user: user,
                title: data.items[0].snippet.title
            })
            // Does a callback and returns title
            callback({
                videoId: videoId,
                title: data.items[0].snippet.title
            })
        } else {
            console.log("Could not get yt video title");

        }
    };

    request.onerror = function() {
        console.log("Could not get yt video title");
    };

    request.send();

    /*$.get(
        "https://www.googleapis.com/youtube/v3/videos", {
            part: 'snippet',
            id: videoId,
            key: data.api_key
        },
        function(data) {
            // enqueueNotify(user, data.items[0].snippet.title)
            socket.emit('notify alerts', {
                alert: 0,
                user: user,
                title: data.items[0].snippet.title
            })
            // Does a callback and returns title
            callback({
                videoId: videoId,
                title: data.items[0].snippet.title
            })
        }
    ) */
})

