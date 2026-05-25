# Essential Design Patterns

This document covers five key design patterns from the
[Refactoring.Guru catalog](https://refactoring.guru/design-patterns/catalog)
implemented in the backend of this TypeScript / Express 5 / Mongoose / Clerk
equipment rental system.

---

## 1. State — Asset States

**Category:** Behavioral

> State lets an object alter its behavior when its internal state changes. It
> appears as if the object changed its class.

### Overview

The State pattern is implemented with one class per asset status, a context
class (`AssetStateMachine`) that delegates to the current state, and singletons
for each state object. Before this refactoring, asset status management used a
string enum with inline conditional logic — there was **no validation of valid
transitions**. The State pattern replaced that with one class per state, each
knowing what transitions are valid from itself.

### State machine transition diagram

```
Available ────────→ Pending Rental ──→ Rented ──→ Pending Return ──→ Available
    │                      │              │              │
    └──→ Maintenance        └──→ Available └──→ Maintenance └──→ Rented
                                                                   └──→ Maintenance
                                                   Maintenance ──→ Available
```

### Source files

#### `backend/services/asset-states/AssetState.ts` — State interface

```ts
export abstract class AssetState {

  abstract getName(): string;

  getValidTransitions(): string[] {
    return [];
  }

  canTransitionTo(newStatus: string): boolean {
    return this.getValidTransitions().includes(newStatus);
  }

  shouldClearRentalData(newStatus: string): boolean {
    return false;
  }
}

export default AssetState;
```

#### `backend/services/asset-states/AvailableState.ts`

```ts
import AssetState from './AssetState';

export class AvailableState extends AssetState {
  getName(): string {
    return 'Available';
  }

  override getValidTransitions(): string[] {
    return ['Pending Rental', 'Maintenance'];
  }
}

export default AvailableState;
```

#### `backend/services/asset-states/PendingRentalState.ts`

```ts
import AssetState from './AssetState';

export class PendingRentalState extends AssetState {
  getName(): string {
    return 'Pending Rental';
  }

  override getValidTransitions(): string[] {
    return ['Rented', 'Available'];
  }

  override shouldClearRentalData(newStatus: string): boolean {
    return newStatus === 'Available';
  }
}

export default PendingRentalState;
```

#### `backend/services/asset-states/RentedState.ts`

```ts
import AssetState from './AssetState';

export class RentedState extends AssetState {
  getName(): string {
    return 'Rented';
  }

  override getValidTransitions(): string[] {
    return ['Pending Return', 'Maintenance'];
  }
}

export default RentedState;
```

#### `backend/services/asset-states/PendingReturnState.ts`

```ts
import AssetState from './AssetState';

export class PendingReturnState extends AssetState {
  getName(): string {
    return 'Pending Return';
  }

  override getValidTransitions(): string[] {
    return ['Available', 'Rented', 'Maintenance'];
  }

  override shouldClearRentalData(newStatus: string): boolean {
    return newStatus === 'Available' || newStatus === 'Maintenance';
  }
}

export default PendingReturnState;
```

#### `backend/services/asset-states/MaintenanceState.ts`

```ts
import AssetState from './AssetState';

export class MaintenanceState extends AssetState {
  getName(): string {
    return 'Maintenance';
  }

  override getValidTransitions(): string[] {
    return ['Available'];
  }
}

export default MaintenanceState;
```

#### `backend/services/asset-states/AssetStateMachine.ts` — Context

```ts
import AssetState from './AssetState';
import AvailableState from './AvailableState';
import PendingRentalState from './PendingRentalState';
import RentedState from './RentedState';
import PendingReturnState from './PendingReturnState';
import MaintenanceState from './MaintenanceState';
import { TransitionAuthoriser } from './TransitionAuthoriser';

const STATE_MAP: Record<string, AssetState> = {
  'Available':       new AvailableState(),
  'Pending Rental':  new PendingRentalState(),
  'Rented':          new RentedState(),
  'Pending Return':  new PendingReturnState(),
  'Maintenance':     new MaintenanceState(),
};

export class AssetStateMachine {
  private _state: AssetState;

  constructor(currentStatus: string) {
    const state = STATE_MAP[currentStatus];
    if (!state) {
      throw new Error(`Unknown asset status: "${currentStatus}"`);
    }
    this._state = state;
  }

  getCurrentStatus(): string {
    return this._state.getName();
  }

  getValidTransitions(): string[] {
    return this._state.getValidTransitions();
  }

  canTransitionTo(newStatus: string, authoriser: TransitionAuthoriser): boolean {
    if (!this._state.canTransitionTo(newStatus)) {
      return false;
    }
    return authoriser.canTransition(this._state.getName(), newStatus);
  }

  shouldClearRentalData(newStatus: string): boolean {
    return this._state.shouldClearRentalData(newStatus);
  }
}

export default AssetStateMachine;
```

---

## 2. Strategy — Photo Upload (Storage)

**Category:** Behavioral

> Strategy lets you define a family of algorithms, put each into a separate
> class, and make their objects interchangeable.

### Overview

The `StorageStrategy` abstract class defines a common interface for file I/O.
Two concrete implementations — `LocalStorageStrategy` and `S3StorageStrategy` —
are interchangeable. The `PhotoService` selects one at construction time based
on the `PHOTO_STORAGE` environment variable. This means the rest of the
application (controllers, the Composite delete method) never knows or cares
whether files are stored on disk or in S3.

### Source files

#### `backend/services/photo/storage/StorageStrategy.ts` — Strategy interface

```ts
export abstract class StorageStrategy {
  abstract save(directory: string, filename: string, buffer: Buffer): Promise<string>;
  abstract delete(relativePath: string | null): Promise<void>;
  abstract getUrl(relativePath: string): string;
}

export default StorageStrategy;
```

#### `backend/services/photo/storage/LocalStorageStrategy.ts`

```ts
import fs from 'fs/promises';
import path from 'path';
import { UPLOADS_ROOT } from '../../../config/paths';
import StorageStrategy from './StorageStrategy';

export class LocalStorageStrategy extends StorageStrategy {
  async save(directory: string, filename: string, buffer: Buffer): Promise<string> {
    const dirPath = path.join(UPLOADS_ROOT, directory);
    await fs.mkdir(dirPath, { recursive: true });

    const filePath = path.join(dirPath, filename);
    await fs.writeFile(filePath, buffer);

    return `/uploads/${directory}/${filename}`;
  }

  async delete(relativePath: string | null): Promise<void> {
    if (!relativePath) return;

    const filePath = path.join(UPLOADS_ROOT, path.basename(path.dirname(relativePath)), path.basename(relativePath));
    try {
      await fs.unlink(filePath);
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  getUrl(relativePath: string): string {
    return relativePath;
  }
}

export default LocalStorageStrategy;
```

#### `backend/services/photo/storage/S3StorageStrategy.ts`

```ts
import StorageStrategy from './StorageStrategy';

type AwsS3Module = {
  S3Client: new (config: { region: string }) => { send(command: unknown): Promise<unknown> };
  PutObjectCommand: new (input: Record<string, unknown>) => unknown;
  DeleteObjectCommand: new (input: Record<string, unknown>) => unknown;
};

const AWS_SDK_PACKAGE = '@aws-sdk/client-s3';

const loadAwsS3Module = (): AwsS3Module => {
  try {
    return require(AWS_SDK_PACKAGE) as AwsS3Module;
  } catch {
    throw new Error(
      `S3StorageStrategy requires ${AWS_SDK_PACKAGE}. Install it before setting PHOTO_STORAGE=s3.`,
    );
  }
};

export class S3StorageStrategy extends StorageStrategy {
  private readonly bucket: string;
  private readonly region: string;
  private readonly publicBaseUrl: string;
  private readonly client: InstanceType<AwsS3Module['S3Client']>;
  private readonly PutObjectCommand: AwsS3Module['PutObjectCommand'];
  private readonly DeleteObjectCommand: AwsS3Module['DeleteObjectCommand'];

  constructor() {
    super();

    if (!process.env.S3_BUCKET) {
      throw new Error('S3StorageStrategy requires S3_BUCKET to be set.');
    }

    this.bucket = process.env.S3_BUCKET;
    this.region = process.env.AWS_REGION || 'ap-southeast-2';
    this.publicBaseUrl = (process.env.S3_PUBLIC_BASE_URL || `https://${this.bucket}.s3.${this.region}.amazonaws.com`).replace(/\/+$/, '');

    const { S3Client, PutObjectCommand, DeleteObjectCommand } = loadAwsS3Module();
    this.client = new S3Client({ region: this.region });
    this.PutObjectCommand = PutObjectCommand;
    this.DeleteObjectCommand = DeleteObjectCommand;
  }

  async save(directory: string, filename: string, buffer: Buffer): Promise<string> {
    const key = `${directory}/${filename}`;

    await this.client.send(new this.PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: this.contentTypeFor(filename),
    }));

    return this.getUrl(key);
  }

  async delete(relativePath: string | null): Promise<void> {
    if (!relativePath) return;

    const key = this.keyFromUrlOrPath(relativePath);
    if (!key) return;

    await this.client.send(new this.DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
  }

  getUrl(relativePath: string): string {
    const key = this.normaliseKey(relativePath);
    return `${this.publicBaseUrl}/${this.encodeKey(key)}`;
  }

  private keyFromUrlOrPath(value: string): string {
    if (!value.startsWith('http')) {
      return this.normaliseKey(value);
    }

    try {
      const url = new URL(value);
      const publicBaseUrl = new URL(this.publicBaseUrl);
      const decodedPath = decodeURIComponent(url.pathname);

      if (url.origin === publicBaseUrl.origin) {
        const basePath = publicBaseUrl.pathname.replace(/\/+$/, '');
        const keyPath = basePath && decodedPath.startsWith(`${basePath}/`)
          ? decodedPath.slice(basePath.length + 1)
          : decodedPath;

        return this.normaliseKey(keyPath);
      }

      if (url.hostname === `${this.bucket}.s3.${this.region}.amazonaws.com`) {
        return this.normaliseKey(decodedPath);
      }
    } catch {
      // Fall through to best-effort path handling below.
    }

    return this.normaliseKey(value);
  }

  private normaliseKey(value: string): string {
    return value
      .split('?')[0]
      .replace(/^\/+/, '')
      .replace(/^uploads\//, '');
  }

  private encodeKey(key: string): string {
    return key.split('/').map(encodeURIComponent).join('/');
  }

  private contentTypeFor(filename: string): string {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    return 'image/jpeg';
  }
}

export default S3StorageStrategy;
```

### Runtime selection in PhotoService

```ts
constructor() {
  const useS3 = process.env.PHOTO_STORAGE === 's3';
  this.storageStrategy = useS3 ? new S3StorageStrategy() : new LocalStorageStrategy();
}
```

---

## 3. Composite — Product Group

**Category:** Structural

> Composite lets you compose objects into tree structures and then work with
> these structures as if they were individual objects.

### Overview

The Composite pattern wraps Mongoose documents in wrapper classes that
implement a uniform `InventoryComponent` interface over the three-level entity
hierarchy:

```
ProductGroupComponent  →  AssetTypeComponent  →  AssetComponent
    (composite)               (composite)           (leaf)
```

Controllers call `root.delete()` and don't need to know the tree depth or
composition — the Composite handles recursion automatically.

### Source files

#### `backend/services/inventory/InventoryComponent.ts` — Component interface

```ts
export abstract class InventoryComponent {
  protected doc: any;

  getId(): string {
    return (this.doc as any)._id.toString();
  }

  abstract getName(): string;

  getChildren(): InventoryComponent[] { return []; }

  protected _collectOwnPhotoPaths(): string[] {
    const paths: string[] = [];
    if (this.doc.imageUrl)     paths.push(this.doc.imageUrl);
    if (this.doc.thumbnailUrl) paths.push(this.doc.thumbnailUrl);
    return paths;
  }

  protected async _deleteOwnPhotos(storageStrategy: any): Promise<void> {
    if (storageStrategy) {
      if (this.doc.imageUrl)     await storageStrategy.delete(this.doc.imageUrl);
      if (this.doc.thumbnailUrl) await storageStrategy.delete(this.doc.thumbnailUrl);
    }
  }

  getPhotoPaths(): string[] {
    const paths = this._collectOwnPhotoPaths();
    for (const child of this.getChildren()) {
      paths.push(...child.getPhotoPaths());
    }
    return paths;
  }

  async delete(storageStrategy: any): Promise<void> {
    for (const child of this.getChildren()) {
      await child.delete(storageStrategy);
    }
    await this._deleteOwnPhotos(storageStrategy);
    await this._deleteSelf();
  }

  protected abstract _deleteSelf(): Promise<void>;
}

export default InventoryComponent;
```

#### `backend/services/inventory/AssetComponent.ts` — Leaf

```ts
import InventoryComponent from './InventoryComponent';
import Asset, { AssetDocument } from '../../models/Asset';

export class AssetComponent extends InventoryComponent {
  constructor(assetDoc: AssetDocument) {
    super();
    this.doc = assetDoc;
  }

  getName(): string     { return this.doc.name; }

  protected async _deleteSelf(): Promise<void> {
    await Asset.findByIdAndDelete(this.doc._id);
  }
}

export default AssetComponent;
```

#### `backend/services/inventory/AssetTypeComponent.ts` — Composite

```ts
import InventoryComponent from './InventoryComponent';
import AssetType, { AssetTypeDocument } from '../../models/AssetType';
import AssetComponent from './AssetComponent';

export class AssetTypeComponent extends InventoryComponent {
  public children: AssetComponent[] = [];

  constructor(typeDoc: AssetTypeDocument) {
    super();
    this.doc = typeDoc;
  }

  getName(): string     { return this.doc.name; }
  override getChildren(): InventoryComponent[] { return this.children; }

  protected async _deleteSelf(): Promise<void> {
    await AssetType.findByIdAndDelete(this.doc._id);
  }
}

export default AssetTypeComponent;
```

#### `backend/services/inventory/ProductGroupComponent.ts` — Root composite

```ts
import InventoryComponent from './InventoryComponent';
import ProductGroup, { ProductGroupDocument } from '../../models/ProductGroup';
import AssetTypeComponent from './AssetTypeComponent';

export class ProductGroupComponent extends InventoryComponent {
  public children: AssetTypeComponent[] = [];

  constructor(groupDoc: ProductGroupDocument) {
    super();
    this.doc = groupDoc;
  }

  getName(): string     { return this.doc.name; }
  override getChildren(): InventoryComponent[] { return this.children; }

  protected async _deleteSelf(): Promise<void> {
    await ProductGroup.findByIdAndDelete(this.doc._id);
  }
}

export default ProductGroupComponent;
```

#### `backend/services/inventory/InventoryTreeBuilder.ts` — Tree builder

```ts
import ProductGroup, { ProductGroupDocument } from '../../models/ProductGroup';
import AssetType, { AssetTypeDocument } from '../../models/AssetType';
import Asset, { AssetDocument } from '../../models/Asset';

import ProductGroupComponent from './ProductGroupComponent';
import AssetTypeComponent from './AssetTypeComponent';
import AssetComponent from './AssetComponent';

export class InventoryTreeBuilder {

  static async fromGroupId(groupId: string): Promise<ProductGroupComponent | null> {
    const groupDoc = await ProductGroup.findById(groupId);
    if (!groupDoc) return null;

    const group = new ProductGroupComponent(groupDoc as ProductGroupDocument);

    const typeDocs = await AssetType.find({ groupId });
    for (const typeDoc of typeDocs) {
      const typeNode = await InventoryTreeBuilder._buildTypeNode(typeDoc as AssetTypeDocument);
      group.children.push(typeNode);
    }

    return group;
  }

  static async fromTypeId(typeId: string): Promise<AssetTypeComponent | null> {
    const typeDoc = await AssetType.findById(typeId);
    if (!typeDoc) return null;

    return InventoryTreeBuilder._buildTypeNode(typeDoc as AssetTypeDocument);
  }

  static async fromAssetId(assetId: string): Promise<AssetComponent | null> {
    const assetDoc = await Asset.findById(assetId);
    if (!assetDoc) return null;

    return new AssetComponent(assetDoc as AssetDocument);
  }

  private static async _buildTypeNode(typeDoc: AssetTypeDocument): Promise<AssetTypeComponent> {
    const typeNode = new AssetTypeComponent(typeDoc);

    const assetDocs = await Asset.find({ typeId: typeDoc._id });
    for (const assetDoc of assetDocs) {
      typeNode.children.push(new AssetComponent(assetDoc as AssetDocument));
    }

    return typeNode;
  }
}

export default InventoryTreeBuilder;
```

### Client code — controllers

```ts
const root = await InventoryTreeBuilder.fromGroupId(req.params.id);
if (!root) throw new NotFoundError('Group not found');
await root.delete((photoService as any).storageStrategy);
res.json({ success: true });
```

---

## 4. Adapter — Clerk Adapter

**Category:** Structural

> Adapter allows objects with incompatible interfaces to collaborate.

### Overview

The `ClerkAuthAdapter` wraps the `@clerk/express` library behind a stable
`AuthAdapter` interface. No consumer outside `ClerkAuthAdapter.ts` imports from
`@clerk/express`. Replacing Clerk with Auth0, Firebase Auth, or any other
provider requires only a new adapter class — zero changes to controllers,
routes, or business logic.

The adapter translates three kinds of Clerk coupling:

| Clerk concern | Clerk-specific detail | Adapter method | Consumer sees |
|---|---|---|---|
| Middleware | `clerkMiddleware()` / `requireAuth()` | `contextMiddleware()` / `requireAuth()` | Consistent calling convention |
| Request auth | `req.auth` is a function in v2, object in v1 | `getUserId(req)` | `string \| null` |
| User data | `emailAddresses[0]`, `firstName`/`lastName`, `publicMetadata.role` | `getUser()` / `getUsers()` | `{ id, email, name, role }` |

### Source files

#### `backend/services/auth/AuthAdapter.ts` — Target interface

```ts
import { Request, RequestHandler } from 'express';

export interface NormalisedUser {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
}

export abstract class AuthAdapter {
  abstract contextMiddleware(): RequestHandler;
  abstract requireAuth(): RequestHandler;
  abstract adminOnly(): RequestHandler;
  abstract getUserId(req: Request): string | undefined | null;
  abstract getUser(userId: string): Promise<NormalisedUser>;
  abstract getUsers(userIds: string[] | null | undefined): Promise<Record<string, NormalisedUser>>;
}

export default AuthAdapter;
```

#### `backend/services/auth/ClerkAuthAdapter.ts` — Concrete adapter

```ts
import { Request, RequestHandler } from 'express';
import AuthAdapter, { NormalisedUser } from './AuthAdapter';

class ClerkAuthAdapter extends AuthAdapter {

  contextMiddleware(): RequestHandler {
    const { clerkMiddleware } = require('@clerk/express');
    return clerkMiddleware();
  }

  requireAuth(): RequestHandler {
    const { requireAuth } = require('@clerk/express');
    return requireAuth();
  }

  adminOnly(): RequestHandler {
    return async (req: Request, res: any, next: any) => {
      try {
        const userId = this.getUserId(req);
        if (!userId) {
          return res.status(403).json({ message: 'Admin access required' });
        }
        const user = await this.getUser(userId);
        if (user.role !== 'admin') {
          return res.status(403).json({ message: 'Admin access required' });
        }
        next();
      } catch (err: any) {
        console.error('[adminOnly] error:', err?.message ?? err);
        res.status(403).json({ message: 'Admin access required' });
      }
    };
  }

  getUserId(req: Request): string | undefined {
    const auth = (req as any).auth;
    return typeof auth === 'function' ? auth()?.userId : auth?.userId;
  }

  async getUser(userId: string): Promise<NormalisedUser> {
    const { clerkClient } = require('@clerk/express');
    const user = await clerkClient.users.getUser(userId);
    return this._normaliseUser(user);
  }

  async getUsers(userIds: string[] | null | undefined): Promise<Record<string, NormalisedUser>> {
    if (!userIds || userIds.length === 0) return {};

    const { clerkClient } = require('@clerk/express');
    try {
      const { data: users } = await clerkClient.users.getUserList({
        userId: userIds,
      });
      const map: Record<string, NormalisedUser> = {};
      users.forEach((u: any) => { map[u.id] = this._normaliseUser(u); });
      return map;
    } catch {
      return {};
    }
  }

  _normaliseUser(clerkUser: any): NormalisedUser {
    return {
      id:    clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
      name:  [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
      role:  clerkUser.publicMetadata?.role ?? null,
    };
  }
}

export default new ClerkAuthAdapter();
```

### Route-level usage

```ts
router.post('/', auth.requireAuth(), auth.adminOnly(), createAsset);
```

The chain: `auth.requireAuth()` (401 if unauthenticated) → `auth.adminOnly()`
(403 if not admin) → `createAsset` (terminal handler).

---

## 5. Chain of Responsibility — Admin Only Middleware

**Category:** Behavioral

> Chain of Responsibility lets you pass requests along a chain of handlers. Upon
> receiving a request, each handler decides either to process the request or to
> pass it to the next handler in the chain.

### Overview

Express middleware is a textbook implementation of the Chain of Responsibility
pattern. Each handler receives the request, performs its work, and calls
`next()` to pass control to the next handler. A handler can **short-circuit**
the chain by sending a response instead of calling `next()`.

The `adminOnly` middleware is the clearest example: it checks a condition (is
the user an admin?), handles the request itself with `403` if the condition
fails (chain stops), or calls `next()` to pass the request along to the next
handler.

### Typical chain for an admin-only route

```
auth.requireAuth() → auth.adminOnly() → controller
```

1. `auth.requireAuth()` — checks authentication. Unauthenticated → `401`,
   chain stops.
2. `auth.adminOnly()` — checks admin role. Non-admin → `403`, chain stops.
3. `controller` — the terminal handler that processes the business logic.

### Photo upload — extended chain

```
auth.requireAuth() → auth.adminOnly() → multer.single('photo') → validateFileType → uploadPhoto
```

1. `auth.requireAuth()` — checks authentication (401 if unauthenticated).
2. `auth.adminOnly()` — checks admin role (403 if not admin).
3. `multer.single('photo')` — parses multipart data; enforces 5MB file size
   limit.
4. `validateFileType` — checks MIME type is `image/jpeg`, `image/png`, or
   `image/webp`. Throws `ValidationError` (400) if not.
5. `uploadPhoto('group')` — the terminal handler: processes and saves the
   photo.

### Source files

#### `backend/services/auth/ClerkAuthAdapter.ts` — `adminOnly()` handler

```ts
adminOnly(): RequestHandler {
  return async (req: Request, res: any, next: any) => {
    try {
      const userId = this.getUserId(req);
      if (!userId) {
        return res.status(403).json({ message: 'Admin access required' });
      }
      const user = await this.getUser(userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      next();
    } catch (err: any) {
      console.error('[adminOnly] error:', err?.message ?? err);
      res.status(403).json({ message: 'Admin access required' });
    }
  };
}
```

#### `backend/middleware/uploadMiddleware.ts` — upload validation chain

```ts
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../services/errors/AppError';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

export const validateFileType = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();
  if (!ALLOWED_MIMETYPES.includes(req.file.mimetype)) {
    throw new ValidationError(
      `Invalid file type: ${req.file.mimetype}. Allowed types: ${ALLOWED_MIMETYPES.join(', ')}`,
    );
  }
  next();
};
```

#### `backend/services/errors/AppError.ts` — error hierarchy for the terminal handler

```ts
export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) { super(message, 400); }
}

export class NotFoundError extends AppError {
  constructor(message: string) { super(message, 404); }
}

export class AuthorisationError extends AppError {
  constructor(message: string) { super(message, 403); }
}

export class AuthenticationError extends AppError {
  constructor(message: string) { super(message, 401); }
}
```

#### `backend/server.ts` — terminal error handler

The global error-handling middleware is the terminal handler in the chain.
Express 5 catches rejected promises from `async` handlers and forwards them
here. `AppError` subclasses carry their own HTTP status code; unknown errors
default to 500 and their message is hidden to prevent information leakage.

```ts
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err instanceof AppError ? err.statusCode : 500;
  const message = status < 500 ? err.message : 'Internal server error';
  res.status(status).json({ message });
});
```

#### `backend/routes/assetRoutes.ts` — route definitions with chain wiring

```ts
router.post('/',                         auth.requireAuth(), auth.adminOnly(),  createAsset);
router.post('/:id/photo',                auth.requireAuth(), auth.adminOnly(),  upload.single('photo'), validateFileType, uploadPhoto('asset'));
router.delete('/:id',                    auth.requireAuth(), auth.adminOnly(),  deleteAsset);
router.patch('/bulk-status',             auth.requireAuth(),                    bulkUpdateStatus);
router.post('/request-rental',           auth.requireAuth(),                    requestRental);
```
