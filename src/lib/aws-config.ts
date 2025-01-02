export const config = {
  region: process.env.AWS_REGION_NEW || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_NEW || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_NEW || "",
  },
};
