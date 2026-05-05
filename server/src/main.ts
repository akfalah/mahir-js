import 'dotenv/config';

import { logger } from './applications/logger';
import { server } from './applications/server';

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
});
