const express = require("express");
const fs = require("fs");

const app = express();

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/video", (req, res) => {
  const range = req.headers.range; //sent by the <video> tag
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  const videoPath = "./assets/bigbuck.mp4";
  const videoSize = fs.statSync(videoPath).size; //returns file size in bytes

  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, "")); //regex \D = not digit

  //returns the end of the chunk based on the chunk size, or what's left of the video
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  //returns the chunk size except at the end of the video
  const contentLength = end - start + 1;

  //it tells the client where is the end of the partial data, so it can ask for the next part
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  //206 is for partial content
  res.writeHead(206, headers);

  //where the magic happens
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

app.listen(3000, () => {
  console.log("Listening on port 3000!");
});
