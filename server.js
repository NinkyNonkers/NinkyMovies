//TODO: upgrade to http2 electric boogaloo

const express = require('express');
const https = require('https');
const http = require('http');
const compression = require('compression');
const spdy = require('spdy');
const fs = require('fs');
const readline = require('node:readline');
const path = require('path');

users = [];
connections = [];
rooms = [];
// Store all of the sockets and their respective room numbers
userRooms = {}

// Set given room for url parameter
let given_room = ""
let roomNum = 0;
let currentShowing = {roomName: undefined, filmTime: undefined, filmName: undefined};

console.log("Preparing express HTTP server...")

const app = express();
const PORT = 3000;
const httpServer = http.createServer(app);

app.use(express.static(__dirname + '/'));
app.use(compression());

// CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://nonk.uk');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

// Route for /:room to serve index.html
app.get('/:room', function(req, res) {
    // You can access the room with req.params.room if needed
    given_room = req.params.room;
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

console.log('Server starting...');
const io = require('socket.io').listen(httpServer);

// app.param('room', function(req,res, next, room){
//     console.log("testing")
//     console.log(room)
//     given_room = room
// res.sendFile(__dirname + '/index.html');
// });

io.sockets.on('connection', function(socket) {
    // Connect Socket
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    // Set default room, if provided in url
    socket.emit('set id', {
        id: given_room
    })


    // reset url parameter
    // Workaround because middleware was not working right
    socket.on('reset url', function(data) {
        given_room = ""
    });

    // Disconnect
    socket.on('disconnect', function(data) {

        // If socket username is found
        if (users.indexOf(socket.username) !== -1) {
            users.splice((users.indexOf(socket.username)), 1);
        }

        connections.splice(connections.indexOf(socket), 1);
        console.log(socket.id + ' Disconnected: %s sockets connected', connections.length);


        // HOST DISCONNECT
        // Need to check if current socket is the host of the roomnum
        // If it is the host, needs to auto assign to another socket in the room

        // Grabs room from userrooms data structure
        const id = socket.id;
        const rm = userRooms[id];
        const room = rooms[rm];

        // If you are not the last socket to leave
        if (room !== undefined) {
            // If you are the host
            if (socket.id === room.host) {
                // Reassign
                io.to(Object.keys(room.sockets)[0]).emit('autoHost', {
                    roomName: rm
                })
            }

            // Remove from users list
            // If socket username is found
            if (room.users.indexOf(socket.username) !== -1) {
                room.users.splice((room.users.indexOf(socket.username)), 1);
                updateRoomUsers(rm);
            }
        }

        // Delete socket from userrooms
        delete userRooms[id]

    });

    // New room
    socket.on('new room', function(data, callback) {
        // Roomnum passed through
        socket.roomName = data;

        // This stores the room data for all sockets
        userRooms[socket.id] = data

        let host = null
        let init = false

        // Sets default room value to 1
        if (socket.roomName == null || socket.roomName === "") {
            socket.roomName = '1'
            userRooms[socket.id] = '1'
        }

        // Adds the room to a global array
        if (!rooms.includes(socket.roomName)) {
            rooms.push(socket.roomName);
        }

        // Checks if the room exists or not
        if (io.sockets.adapter.rooms[socket.roomName] === undefined) {
            socket.send(socket.id)
            // Sets the first socket to join as the host
            host = socket.id
            init = true

            // Set the host on the client side
            socket.emit('setHost');
            console.log(socket.username + " created room " + socket.roomName)
        } else {
            host = io.sockets.adapter.rooms[socket.roomName].host
        }

        // Actually join the room
        console.log(socket.username + " connected to room-" + socket.roomName)
        socket.join(socket.roomName);

        // Sets the default values when first initializing
        if (init) {
            // Sets the host
            if (io.sockets.adapter.rooms[socket.roomName] === undefined)
                return;
            io.sockets.adapter.rooms[socket.roomName].host = host
            // Default Player
            io.sockets.adapter.rooms[socket.roomName].currPlayer = 0
            // Default video
            io.sockets.adapter.rooms[socket.roomName].currVideo = {
                yt: 'M7lc1UVf-VE',
                html5: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
            }
            // Previous Video
            io.sockets.adapter.rooms[socket.roomName].prevVideo = {
                yt: {
                    id: 'M7lc1UVf-VE',
                    time: 0
                },
                html5: {
                    id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    time: 0
                }
            }
            // Host username
            io.sockets.adapter.rooms[socket.roomName].hostName = socket.username
            // Keep list of online users
            io.sockets.adapter.rooms[socket.roomName].users = [socket.username]
            // Set an empty queue
            io.sockets.adapter.rooms[socket.roomName].queue = {
                yt: [],
                html5: []
            }
        }

        // Set Host label
        io.sockets.in(socket.roomName).emit('changeHostLabel', {
            username: io.sockets.adapter.rooms[socket.roomName].hostName
        })

        // Gets current video from room variable
        switch (io.sockets.adapter.rooms[socket.roomName].currPlayer) {
            case 0:
                var currVideo = io.sockets.adapter.rooms[socket.roomName].currVideo.yt
                break;
            case 3:
                var currVideo = io.sockets.adapter.rooms[socket.roomName].currVideo.html5
                break;
            default:
                console.error("invalid player id")
        }

        // Change the video player to current One
        switch (io.sockets.adapter.rooms[socket.roomName].currPlayer) {
            case 0:
                // YouTube is default so do nothing
                break;
            case 3:
                io.sockets.in(socket.roomName).emit('createHTML5', {});
                break;
            default:
                console.error("invalid player id")
        }

        // Change the video to the current one
        socket.emit('changeVideoClient', {
            videoId: currVideo
        });

        // Get time from host which calls change time for that socket
        if (socket.id !== host) {
            // Set a timeout so the video can load before it syncs
            setTimeout(function() {
                socket.broadcast.to(host).emit('getData');
            }, 1000);

            // Push to users in the room
            io.sockets.adapter.rooms[socket.roomName].users.push(socket.username)

        }

        // Update online users
        updateRoomUsers(socket.roomName)

    });

    socket.on('get currentShowing', function(callback) {callback(currentShowing)})

    // ------------------------------------------------------------------------
    // ------------------------- Socket Functions -----------------------------
    // ------------------------------------------------------------------------

    // Play video
    socket.on('play video', function(data) {
        const roomnum = data.room
        io.sockets.in(roomnum).emit('playVideoClient');
    });

    // Event Listener Functions
    // Broadcast so host doesn't continuously call it on itself!
    socket.on('play other', function(data) {
        const roomnum = data.room
        socket.broadcast.to(roomnum).emit('justPlay');
    });

    socket.on('pause other', function(data) {
        const roomnum = data.room
        socket.broadcast.to(roomnum).emit('justPause');
    });

    socket.on('seek other', function(data) {
        const roomnum = data.room
        const currTime = data.time
        socket.broadcast.to(roomnum).emit('justSeek', {
            time: currTime
        });

    });

    // Sync video
    socket.on('sync video', function(data) {
        const room = io.sockets.adapter.rooms[socket.roomName];
        if (room !== undefined) {
            const room = data.room
            const currTime = data.time
            const state = data.state
            const videoId = data.videoId
            const playerId = room.currPlayer ?? data.playerId
            io.sockets.in(room).emit('syncVideoClient', {
                time: currTime,
                state: state,
                videoId: videoId,
                playerId: playerId
            })
        }
    });


    // Change video
    socket.on('change video', function(data, callback) {
        if (io.sockets.adapter.rooms[socket.roomName] !== undefined) {
            const room = data.room
            const videoId = data.videoId
            const time = data.time

            // This changes the room variable to the video id
            switch (io.sockets.adapter.rooms[socket.roomName].currPlayer) {
                case 0:
                    // Set prev video before changing
                    io.sockets.adapter.rooms[socket.roomName].prevVideo.yt.id = io.sockets.adapter.rooms[socket.roomName].currVideo.yt
                    io.sockets.adapter.rooms[socket.roomName].prevVideo.yt.time = time
                    // Set new video id
                    io.sockets.adapter.rooms[socket.roomName].currVideo.yt = videoId
                    break;
                case 3:
                    // Set prev video before changing
                    io.sockets.adapter.rooms[socket.roomName].prevVideo.html5.id = io.sockets.adapter.rooms[socket.roomName].currVideo.html5
                    io.sockets.adapter.rooms[socket.roomName].prevVideo.html5.time = time
                    // Set new video id
                    io.sockets.adapter.rooms[socket.roomName].currVideo.html5 = videoId
                    break;
                default:
                    console.error("invalid player id")
            }

            io.sockets.in(room).emit('changeVideoClient', {
                videoId: videoId
            });

            // If called from previous video, do a callback to seek to the right time
            if (data.prev) {
                // Call back to return the video id
                callback()
            }
        }
    });

    // Get video id based on player
    socket.on('get video', function(callback) {
        if (io.sockets.adapter.rooms[socket.roomName] !== undefined) {
            // Gets current video from room variable
            switch (io.sockets.adapter.rooms[socket.roomName].currPlayer) {
                case 0:
                    var currVideo = io.sockets.adapter.rooms[socket.roomName].currVideo.yt
                    break;
                case 3:
                    var currVideo = io.sockets.adapter.rooms[socket.roomName].currVideo.html5
                    break;
                default:
                    console.error("invalid player id")
            }
            // Call back to return the video id
            callback(currVideo)
        }
    })

    // Change video player
    socket.on('change player', function(data) {
        const room = io.sockets.adapter.rooms[socket.roomName];
        if (room !== undefined) {
            const roomnum = data.room
            const playerId = data.playerId

            io.sockets.in(roomnum).emit('pauseVideoClient');
            switch (playerId) {
                case 0:
                    io.sockets.in(roomnum).emit('createYoutube', {});
                    break;
                case 3:
                    io.sockets.in(roomnum).emit('createHTML5', {});
                    break;
                default:
                    console.error("invalid player id")
            }

            // This changes the room variable to the player id
            room.currPlayer = playerId

            // This syncs the host whenever the player changes
            host = room.host
            socket.broadcast.to(host).emit('getData')
        }

    })

    // Change video player
    socket.on('change single player', function(data) {
        if (io.sockets.adapter.rooms[socket.roomName] !== undefined) {
            const playerId = data.playerId

            switch (playerId) {
                case 0:
                    socket.emit('createYoutube', {});
                    break;
                case 3:
                    socket.emit('createHTML5', {});
                    break;
                default:
                    console.error("invalid player id")
            }
            // After changing the player, resync with the host
            host = io.sockets.adapter.rooms[socket.roomName].host
            socket.broadcast.to(host).emit('getData')
        }
    })


    // New User
    socket.on('new user', function(data, callback) {
        callback(true);
        // Data is username
        if (data === undefined || data == null)
            return;
        socket.username = data.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        users.push(socket.username);
    });

    // Changes time for a specific socket
    socket.on('change time', function(data) {
        const caller = data.id
        const time = data.time
        socket.broadcast.to(caller).emit('changeTime', {
            time: time
        });
    });

    // This just calls the syncHost function
    socket.on('sync host', function(data) {
        if (io.sockets.adapter.rooms[socket.roomName] !== undefined) {
            const host = io.sockets.adapter.rooms[socket.roomName].host
            // If not host, recall it on host
            if (socket.id !== host) {
                socket.broadcast.to(host).emit('getData')
            } else {
                socket.emit('syncHost')
            }
        }
    })

    // Change host
    socket.on('change host', function(data) {
        if (io.sockets.adapter.rooms[socket.roomName] !== undefined) {
            const roomnum = data.room
            const newHost = socket.id
            const currHost = io.sockets.adapter.rooms[socket.roomName].host

            // If socket is already the host!
            if (newHost !== currHost) {
                console.log("Host for " + roomnum + " changed to " + newHost);

                // Broadcast to current host and set false
                socket.broadcast.to(currHost).emit('unSetHost')
                // Reset host
                io.sockets.adapter.rooms[socket.roomName].host = newHost
                // Broadcast to new host and set true
                socket.emit('setHost')

                io.sockets.adapter.rooms[socket.roomName].hostName = socket.username
                // Update host label in all sockets
                io.sockets.in(roomnum).emit('changeHostLabel', {
                    username: socket.username
                })
            }
        }
    })

    // Get host data
    socket.on('get host data', function(data) {
        try {
            if (roomNum === undefined)
                return;
            const room = io.sockets.adapter.rooms[roomNum];
            if (room !== undefined) {
                const roomnum = data.room;
                const host = room.host;

                // Broadcast to current host and set false
                // Call back not supported when broadcasting

                // Checks if it has the data, if not get the data and recursively call again
                if (data.currTime === undefined) {
                    // Saves the original caller so the host can send back the data
                    const caller = socket.id
                    socket.broadcast.to(host).emit('getPlayerData', {
                        room: roomnum,
                        caller: caller
                    })
                } else {
                    const caller = data.caller
                    // Call necessary function on the original caller
                    socket.broadcast.to(caller).emit('compareHost', data);
                }
            }
        } catch (e) {
            // do something
        }

    })

    // Async get current time
    socket.on('auto sync', function(data) {
        const async = require("async");

        //Delay of 5 seconds
        const delay = 5000;

        async.forever(

            function(next) {
                // Continuously update stream with data
                //Store data in database

                console.log("i am auto syncing")
                socket.emit('syncHost');

                //Repeat after the delay
                setTimeout(function() {
                    next();
                }, delay)
            },
            function(err) {
                console.error(err);
            }
        );
    });


    // Update the room usernames
    function updateRoomUsers(rm) {
        if (io.sockets.adapter.rooms[socket.roomName] !== undefined) {
            const roomUsers = io.sockets.adapter.rooms[socket.roomName].users
            io.sockets.in(rm).emit('get users', roomUsers)
        }
    }

})

console.log("Server started");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question("Enter command:", (response) => {
    const cmd = response.split(" ");
    switch (cmd[0]) {
        case "update_current_showing":
            currentShowing.roomName = cmd[1];
            currentShowing.filmName = cmd[2];
            currentShowing.filmTime = cmd[3];
            break;
    }
});
