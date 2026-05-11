'use strict';
// Loaded first by Mocha (see .mocharc.cjs). Ensures tests use LocalStorageStrategy
// even when backend/.env has PHOTO_STORAGE=s3 — dotenv will not override this.
process.env.PHOTO_STORAGE = 'local';
