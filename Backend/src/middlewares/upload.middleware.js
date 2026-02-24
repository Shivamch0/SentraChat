import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed_Types = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/mpeg",
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
  ];

  if (!allowed_Types.includes(file.mimeType)) {
    return cb(new Error("Unsupported File Type"), false);
  }
  cb(null, true);
};

const upload = multer({ 
    storage, 
    fileFilter,
    limits : {
        fileSize : 20 * 1024 * 1024
    }
 });

 export { upload }