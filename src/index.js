
'use strict';

import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import initDb from './db';
import middleware from './middleware';
import api from './api';
import sl from './sl';
import config from './config.json';

let app = express();
app.server = http.createServer(app);

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

// connect to db
initDb( db => {

	// internal middleware
	app.use(middleware({ config, db }));

	// api router
	app.use('/sl', sl({ config, db }));

	// api router
	app.use('/api', api({ config, db }));

	app.server.listen(process.env.PORT || config.port);

	console.log(`Started on port ${app.server.address().port}`);
});

export default app;