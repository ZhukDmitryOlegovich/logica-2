/* eslint-disable import/no-extraneous-dependencies */
import style from 'chalk';
import express from 'express';

const app = express();
const PORT = process.env.PORT ?? 3000;

const getTime = () => new Date().toLocaleString('ru', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const IS_URL = /(http\S+)/;

// eslint-disable-next-line no-console
const print = (...message: any[]) => console.log(
	style.grey(getTime()),
	...message.map((m) => (typeof m === 'string' ? m.replace(IS_URL, style.green('$1')) : m)),
);

app.use((req, _, next) => {
	print(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
	next();
});
app.use(express.static('.'));

app.listen(PORT, () => print('Server listening', `http://localhost:${PORT}`));
