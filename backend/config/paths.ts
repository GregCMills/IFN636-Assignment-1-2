import path from 'path';

export const BACKEND_ROOT = path.resolve(process.cwd());

export const UPLOADS_ROOT = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(BACKEND_ROOT, 'uploads');

export const SEED_IMAGES_ROOT = process.env.SEED_IMAGES_DIR
  ? path.resolve(process.env.SEED_IMAGES_DIR)
  : path.join(BACKEND_ROOT, 'data', 'images');
