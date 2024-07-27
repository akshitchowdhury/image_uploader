const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const port = 3000;
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://akshitchowdhury:akshitchowdhury@cluster0.md9g55t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const fileSchema = new mongoose.Schema({
  filename: String,
  content: String,
  mimetype: String,
  size: Number,
  uploadDate: { type: Date, default: Date.now },
});

const File = mongoose.model("File", fileSchema);

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

app.post(
  "/profile-upload-single",
  upload.single("profile-file"),
  async (req, res) => {
    try {
      const fileData = new File({
        filename: req.file.originalname,
        content: req.file.buffer.toString("base64"),
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
      await fileData.save();

      res.status(201).json({
        message: "File uploaded successfully",
        file: fileData,
      });
    } catch (error) {
      res.status(500).json({ error: "Error uploading file." });
    }
  }
);

app.get("/files", async (req, res) => {
  try {
    const files = await File.find();
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: "Error fetching files." });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}!`));
