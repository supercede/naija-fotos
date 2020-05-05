import cloudinary from 'cloudinary';
import debug from 'debug';

const DEBUG = debug('dev');

export default async function deleteImage(imgURL) {
  const imgArr = imgURL.split('/');
  const folderName = imgArr[imgArr.length - 2];
  const fileName = imgArr[imgArr.length - 1];
  const publicID = fileName.substr(0, fileName.length - 4);

  const filePath = `${folderName}/${publicID}`;

  return cloudinary.v2.uploader.destroy(filePath, (err, result) => {
    DEBUG(err, result);
  });
}
