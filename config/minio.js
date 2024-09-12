const Minio = require('minio');
require('dotenv').config();

const minioClient = new Minio.Client({
    endPoint: '10.233.44.28',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER,
    secretKey: process.env.MINIO_ROOT_PASSWORD
});

const bucketName = 'master-data-videos';

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
    }
});

module.exports = minioClient;