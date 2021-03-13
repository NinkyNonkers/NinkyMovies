# NinkyMovies
[Access the application here!](http://watch.ninkynonk.co.uk/)


NinkyMovies is a heavily modified fork of the real-time online video synchronization platform: Vynchronize. You can enjoy any video available online with friends who may not be next to you!

NinkyMovies currently supports YouTube, Daily Motion, Vimeo, and essentially any .mp4/.webm on the internet with the HTML5 Player!


---

### Dependencies

Socket.io

Node.js

Express

YouTube Data API V3

---

### How to run locally

##### How to run the server

Install Dependencies
```
npm install
```

Create a `.env` file and add API keys for YouTube Data API V3 and Dailymotion SDK (Optional) as YT3_API_KEY and DM_API_KEY

Run the server
```
node server
```

Access the page by going to localhost:80

##### How to run CI tests

```
npm test
```

---

### How it works

##### The Basics

The entire functionality of Vynchronize relies on web sockets, specifically
Socket.IO. When a client connects to the server, a socket is created. The user
then enters a name and a room number. The inputs are sent back to the server, and
it creates/joins a room of that name with Socket.IO. Any user can connect to the
room and interact with the users there.

Socket.IO functions can be emitted to certain rooms only. This way users in a
specific room can call a function and have it only affect their room. This
provides the foundation of the functionality.

##### Functionality

The functionality of synchronization is simply controlling the video player, and
calling the same functions for each socket in the room. For example if a person
calls play, it will call play for every connected socket. If a person calls sync
it will retrieve the current time from that user only and send the data to every
other socket. It will use that data and bring everyone to the correct time.

##### Hosts

At first it was fine to have host-less rooms, but I quickly realized
that people want to be auto-synced rather than hitting the sync button over
and over. For example if you join an already existing room, you want to jump
right into the content rather than worrying about syncing!

To do this I created a host socket which would be marked when a room is created.
This host socket is responsible for sending all the important video information
to any new sockets that join. Socket.IO rooms have a really nice variable that
can hold specific information for a room.

```
io.sockets.adapter.rooms['room-'+roomnum].host = socket.id
```

Along with holding the host information this object also holds the current
video, player, and connected clients.






##### The Room Object

io.sockets.adapter.rooms['room-'+roomnum]

This is the special object generated for every room created. Here is it's structure:

```
io.sockets.adapter.rooms['room-'+roomnum]
│   .host
|   .hostName
|   .users
│   .currPlayer
|   .length
│
└───.currVideo
│   |   .yt
│   |   .html5
|
└───.prevVideo
│   │
│   └───.yt
│   |   |   .id
│   |   |   .time
│   │
│   └───.html5
│       │   .id
│       │   .time
|
└───.sockets
    │   SOCKET-ID1
    │   SOCKET-ID2
    |   ...
```

**Some Notable Things**

The Queue object consists of arrays for each specific player. Each array then
consists of objects that hold both the id and title. It was created this way because
grabbing the title required extra work, and could not be done continuously on the spot.


