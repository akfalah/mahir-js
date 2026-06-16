import 'dotenv/config';

import { logger } from './applications/logger';
import { server } from './applications/server';

const PORT = process.env.PORT || 8888

server.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
});
