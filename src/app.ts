import express, { Request, Response, RequestHandler } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';


import logger, { outStream } from './helpers/logger';
import { PORT, DB_HOST, DB_NAME } from './config';
import index from './routes/index';

const app: express.Application = express();
const port = process.env.PORT || PORT;

// let express know that it is running behind proxy
// app.set('trust proxy', 'loopback');

mongoose.connect(DB_HOST + '/' + DB_NAME, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })
	.then(() => {
		logger.info(`connected to database ${DB_NAME}`);
	}).catch((err: Error) => {
		// Handle initial connection failure
		logger.error(err);
		process.kill(process.pid, 'SIGTERM');
	});

mongoose.connection.on('error', (err: Error) => {
	// Handle connection failure after initial connection is established
	logger.error(err);
	process.kill(process.pid, 'SIGTERM');
});

// to prevent morgan from logging static requests place static declaration before morgan
app.use(express.static(process.cwd() + '/dist/dairy'));
app.use(morgan((tokens, req: Request, res: Response) => {
	return JSON.stringify(
		{
			'method': tokens.method(req, res),
			'url': tokens.url(req, res),
			'status': tokens.status(req, res),
			'response-time': `${tokens['response-time'](req, res)} ms`,
			'host': req.hostname
		});
}, { stream: outStream }));
morgan.token('host', (req: Request, res: Response) => {
	return req.hostname;
});

// cross origin middleware
app.use(cors());

// Only using json for api
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
app.use('/api', index);
app.get('*', (req, res) => {
	return res.sendFile(process.cwd() + '/dist/dairy/index.html');
});



// error handling middleware
app.use((err: Error, req: Request, res: Response, next: RequestHandler) => {
	logger.error(err);
	res.status(500).json({ msg: 'Something went wrong!' });
});


// handle process level events
process.on('SIGTERM', () => {
	// when process is killed SIGTERM signal is received
	console.log('SIGTERM signal received');
	server.close(async () => {
		//* close db connection
		await mongoose.connection.close((err) => {
			if (err) {
				console.debug('Error closing DB connection');
			}
			console.info('DB connection closed');
		});
		process.exit(1);
	});
});

process.on('SIGINT', () => {
	// When CTRL-C is pressed SIGINT signall is received
	logger.info('Bye...!');
	process.exit(1);
});

// winston doesn't handled promise rejection exception, handle those rejection here and pass on to winston
process.on('unhandledRejection', (reason, promise) => {
	throw reason;
});


const server = app.listen(port, () => {
	logger.info(`App listening on port: ${port}`);
});


/*
    ? When having problems with nodemon and getting error of `uncaughtException: listen EADDRINUSE: address already in use :::3000`
    ?    1. Get pid of process listening on port 3000
    ?        => lsof -i :3000
    ?    2. Get pid of parent process i.e. (nodemon)
    ?        => ps -Flww -p ${ppid}
    ?   3. Kill the process with pid ${ppid}
    ?        => kill ${ppid}
*/
