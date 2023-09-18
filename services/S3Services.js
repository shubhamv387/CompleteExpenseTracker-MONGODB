const AWS = require("aws-sdk");

exports.uploadeToS3 = (data, fileName) => {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  const s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
  });

  var params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: data,
    ACL: "public-read",
  };

  return new Promise((res, rej) => {
    s3bucket.upload(params, (err, s3response) => {
      if (err) {
        console.log("Something Wrong", err);
        rej(err);
      } else {
        console.log("success", s3response);
        res(s3response.Location);
      }
    });
  });
};
