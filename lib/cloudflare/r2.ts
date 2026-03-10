import "server-only";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "../env";
import { getEnvironment } from "../utils";

export interface FileObject {
  Key?: string;
  LastModified?: Date;
  ETag?: string;
  Size?: number;
  StorageClass?: string;
}

const R2_ACCOUNT_ID = env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = env.R2_BUCKET;

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function getSignedUrlForUpload(key: string, contentType: string) {
  key = withR2EnvPrefix(key);

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: decodeURIComponent(key),
    ContentType: contentType,
    ACL: "public-read",
  });

  try {
    const signedUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
    return {
      signedUrl,
      key,
    };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
}

export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: decodeURIComponent(key),
  });

  try {
    const response = await S3.send(command);
    return response;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string,
) {
  const prefixedKey = withR2EnvPrefix(key);
  await S3.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: prefixedKey,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${env.R2_PUBLIC_URL}/${prefixedKey}`;
}

function withR2EnvPrefix(key: string) {
  const trimmed = key.replace(/^\/+/, "");
  return `${getEnvironment()}/${trimmed}`;
}
