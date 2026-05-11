/**
 * @module S3StorageStrategy
 * Concrete storage strategy that writes files to an Amazon S3 bucket.
 *
 * Enabled when PhotoService is constructed with `PHOTO_STORAGE=s3`.
 * Required env: `S3_BUCKET`, `AWS_REGION` (optional default in constructor);
 * AWS credentials via env vars or EC2 instance role. See `s3-instructions.md`.
 */
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
