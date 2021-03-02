// Read in video input from filesystem
// var html5input = document.getElementById('html5-input');
// html5input.onchange = function(e) {
//     var html5 = document.getElementById('html5src');
//     html5.src = URL.createObjectURL(this.files[0]);
//     // not really needed in this exact case, but since it is really important in other cases,
//     // don't forget to revoke the blobURI when you don't need it
//     html5.onend = function(e) {
//         URL.revokeObjectURL(this.src);
//     }
// }

var media = document.querySelector('video');

let currentMode = 1;

let videoModes = {
    1: null,
    2: null,
    3: null
};

// Event listeners
media.addEventListener("play", function(e) {
    if (host) {
        playOther(roomnum)
    } else {
        getHostData(roomnum)
    }
})
media.addEventListener("pause", function(e) {
    if (host) {
        pauseOther(roomnum)
    }
})
media.addEventListener("seeked", function(e) {
    var currTime = media.currentTime
    if (host) {
        seekOther(roomnum, currTime)
    }
})

// Play/pause function
function html5Play() {
    if (media.paused) {
        media.play();
    } else {
        media.pause();
    }
}

function changeMode() {
    if (currentMode >= 3)
        currentMode = 1;
    else
        currentMode++;

    changeVideoMode(currentMode);
}

function changeVideoMode(newIndex) {
    if (newIndex > videoModes.length - 1)
        return;
    media.src = videoModes[newIndex];
}

// Load video
function htmlLoadVideo(videoId) {
    console.log("changing video to: " + videoId);
    const switchModeButton = document.getElementById("switchmode");
    if (isFolder(videoId)) {
        console.log("Video is a directory, going to prepare individual files!");
        videoModes[1] = videoId + "1.mp4";
        videoModes[2] = videoId + "2.mp4";
        videoModes[3] = videoId + "3.mp4";
        media.src = videoModes[currentMode];
        if (switchModeButton !== undefined && switchModeButton != null)
            switchModeButton.style.display = "block";
        return;
    }
    if (switchModeButton !== undefined && switchModeButton != null)
        switchModeButton.style.display = "none";
    media.src = videoId
}

function isFolder(videoId) {
    return !videoId.contains(".mp4") && videoId[videoId.length - 1] === '/';
}
