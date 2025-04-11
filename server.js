
const express = require("express");
const multer = require("multer");
const path = require("path");
const profileController = require("./controllers/profileController");

const app = express();
const port = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/set-profile", upload.single("photo"), profileController);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
