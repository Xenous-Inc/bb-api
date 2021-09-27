import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import authRouter from './src/routes/auth';
import notFound from './src/middlewares/notFound';
import boom from 'express-boom';
import userRouter from './src/routes/user';
import sensorRouter from './src/routes/sensor';

const app = express();

app.use(compression());
app.use(helmet());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(boom());

app.use('/user', userRouter);
app.use('/user/auth', authRouter);
app.use('/sensor', sensorRouter);
app.get('/ping', (req, res) => {
    return res.status(200).json('pong');
});
app.post('/post', (req, res) => {
    return res.status(200).json(req.body);
});

app.use(notFound);

export default app;
