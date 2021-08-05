const logger = require("../utils/logger");

class DeviceServices {
    init(server) {
        this.io = require('socket.io')(server);
        this.io.on("connection", (socket) => {
            socket.broadcast.emit("hello", "world");
        });
    }

    async sendFilm(req) {
        const {url} = req.body;
        this.io.emit('OPEN_FILM', {url}); // emit an event to all connected sockets
    }
}

module.exports = DeviceServices;
