export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  // console.log(file);
  if (!file) return callback(new Error(`File is empty`), false);
  const fileExtension = file.mimetype.split('/')[1];
  //!como queremos que nuestros productos tengan solo imagenes agregamos estas validaciones de lo contrario podemos incluir pdf, txt, .docsx, etc...
  const validExtensions = ['jpg', 'jpeg', 'png', 'git', 'mp4'];

  if (validExtensions.includes(fileExtension)) {
    return callback(null, true);
  }

  callback(null, false);
};
