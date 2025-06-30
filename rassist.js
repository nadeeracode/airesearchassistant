/**
 * @license
 * MIT License
 *
 * Copyright (c) 2025, nadeeracode
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const axios = require("axios");
const path = require("path");

const upload = multer({ dest: "uploads/" });
const app = express();

// Serve HTML form to test
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// File upload route
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const prompt = `Summarize this academic paper in 3 bullet points:\n${pdfData.text.slice(0, 3000)}`;

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3.2",
      prompt: prompt,
      stream: false,
    });

    res.send(`<pre>${response.data.response}</pre>`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing the file.");
  }
});

app.listen(3000, () => console.log("App running at http://localhost:3000"));

