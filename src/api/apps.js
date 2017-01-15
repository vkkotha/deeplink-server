import resource from 'resource-router-middleware';
import apps from '../models/apps';

export default ({ config, db }) => resource({

	/** Property name to store preloaded entity on `request`. */
	id : 'app',

	/** For requests with an `id`, you can auto-load the entity.
	 *  Errors terminate the request, success sets `req[id] = data`.
	 */
	load(req, id, callback) {
		let app = apps.find( app => app.id===id ),
			err = app ? null : 'Not found';
		callback(err, app);
	},

	/** GET / - List all entities */
	index({ params }, res) {
		res.json(apps);
	},

	/** POST / - Create a new entity */
	create({ body }, res) {
		body.id = apps.length.toString(36);
		apps.push(body);
		res.json(body);
	},

	/** GET /:id - Return a given entity */
	read({ app }, res) {
		res.json(app);
	},

	/** PUT /:id - Update a given entity */
	update({ app, body }, res) {
		for (let key in body) {
			if (key!=='id') {
				app[key] = body[key];
			}
		}
		res.sendStatus(204);
	},

	/** DELETE /:id - Delete a given entity */
	delete({ app }, res) {
		apps.splice(apps.indexOf(app), 1);
		res.sendStatus(204);
	}
});