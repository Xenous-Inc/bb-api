import Boom from '@hapi/boom';
import { ERROR_MESSAGES } from '../utils/constants';

export default (req, res, next) =>
    res.json(Boom.notFound(ERROR_MESSAGES.notFound).output.payload);
