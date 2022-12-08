import { S3 } from '@aws-sdk/client-s3';

export const awsS3 = () =>
  new S3({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_PUBLIC_KEY,
      secretAccessKey: process.env.AWS_PRIVATE_KEY,
    },
  });
