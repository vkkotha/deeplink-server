
'use strict';

import http from 'http';
import path from 'path';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import es6Renderer from 'express-es6-template-engine';
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

	app.engine('html', es6Renderer);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'html');

	// internal middleware
	app.use(middleware({ config, db }));

	// api router
	app.use('/sl', sl({ config, db }));

	// api router
	app.use('/api', api({ config, db }));

	app.server.listen(process.env.PORT || config.port);

	console.log("service static files on /static from ", path.join(__dirname, '/public'));
	app.use('/static', express.static(path.join(__dirname, '/public')) );
	console.log("service static files on /static/libs from ", path.join(__dirname, '/../node_modules'));
	app.use('/static/libs', express.static(path.join(__dirname, '/../node_modules')) );
	app.use('/', function(req, res) {
		res.sendFile(path.join(__dirname, '/public/index.html'));
	});

	console.log(`Started on port ${app.server.address().port}`);
});

export default app;