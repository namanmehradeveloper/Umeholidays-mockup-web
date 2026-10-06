import { Router } from 'express';
import { createUser, deleteUser, getUser, listUsers, updateUser } from '../controllers/userController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../models/User.js';

const fields = {
  name: { type: 'string', required: true, min: 2, max: 80 },
  email: { type: 'email', required: true },
  phone: { type: 'string', max: 20 },
  role: { type: 'string', enum: ROLES, default: 'user' },
};

const router = Router();

router.use(protect, authorize('admin'));

router.get('/', listUsers);
router.post('/', validate({ ...fields, password: { type: 'string', required: true, min: 8, max: 128 } }), createUser);
router.get('/:id', getUser);
router.patch('/:id', validate({
  ...fields,
  isActive: { type: 'boolean' },
  avatar: {
    type: 'string',
    max: 1000,
    allowEmpty: true,
    pattern: /^https?:\/\/.+/i,
    patternMessage: 'must be a valid image URL',
  },
}, { partial: true }), updateUser);
router.delete('/:id', deleteUser);

export default router;
