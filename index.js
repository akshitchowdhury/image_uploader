require('dotenv').config();

const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const port = process.env.PORT || 3000;

const app = express();

// Use CORS with specific origin
app.use(cors({
  origin: 'http://localhost:3001', // replace with your frontend's origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));


    mongoose.connect(
        "mongodb+srv://akshitchowdhury:akshitchowdhury@cluster0.md9g55t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
);

const fileSchema = new mongoose.Schema({
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
  uploadDate: { type: Date, default: Date.now },
});

const File = mongoose.model("File", fileSchema);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

app.post(
  "/profile-upload-single",
  upload.single("profile-file"),
  async (req, res) => {
    try {
      const fileData = new File({
        filename: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
      await fileData.save();
      res.json(fileData);
    } catch (error) {
      res.status(500).send("Error uploading file.");
    }
  }
);

app.post(
  "/profile-upload-multiple",
  upload.array("profile-files", 12),
  async (req, res) => {
    try {
      let files = [];
      for (let i = 0; i < req.files.length; i++) {
        const fileData = new File({
          filename: req.files[i].originalname,
          path: req.files[i].path,
          mimetype: req.files[i].mimetype,
          size: req.files[i].size,
        });
        await fileData.save();
        files.push(fileData);
      }
      res.json(files);
    } catch (error) {
      res.status(500).send("Error uploading files.");
    }
  }
);

// Fetch all uploaded files metadata
app.get("/files", async (req, res) => {
  try {
    const files = await File.find();
    res.json(files);
  } catch (error) {
    res.status(500).send("Error fetching files.");
  }
});

// Fetch a specific file metadata
app.get("/files/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).send("File not found");
    }
    res.json(file);
  } catch (error) {
    res.status(500).send("Error fetching file.");
  }
});

app.listen(port, () => console.log(`Server running on port ${port}!`));
