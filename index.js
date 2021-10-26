import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import authRouter from './src/routes/auth';
import notFound from './src/middlewares/notFound';
import boom from 'express-boom';
import userRouter from './src/routes/user';
import sensorRouter from './src/routes/sensor';
import promBundle from 'express-prom-bundle';

const metricsMiddleware = promBundle({ includeMethod: true });
const app = express();

app.use(compression());
// app.use(metricsMiddleware);
app.use(helmet());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(boom());

app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/sensor', sensorRouter);

app.post('/ping', (req, res) => {
    console.log(req.body.aue);
    return res.status(200).json('pong');
});

app.use(notFound);

export default app;
