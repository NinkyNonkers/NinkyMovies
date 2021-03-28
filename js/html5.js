// Read in video input from filesystem


const media = document.querySelector('video');

let currentMode = 1;

let roomNumber = 0;

let videoModes = {
    1: "Pontipines",
    2: "Tittifers",
    3: "Og-pog",
    4: "Hahoos"
};

let videoModeDescriptions = {
    1: "tiny",
    2: "small",
    3: "decent",
    4: "thiccccc"
}

let modeRootDir = undefined;

function applyRoom(roomnumber) {
    roomNumber = roomnumber;
}

// Event listeners
media.addEventListener("play", function(e) {
    if (host) {
        playOther(roomNumber)
    } else {
        getHostData(roomNumber)
    }
})
media.addEventListener("pause", function(e) {
    if (host) {
        pauseOther(roomNumber)
    }
})
media.addEventListener("seeked", function(e) {
    const currTime = media.currentTime
    if (host) {
        seekOther(roomNumber, currTime)
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
    if (currentMode >= 4)
        currentMode = 1;
    else
        currentMode++;

    changeVideoMode(currentMode);
}

function changeVideoMode(newIndex) {
    if (newIndex > videoModes.length - 1)
        return;
    media.src = modeRootDir + videoModes[newIndex] + ".mp4";
}

function changeModeIndex(newIndex) {
    if (newIndex > videoModes.length - 1)
        return;
    currentMode = newIndex;
    media.src = modeRootDir + videoModes[newIndex] + ".mp4";
}

function setupModeDropdown() {
    document.getElementById("mdd1").innerText = videoModes[1] + " mode" + "(" + videoModeDescriptions[1] + ")";
    document.getElementById("mdd2").innerText = videoModes[2] + " mode" + "(" + videoModeDescriptions[2] + ")";
    document.getElementById("mdd3").innerText = videoModes[3] + " mode" + "(" + videoModeDescriptions[3] + ")";
    document.getElementById("mdd4").innerText = videoModes[4] + " mode" + "(" + videoModeDescriptions[4] + ")";
}

// Load video
function htmlLoadVideo(videoId) {
    console.log("changing video to: " + videoId);
    const switchModeButton = document.getElementById("switchmode");
    if (isFolder(videoId)) {
        console.log("Video is a directory, going to prepare individual files!");
        modeRootDir = videoId;
        media.src = videoId + videoModes[currentMode] + ".mp4";
        if (switchModeButton !== undefined && switchModeButton != null)
            switchModeButton.style.display = "block";
        return;
    }
    if (switchModeButton !== undefined && switchModeButton != null)
        switchModeButton.style.display = "none";
    media.src = videoId
}

function isFolder(videoId) {
    return videoId.indexOf(".mp4") === -1 && videoId[videoId.length - 1] === '/';
}
