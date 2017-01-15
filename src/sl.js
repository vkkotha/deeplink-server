import { Router } from 'express';
import { version } from '../package.json';

export default ({ config, db }) => {
	let sl = Router();

	// mount the facets resource
	sl.get('/', (req, res) => {
		res.json({ "test": "a" });
	});

	return sl;
}