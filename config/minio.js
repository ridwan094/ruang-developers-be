const Minio = require('minio');
require('dotenv').config();

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_HOST || '192.168.1.45',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER,
    secretKey: process.env.MINIO_ROOT_PASSWORD
});

const videoBucketName = 'master-data-videos';
const fileBucketName = 'files';
const templateBucketName = 'templates';

function ensureBucketExists(bucketName) {
    minioClient.bucketExists(bucketName, function (err, exists) {
        if (err) {
            return console.log(err);
        }
        if (!exists) {
            minioClient.makeBucket(bucketName, 'us-east-1', function (err) {
                if (err) {
                    return console.log('Error creating bucket.', err);
                }
                console.log('Bucket created successfully');
            });
        } else {
            console.log(`Bucket ${bucketName} already exists.`);
        }
    });
}

ensureBucketExists(videoBucketName);
ensureBucketExists(fileBucketName);
ensureBucketExists(templateBucketName);

module.exports = minioClient;