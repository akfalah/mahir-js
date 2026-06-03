import { Router } from 'express';

import { ProgressController } from '../controllers/progress.controller';

export const progressRouter = Router();

progressRouter.get('/concepts', ProgressController.conceptProgresses);
progressRouter.get('/materials', ProgressController.materialProgresses);
progressRouter.get('/study-cases', ProgressController.studyCaseProgresses);
