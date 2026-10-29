import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import type { NextFunction, Request, Response } from "express";
import { UPLOADS_DIR } from "../lib/paths.ts";
import { safeFilename } from "../lib/sanitize.ts";
import { readSubmissions, writeSubmissions } from "../lib/store.ts";
import { notify } from "../lib/mailer.ts";
import { failure, success, validationFailure } from "../lib/respond.ts";
import { valuationSchema } from "../validators/index.ts";

const MAX_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
};

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: MAX_FILES },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED[file.mimetype]?.includes(ext)) return cb(null, true);
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  },
});

/** Check real file signature, not just the client-declared MIME type. */
function hasValidSignature(file: Express.Multer.File): boolean {
  const b = file.buffer;
  switch (file.mimetype) {
    case "image/jpeg":
      return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    case "image/png":
      return b.subarray(0, 4).toString("hex") === "89504e47";
    case "application/pdf":
      return b.subarray(0, 4).toString("latin1") === "%PDF";
    case "image/webp":
      return b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP";
    default:
      return false;
  }
}

/** multer wrapper so upload problems come back as our JSON envelope, never an HTML 500. */
export function parseUploads(req: Request, res: Response, next: NextFunction) {
  uploader.array("files", MAX_FILES)(req, res, (err: unknown) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const msg =
        err.code === "LIMIT_FILE_SIZE"
          ? "Each file must be 25MB or smaller."
          : err.code === "LIMIT_FILE_COUNT"
            ? `You can upload up to ${MAX_FILES} files.`
            : "Invalid file type. Only PNG, JPG, WEBP and PDF files are accepted.";
      return failure(res, 400, msg, { files: msg });
    }
    return failure(res, 400, "Could not read the uploaded files.");
  });
}

const MESSAGE =
  "Valuation Request Received. Our valuation desk has assigned a Director to your file. We will connect via WhatsApp or phone within 24 hours.";

export function createValuation(req: Request, res: Response) {
  const parsed = valuationSchema.safeParse(req.body);
  if (!parsed.success) return validationFailure(res, parsed.error.issues, "Invalid valuation data submitted");

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const bad = files.find((f) => !hasValidSignature(f));
  if (bad) {
    const msg = `"${safeFilename(bad.originalname)}" does not look like a valid PNG, JPG, WEBP or PDF file.`;
    return failure(res, 400, msg, { files: msg });
  }

  const id = `val-${Date.now()}`;
  const dir = path.join(UPLOADS_DIR, id);
  const stored = files.map((f, i) => {
    const name = `${i + 1}-${safeFilename(f.originalname)}`;
    return { name, originalname: safeFilename(f.originalname), mimetype: f.mimetype, size: f.size, buffer: f.buffer };
  });

  if (stored.length) {
    fs.mkdirSync(dir, { recursive: true });
    for (const f of stored) fs.writeFileSync(path.join(dir, f.name), f.buffer);
  }

  const record = {
    id,
    ...parsed.data,
    files: stored.map(({ buffer: _buffer, ...meta }) => ({ ...meta, path: `uploads/${id}/${meta.name}` })),
    receivedAt: new Date().toISOString(),
    status: "new",
  };

  const store = readSubmissions();
  store.valuations.push(record);
  writeSubmissions(store);
  notify(`New valuation request – ${record.fullName} (${record.location})`, record);

  return success(res, { id, message: MESSAGE }, MESSAGE, 201);
}
