const appPort = 8080;
const logger = require("./utils/logger");
const bodyParser = require('body-parser');

// adapters
const DamnserialAdapter = require("./adapters/DamnserialAdapter");
const KinoHorrorNetAdapter = require("./adapters/KinoHorrorNetAdapter");
const adapters = [new DamnserialAdapter(), new KinoHorrorNetAdapter()];

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
app.listen(appPort, function () {
    logger.info(`Api started at ${appPort}`);
});