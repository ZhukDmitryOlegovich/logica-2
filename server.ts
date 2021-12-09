/* eslint-disable import/no-extraneous-dependencies */
import style from 'chalk';
import express from 'express';

const app = express();
const PORT = process.env.PORT ?? 4000;

const getTime = () => new Date().toLocaleString('ru', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

app.use(express.static('.'));

// app.get('/', (req, res) => {
// 	console.log(style.grey(getTime()), style.green(req.url), req.query);
// 	res.sendFile(path.join(root, 'static', 'index.html'));
// });

// app.get('*', (req, res) => {
// 	console.log(style.grey(getTime()), style.red(req.url));
// 	res.sendStatus(404);
// });

app.listen(PORT, () => {
	console.log(
		style.grey(getTime()),
		'Server listening',
		style.green(`http://localhost:${PORT}`),
	);
});
