import { ERROR_MESSAGES } from '../utils/constants';

export default (req, res) => res.boom.notFound(ERROR_MESSAGES.notFound);
