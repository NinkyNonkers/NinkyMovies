// 0. Enqueue
// 1. Host Change
// 2. Empty Queue
// 3. Beta Message

// Enqueue Notify (0)
socket.on('enqueueNotify', function(data) {
    console.log("Enqueue Notify Alert")
    var title = data.title
    var user = data.user
    // Generate notify alert

})

// Change Host (1)
socket.on('changeHostNotify', function(data) {
    console.log("Host Change Notify Alert")

})

// Empty Queue (2)
socket.on('emptyQueueNotify', function(data) {
    console.log("Queue has been deprecated in this version of vynchronize")
})

// Beta Message (3)
socket.on('betaNotify', function(data) {
    console.log("Beta Notify Alert")


})

//------------------------------------------------------------------------------
// Not part of the server function
//------------------------------------------------------------------------------


// Made into its own function to reduce spam
// When pressing sync button
function syncAlert() {
    // Sync notify

}

// When user gets out of sync from the host
function disconnectedAlert() {

}

// When playNext is called
function playNextAlert() {
    $.notify({
        title: '<strong>Queue</strong>',
        icon: 'fas fa-list-alt',
        message: " is empty!"
    }, {
        type: 'warning',
        delay: 400,
        animate: {
            enter: 'animated fadeInUp',
            exit: 'animated fadeOutRight'
        },
        placement: {
            from: "bottom",
            align: "right"
        },
        offset: 20,
        spacing: 10,
        z_index: 1031,
    });
}

// When user enters a url, but the url is invalid
function invalidURL() {
    $.notify({
        title: '<strong>Error: </strong>',
        icon: 'fas fa-id-card',
        message: "Entered invalid video url"
    }, {
        type: 'danger',
        delay: 400,
        animate: {
            enter: 'animated fadeInUp',
            exit: 'animated fadeOutRight'
        },
        placement: {
            from: "bottom",
            align: "right"
        },
        offset: 20,
        spacing: 10,
        z_index: 1031,
    })
}

function betaAlert() {

}
