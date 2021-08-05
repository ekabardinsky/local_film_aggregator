const socket = io();
socket.on("OPEN_FILM", (event) => {
    window.location.href = event.url;
});
