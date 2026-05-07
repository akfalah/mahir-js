import { Router } from 'express';

import { UserController } from '../controllers/user.controller';

export const userRouter = Router();

userRouter.get('/', UserController.index);
userRouter.get('/:id', UserController.show);
userRouter.post('/', UserController.store);
userRouter.patch('/:id', UserController.update);
userRouter.delete('/:id', UserController.destroy);
