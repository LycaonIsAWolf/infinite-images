var aws = require('aws-sdk');
var s3 = new aws.S3({});
var multers3 = require('multer-s3');
var path = require('path');

var multer = require('multer');
var upload = multer({
		fileFilter: function(req, file, cb){
			if((file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif" || file.mimetype=="image/*")){
				console.log("file ok");
				cb(null, true);
			}
			else{
				console.log("file rejected");
				cb(null, false);
			}
		},

		storage: multers3({
			s3: s3,
			bucket: process.env.S3_BUCKET,
			acl: 'public-read',
			cacheControl: 'max-age=86400',
			contentType: multerS3.AUTO_CONTENT_TYPE,
			metadata: function(req, file, cb){
				cb(null, {fieldName: file.fieldname});
			},
			key: function(req, file, cb){
				cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
			}
		}),

		limits: {
			fileSize: 10000000
		}
	}).single('image');

module.exports = upload;