/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const Jimp = require('jimp');

module.exports = {
	upload: (req, res) => {
	  // set upload directory
    const dir = '/.tmp/public/uploads/';
    const fullDir = process.cwd() + dir;

    // small and large sizes
    const small = 150;
    const large = 900;

    // if has no file name send error
	  if (!req.body.filename)
	    res.serverError('No file name in request');

	  // if request has noo file type send error
    if (!req.body.type)
      res.serverError('No type of file');
    const type = req.body.type;

	  // make random string in end of file
    let rand = '';
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 10; i++)
      rand += possible.charAt(Math.floor(Math.random() * possible.length));

    //save file
	  const filenameOrig = req.body.filename.replace(' ', '_');
	  const filename = filenameOrig.substr(0, filenameOrig.lastIndexOf('.')) + rand +'.' + filenameOrig.split('.').reverse()[0];
	  const nameSmall = filename.substr(0, filename.lastIndexOf('.')) + '_tumblr.' + filename.split('.').reverse()[0];
	  const nameLarge = filename.substr(0, filename.lastIndexOf('.')) + '_large.' + filename.split('.').reverse()[0];
	  req.file('file').upload({
      dirname: fullDir,
      saveAs: filename
    }, function(err, file) {
      if (err) res.serverError(err);

      // images
      if (type === 'images') {
        Jimp.read('.' + dir + filename, function (err, image) {
          if (err) res.serverError(err);

          const width = image.bitmap.width;
          const height = image.bitmap.height;
          const size = image.bitmap.data.length;
          image.scaleToFit(large, large)
            .write(fullDir + nameLarge, function () {
              image.scaleToFit(small, small)
                .write(fullDir + nameSmall, function () {
                  // return urls
                  const url = '/uploads/' + filename;
                  const urlSmall = '/uploads/' + nameSmall;
                  const urlLarge = '/uploads/' + nameLarge;
                  res.created({
                    name: filenameOrig,
                    url: url,
                    urlSmall: urlSmall,
                    urlLarge: urlLarge,
                    width: width,
                    height: height,
                    size: size
                  });
                });
            });
        });
      }
	  });
  }
};

