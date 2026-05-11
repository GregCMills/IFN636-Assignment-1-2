# S3 image storage: setup for local, EC2, and DigitalOcean

This guide assumes you want **one shared Amazon S3 bucket** for uploads. After you merge to **`main`**, GitHub Actions deploys to **both** your EC2 runner and your DigitalOcean droplet; both backends read the **same environment variables** from the **`PROD`** GitHub secret (written to `backend/.env` on each server).

If anything sounds unfamiliar, do the steps in order. Skip nothing.

---

## 0. How deploy actually works (so expectations are correct)

- Opening a **pull request** runs **tests only**. It does **not** deploy.
- **Merging** (or pushing) to **`main`** runs tests, then deploys to **EC2** and **DigitalOcean** (see `.github/workflows/ci.yml`).
- So: **test locally on a branch → open PR → merge to `main`** to turn S3 on in production.

---

## 1. Repo code (already in this repository)

This repo already includes:

- `@aws-sdk/client-s3` in `backend/package.json` (with lockfile).
- `PhotoService` choosing **`S3StorageStrategy`** when **`PHOTO_STORAGE=s3`**, otherwise **`LocalStorageStrategy`**.

On a fresh machine run:

```bash
cd backend && npm ci
```

**Rules (unchanged):**

- If **`PHOTO_STORAGE` is unset or not `s3`** → local disk (good for most developers and for CI tests).
- If **`PHOTO_STORAGE=s3`** → you **must** also set **`S3_BUCKET`** (and region / credentials — see below) or the server will fail at startup when it builds `S3StorageStrategy`.

Run checks:

```bash
cd backend && npm run typecheck && npm run build
```

---

## 2. AWS: create the S3 bucket (console)

1. Log in to [AWS Console](https://console.aws.amazon.com).
2. Top search box: type **S3** → open **S3**.
3. **Buckets** → **Create bucket**.
4. **Bucket name**: pick something globally unique, e.g. `ifn636-yourname-images`.
5. **AWS Region**: pick one and **remember it** (example: **Asia Pacific (Sydney)** → `ap-southeast-2`). You will put this in `AWS_REGION`.
6. **Block Public Access**: for a **simple class / assessment** setup where the browser loads images via a normal `https://...` URL:
   - Uncheck **Block all public access** (and confirm).
   - **Trade-off:** objects can be read by anyone who has the URL. Fine for a throwaway project; **not** ideal for private photos.
7. Leave other defaults unless you know you need them → **Create bucket**.

---

## 3. AWS: bucket policy so the browser can show images

The app stores URLs like:

`https://YOUR-BUCKET.s3.YOUR-REGION.amazonaws.com/groups/SOMEID.jpg`

The browser must be allowed to **GET** those objects.

1. Open your bucket → **Permissions** tab.
2. **Bucket policy** → **Edit**.
3. Paste (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

4. Save.

The `"Version": "2012-10-17"` line is **normal**. It is the policy language version, not “from 2012 only.”

---

## 4. AWS: IAM policy for upload + delete (used by your Node app)

Your backend needs permission to **upload** and **delete** objects (not public write — only the IAM identity you use).

1. AWS Console → **IAM** (search “IAM” in the top bar).
2. Left menu → **Policies** → **Create policy** → **JSON** tab.
3. Paste (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

4. **Next** → name it e.g. `IFN636-S3-Images` → **Create policy**.

You attach this policy to **one IAM user** (next section). For this assessment we use **the same access keys everywhere**: your laptop, DigitalOcean, **and** EC2. That avoids EC2 instance roles and cross-account role policy headaches. Long-lived shared keys are **not** what you’d do for real production security; they’re fine if you’re deleting the project after the subject finishes.

---

## 5. One IAM user + access keys (laptop, DigitalOcean, and EC2)

Create **one** programmatic user. Reuse its keys on **all** backends that use `PHOTO_STORAGE=s3`.

**Create the user:**

1. IAM → **Users** → **Create user**.
2. User name: e.g. `ifn636-app-s3`.
3. **Next** → **Attach policies directly** → pick **`IFN636-S3-Images`** (the policy you created) → **Next** → **Create user**.

**Create access keys:**

1. Open that user → tab **Security credentials**.
2. **Create access key**.
3. Use case: **Application running outside AWS** (or closest match) → **Next** → **Create access key**.
4. **Copy both:**
   - Access key ID → `AWS_ACCESS_KEY_ID`
   - Secret access key → `AWS_SECRET_ACCESS_KEY`  
   You cannot see the secret again later. If you lose it, make a new key.

**Never commit these.** They go in **local `.env`** (gitignored) and in **GitHub `PROD`** (see section 7). Deploy writes the same `PROD` to **both** EC2 and DigitalOcean, so **both servers get the same keys** automatically.

**EC2 in another AWS account:** keys still work as long as the IAM user (and its policy) lives in the **same account as the S3 bucket**, or you’ve set up cross-account access on the bucket. Re-keying is the blunt fix if that’s wrong.

---

## 6. Environment variables (what the backend expects)

These are read from **`backend/.env`** because `server.ts` calls `dotenv.config()` first.

| Variable | Required when `PHOTO_STORAGE=s3` | Typical value |
|----------|----------------------------------|---------------|
| `PHOTO_STORAGE` | Yes (set to `s3`) | `s3` |
| `S3_BUCKET` | Yes | your bucket name |
| `AWS_REGION` | Yes | e.g. `ap-southeast-2` |
| `AWS_ACCESS_KEY_ID` | Yes | from IAM user |
| `AWS_SECRET_ACCESS_KEY` | Yes | from IAM user |
| `S3_PUBLIC_BASE_URL` | Optional | Defaults to `https://BUCKET.s3.REGION.amazonaws.com` — use this if you add CloudFront later |

With **`PHOTO_STORAGE=s3`**, the SDK needs credentials on the machine. This guide assumes you always set the two **`AWS_*`** keys (same pair on laptop, droplet, and EC2).

---

## 7. GitHub: put production lines in `PROD` secret

Your workflow writes `secrets.PROD` to `backend/.env` on deploy.

1. GitHub repo → **Settings** → **Secrets and variables** → **Actions**.
2. **`PROD`** → **Edit** (or create it).
3. Keep **every line you already have** (MongoDB, Clerk, `PORT`, etc.). **Append** (example — fix values):

```env
PHOTO_STORAGE=s3
S3_BUCKET=ifn636-yourname-images
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

4. Save.

**Important:** Until this is merged and deploy runs, production servers still use **old** `.env`. That is why you test locally first (next section).

---

## 8. Test locally **before** merging to `main`

**Goal:** same code path as production (`PHOTO_STORAGE=s3`), but on your laptop.

1. Create/checkout a **feature branch** (not `main`).

2. In `backend/`, create `.env` (already gitignored) or edit it. You need your **normal** dev vars **plus** the S3 block from section 6 (use the **same** bucket as production, or a **separate dev bucket** if you prefer not to clutter prod data).

3. Install and run backend:

```bash
cd backend
npm ci
npm run dev
```

4. Run frontend pointing at this backend (however you usually develop).

5. In the UI, **upload an image** for a group/type/asset.

6. **Check success:**
   - In the browser **Network** tab, the image URL should start with **`https://`** and your **bucket host**, not `/uploads/...`.
   - In **S3 console** → your bucket → you should see folders like **`groups/`**, **`types/`**, **`assets/`** with `.jpg` / `.png` files.

7. Run tests (CI will run these on PR):

```bash
cd backend && npm test
cd ../frontend && npm test
```

By default, tests should **not** set `PHOTO_STORAGE=s3`, so they keep using **local** storage and do not need AWS.

8. Open a **pull request** into `main`. Wait for **green** CI.

9. **Merge** to `main`. That push triggers **EC2** and **DigitalOcean** deploy jobs.

10. After deploy, repeat the upload test on **each** live site. Both should write into the **same bucket** (same prefix keys; different servers).

---

## 9. Troubleshooting (very short)

| Symptom | Likely cause |
|---------|----------------|
| Backend crashes on start when `PHOTO_STORAGE=s3` | Missing `S3_BUCKET`, or `@aws-sdk/client-s3` not installed / lockfile not deployed |
| Upload “works” but image broken in browser | Bucket or object not publicly readable; fix bucket policy (section 3) |
| Access Denied on upload | IAM user missing `PutObject` on `arn:aws:s3:::bucket/*`, wrong account, or bad keys |
| `npm test` fails after your change | Tests accidentally set `PHOTO_STORAGE=s3` without mocks — unset it for tests |
| Old records still use `/uploads/...` | Those rows were created before S3; re-upload or migrate URLs |

---

## 10. After the assessment

- Delete the **IAM user access keys** (or the whole user).
- Empty and delete the **S3 bucket** (and delete objects first if versioning complicates).
- Remove **`PHOTO_STORAGE` / S3 keys** from **`PROD`** in GitHub when you tear things down.

---

## Checklist (copy/paste)

- [x] `@aws-sdk/client-s3` in `backend` + lockfile (done in repo)  
- [x] `PhotoService` uses `S3StorageStrategy` when `PHOTO_STORAGE=s3` (done in repo)  
- [ ] S3 bucket created  
- [ ] Bucket policy allows public **read**  
- [ ] IAM policy allows **PutObject / DeleteObject / GetObject** on `bucket/*`  
- [ ] One IAM user + keys reused on **laptop, DigitalOcean, and EC2** (via `PROD` on servers)  
- [ ] `PROD` secret updated with S3 vars + same `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`  
- [ ] Local upload test → object visible in S3  
- [ ] PR green → merge `main` → verify EC2 + DO uploads  
