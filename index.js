const appPort = process.env.PORT || 8080;
const logger = require("./utils/logger");
const bodyParser = require('body-parser');

// services
const DeviceServices = require('./services/DeviceServices');

// adapters
// const DamnserialAdapter = require("./adapters/DamnserialAdapter");
//const KinoHorrorNetAdapter = require("./adapters/KinoHorrorNetAdapter");
const GoblinsOnlineAdapter = require("./adapters/GoblinsOnlineAdapter");
const LordfilmAdapter = require("./adapters/LordfilmAdapter");
const adapters = [new GoblinsOnlineAdapter(), new LordfilmAdapter()];

// init app
const express = require("express");
const app = express();
const apiRoute = express.Router();

// parse application/json
app.use(bodyParser.json());


// init controllers
const GenericOperationController = require("./controllers/GenericOperationController");
new GenericOperationController(apiRoute, adapters, 'search');
new GenericOperationController(apiRoute, adapters, 'getParts');
new GenericOperationController(apiRoute, adapters, 'getSubParts');
new GenericOperationController(apiRoute, adapters, 'getVariants');

// connect routes to basic path
app.use('/api', apiRoute);
app.use(express.static('client'));

// start to listening for calls
const server = require('http').createServer(app);
server.listen(appPort, function () {
    logger.info(`Api started at ${appPort}`);
});

// start listening for web sockets
const deviceServices = new DeviceServices();
deviceServices.init(server);
new GenericOperationController(apiRoute, [deviceServices], 'sendFilm');
