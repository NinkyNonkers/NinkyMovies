//TODO: upgrade to http2 electric boogaloo

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const compression = require('compression');
const spdy = require('spdy');

users = [];
connections = [];
rooms = [];
// Store all of the sockets and their respective room numbers
userrooms = {}

// Set given room for url parameter
let given_room = ""

let roomnum = 0;

app.use(express.static(__dirname + '/'));
app.use(compression());

server.listen(process.env.PORT || 80);

console.log('Server Started . . .');

// app.param('room', function(req,res, next, room){
//     console.log("testing")
//     console.log(room)
//     given_room = room
// res.sendFile(__dirname + '/index.html');
// });


app.get('/:room', function(req, res) {
    given_room = req.params.room
    res.sendFile(__dirname + '/index.html');
});


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
        const rm = userrooms[id];
        const room = io.sockets.adapter.rooms['room-' + rm];

        // If you are not the last socket to leave
        if (room !== undefined) {
            // If you are the host
            if (socket.id === room.host) {
                // Reassign
                io.to(Object.keys(room.sockets)[0]).emit('autoHost', {
                    roomnum: rm
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
        delete userrooms[id]

    });

    // ------------------------------------------------------------------------
    // New room
    socket.on('new room', function(data, callback) {
        // Roomnum passed through
        socket.roomnum = data;

        // This stores the room data for all sockets
        userrooms[socket.id] = data

        let host = null
        let init = false

        // Sets default room value to 1
        if (socket.roomnum == null || socket.roomnum === "") {
            socket.roomnum = '1'
            userrooms[socket.id] = '1'
        }

        // Adds the room to a global array
        if (!rooms.includes(socket.roomnum)) {
            rooms.push(socket.roomnum);
        }

        // Checks if the room exists or not
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] === undefined) {
            socket.send(socket.id)
            // Sets the first socket to join as the host
            host = socket.id
            init = true

            // Set the host on the client side
            socket.emit('setHost');
            console.log("Creating room" + socket.roomnum);
        }
        else {
            console.log("New user joining" + socket.roomnum)
            host = io.sockets.adapter.rooms['room-' + socket.roomnum].host
        }

        // Actually join the room
        console.log(socket.username + " connected to room-" + socket.roomnum)
        socket.join("room-" + socket.roomnum);

        // Sets the default values when first initializing
        if (init)
        {
            // Sets the host
            if (io.sockets.adapter.rooms['room-' + socket.roomnum] === undefined) {
                console.log("Error: Room has not been created!")
                return;
            }
            io.sockets.adapter.rooms['room-' + socket.roomnum].host = host
            // Default Player
            io.sockets.adapter.rooms['room-' + socket.roomnum].currPlayer = 0
            // Default video
            io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo = {
                yt: 'M7lc1UVf-VE',
                html5: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
            }
            // Host username
            io.sockets.adapter.rooms['room-' + socket.roomnum].hostName = socket.username
            // Keep list of online users
            io.sockets.adapter.rooms['room-' + socket.roomnum].users = [socket.username]
        }

        // Set Host label
        io.sockets.in("room-" + socket.roomnum).emit('changeHostLabel', {
            username: io.sockets.adapter.rooms['room-' + socket.roomnum].hostName
        })

        const currPl = io.sockets.adapter.rooms['room-' + socket.roomnum].currPlayer;

        // Gets current video from room variable
        switch (currPl) {
            case 0:
                var currVideo = io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo.yt
                break;
            case 3:
                var currVideo = io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo.html5
                break;
            case undefined:
                console.log("Error: Player has not been defined! Could not get current video");
                io.sockets.adapter.rooms['room-' + socket.roomnum].currPlayer = 0;
                break;
            default:
                console.log("Error: invalid player id " + io.sockets.adapter.rooms['room-' + socket.roomnum].currPlayer)
        }

        // Change the video player to current One
        switch (currPl) {
            case 0:
                // YouTube is default so do nothing
                break;
            case 3:
                io.sockets.in("room-" + socket.roomnum).emit('createHTML5', {});
                break;
            case undefined:
                console.log("Error: Player has not been defined! Could not sync video player");
                io.sockets.adapter.rooms['room-' + socket.roomnum].currPlayer = 0;
                break;
            default:
                console.log("Error: invalid player id " + io.sockets.adapter.rooms['room-' + socket.roomnum].currPlayer)
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
            io.sockets.adapter.rooms['room-' + socket.roomnum].users.push(socket.username)

        }

        // Update online users
        updateRoomUsers(socket.roomnum)

    });
    // ------------------------------------------------------------------------



    // ------------------------------------------------------------------------
    // ------------------------- Socket Functions -----------------------------
    // ------------------------------------------------------------------------

    // Play video
    socket.on('play video', function(data) {
        const roomnum = data.room
        io.sockets.in("room-" + roomnum).emit('playVideoClient');
    });

    // Event Listener Functions
    // Broadcast so host doesn't continuously call it on itself!
    socket.on('play other', function(data) {
        const roomnum = data.room
        socket.broadcast.to("room-" + roomnum).emit('justPlay');
    });

    socket.on('pause other', function(data) {
        const roomnum = data.room
        socket.broadcast.to("room-" + roomnum).emit('justPause');
    });

    socket.on('seek other', function(data) {
        const roomnum = data.room
        const currTime = data.time
        socket.broadcast.to("room-" + roomnum).emit('justSeek', {
            time: currTime
        });

    });


    // Sync video
    socket.on('sync video', function(data) {
        const room = io.sockets.adapter.rooms['room-' + socket.roomnum];
        if (room !== undefined) {
            const room = data.room
            const currTime = data.time
            const state = data.state
            const videoId = data.videoId
            const playerId = room.currPlayer
            if (playerId === undefined) {
                return;
            }
            io.sockets.in("room-" + room).emit('syncVideoClient', {
                time: currTime,
                state: state,
                videoId: videoId,
                playerId: playerId
            })
        }
    });



    // Change video
    socket.on('change video', function(data, callback) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            const room = data.room
            const videoId = data.videoId

            // This changes the room variable to the video id
            switch (io.sockets.adapter.rooms['room-' + socket.roomnum].currPlayer) {
                case 0:
                    // Set new video id
                    io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo.yt = videoId
                    break;
                case 3:
                    // Set new video id
                    io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo.html5 = videoId
                    break;
                default:
                    console.log("Error: invalid player id")
            }

            io.sockets.in("room-" + room).emit('changeVideoClient', {
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
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            // Gets current video from room variable
            switch (io.sockets.adapter.rooms['room-' + socket.roomnum].currPlayer) {
                case 0:
                    var currVideo = io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo.yt
                    break;
                case 3:
                    var currVideo = io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo.html5
                    break;
                case undefined:
                    console.log("Player has not been defined!");
                    break;
                default:
                    console.log("Error: invalid player id")
            }
            // Call back to return the video id
            callback(currVideo)
        }
    })

    // Change video player
    socket.on('change player', function(data) {
        const room = io.sockets.adapter.rooms['room-' + socket.roomnum];
        if (room !== undefined) {
            const roomnum = data.room
            const playerId = data.playerId;

            io.sockets.in("room-" + roomnum).emit('pauseVideoClient');
            switch (playerId) {
                case 0:
                    io.sockets.in("room-" + roomnum).emit('createYoutube', {});
                    break;
                case 3:
                    io.sockets.in("room-" + roomnum).emit('createHTML5', {});
                    break;
                case undefined:
                    console.log("Error: Sent player has not been defined!");
                    break;
                default:
                    console.log("Error: invalid player id")
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
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            const playerId = data.playerId;

            switch (playerId) {
                case 0:
                    socket.emit('createYoutube', {});
                    break;
                case 3:
                    socket.emit('createHTML5', {});
                    break;
                case undefined:
                    console.log("Error: Invalid player id sent!");
                    break;
                default:
                    console.log("Error: invalid player id")
            }
            // After changing the player, resync with the host
            host = io.sockets.adapter.rooms['room-' + socket.roomnum].host
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
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            const host = io.sockets.adapter.rooms['room-' + socket.roomnum].host
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
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            console.log(io.sockets.adapter.rooms['room-' + socket.roomnum])
            const roomnum = data.room
            const newHost = socket.id
            const currHost = io.sockets.adapter.rooms['room-' + socket.roomnum].host

            // If socket is already the host!
            if (newHost !== currHost) {
                console.log("I want to be the host and my socket id is: " + newHost);

                // Broadcast to current host and set false
                socket.broadcast.to(currHost).emit('unSetHost')
                // Reset host
                io.sockets.adapter.rooms['room-' + socket.roomnum].host = newHost
                // Broadcast to new host and set true
                socket.emit('setHost')

                io.sockets.adapter.rooms['room-' + socket.roomnum].hostName = socket.username
                // Update host label in all sockets
                io.sockets.in("room-" + roomnum).emit('changeHostLabel', {
                    username: socket.username
                })
                // Notify alert
                socket.emit('notify alerts', {
                    alert: 1,
                    user: socket.username
                })
            }
        }
    })

    // Get host data
    socket.on('get host data', function(data) {
        try {
            if (roomnum === undefined)
                return;
            const room = io.sockets.adapter.rooms['room-' + roomnum];
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


    //------------------------------------------------------------------------------
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
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            const roomUsers = io.sockets.adapter.rooms['room-' + socket.roomnum].users
            io.sockets.in("room-" + rm).emit('get users', roomUsers)
        }
    }

})
