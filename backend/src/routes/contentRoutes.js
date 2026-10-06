import { Router } from 'express';
import {
  destinationController,
  eventController,
  experienceController,
  storyController,
  tourController,
} from '../controllers/resources.js';
import { authorize, optionalAuth, protect } from '../middleware/auth.js';

function contentRouter(controller, { writeRoles = ['admin'] } = {}) {
  const router = Router();
  const canWrite = [protect, authorize(...writeRoles)];

  router.get('/', optionalAuth, controller.list);
  router.get('/:idOrSlug', optionalAuth, controller.getOne);
  router.post('/', ...canWrite, controller.create);
  router.patch('/:idOrSlug', ...canWrite, controller.update);
  router.delete('/:idOrSlug', ...canWrite, controller.remove);

  return router;
}

export const destinationRoutes = contentRouter(destinationController);
export const tourRoutes = contentRouter(tourController);
export const experienceRoutes = contentRouter(experienceController);
export const eventRoutes = contentRouter(eventController, { writeRoles: ['admin', 'organizer'] });
export const storyRoutes = contentRouter(storyController);
