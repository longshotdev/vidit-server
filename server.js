const express = require("express");
const app = express();
const ytdl = require("ytdl-core");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const enmap = require("enmap");
const multer = require("multer");
const cors = require("cors");
app.use(cors());
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
let upload = multer({ storage: storage }).single("file");
let vidDB = new enmap({
  name: "VIDEOS",
  autoFetch: true
});

/*

START UP 
ADDING ALL LOCAL VIDEOS

*/

console.log("READY");
vidDB.defer.then(() => {
  vidDB.set("video", [
    {
      title: "Hoes Mad!",
      URL: "https://www.youtube.com/watch?v=J6oTIjvw_-8",
      artist: "Famous Dex",
      id: 1
    },
    {
      title: "Kamikaze",
      URL: "https://www.youtube.com/watch?v=HShOMLxQ1Ww",
      artist: "Lil Mosey",
      id: 2
    },
    {
      title: "Flick of the Wrist",
      URL: "./videos/niggas.mp4",
      artist: "Lil Mosey",
      id: 2
    },
    {
      title: "Hells Kitchen GR",
      URL: "https://www.youtube.com/watch?v=gz6FMgxmU9I",
      artist: "GR",
      id: 2
    }
  ]);
  try {
  fs.readdir("./videos", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
      console.log("SET IN Db");
      vidDB.push("video", {
        title: file,
        URL: `./videos/${file}`,
        artist: "Unknown",
        id: 283
      });
    });
  });
} catch(e) {console.log(e);}});
/* 

END 

*/

app.use(fileUpload());
const videos = vidDB.get("video");
app.get("/videos", (req, res) => {
  return res.json(videos);
});
app.get("/", (req, res) => {
  res.json(videos);
});
app.get("/videos/play/:id", async (req, res) => {
  let video = videos[req.params.id].URL;
  console.log("IVE BEEN CALLED!");
  console.log(video);
  console.log("AAAAAAAAAAAAAA " + video);
  // let video = videos[Math.floor(Math.random() * videos.length)].URL;

  if (ytdl.validateURL(video)) {
    runYTVideo(req, res, video, videos);
  } else {
    runLocalVideo(req, res, video, videos);
  }
});
app.get("/update", async (req, res) => {
update();
  res.json(videos);
});
app.get("/clear", async (req, res) => {
  await vidDB.set("video", [
    {
      title: "Hoes Mad!",
      URL: "https://www.youtube.com/watch?v=J6oTIjvw_-8",
      artist: "Famous Dex",
      id: 1
    },
    {
      title: "Kamikaze",
      URL: "https://www.youtube.com/watch?v=HShOMLxQ1Ww",
      artist: "Lil Mosey",
      id: 2
    },
    {
      title: "Flick of the Wrist",
      URL: "./videos/bruh.mp4",
      artist: "Lil Mosey",
      id: 2
    },
    {
      title: "Hells Kitchen GR",
      URL: "https://www.youtube.com/watch?v=gz6FMgxmU9I",
      artist: "GR",
      id: 2
    }
  ]);
  res.json(videos);
});

app.post("/video/upload/", (req, res) => {
  let imageFile = req.files.file;

  imageFile.mv(`${__dirname}/videos/${req.body.filename}`, function(err) {
    if (err) {
      console.log(err);
      return res.send(err);
    }
    videos.push({
      title: req.body.filename,
      URL: `./videos/${req.body.filename}`,
      artist: "CUSTOM",
      id: Math.floor(Math.random() * 4 + 1)
    });
    res.json({ file: `public/${req.body.filename}.jpg` });
  });
});
app.get("/skeet", (req, res) => {
  return res.send(
    '<video id="videoPlayer" controls><source src="http://localhost:4000/videos/play/1" type="video/mp4"></video>'
  );
});
app.put("/", (req, res) => {
  return res.send("Received a PUT HTTP method");
});
app.delete("/", (req, res) => {
  return res.send("Received a DELETE HTTP method");
});
app.listen(4000, () => {
  console.log(`Example app listening on port ${process.env.PORT}!`);
});

function runYTVideo(req, res, video, videos) {
  let chunkVideo = ytdl(video, {
    filter: format => format.container === "mp4"
  });
  let chunkLength, chunkDownloaded, TotalBytes;
  chunkVideo.once("progress", (chunkLength, ChunkDownloaded, TotalBytes) => {
    console.log(chunkDownloaded);
    const fileSize = TotalBytes;
    console.log(fileSize);
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4"
      };
      console.log("WROTE CHUNK");
      res.writeHead(206, head);
      chunkVideo.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4"
      };
      console.log("WROTE CHUNK");
      res.writeHead(200, head);
      chunkVideo.pipe(res);
    }
    chunkVideo.on("progress", (chunksize, chunkdl, chunkfull) => {
      console.log(`${chunkdl} / ${chunkfull}`);
    });
    chunkVideo.on("end", () => {
      console.log("FINISHED");
      res.end();
    });
  });
  res.on("close", () => {
    res.end();
  });
  console.log("connection terminated");
}
function runLocalVideo(req, res, video, videos) {
  const path = video;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4"
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4"
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
}
async function update() {

  try {
    fs.readdir("D:/Videos/Counter-strike  Global Offensive", (err, files) => {
      files.forEach(f => {
        vidDB.push("video", {
          title: f,
          URL: `D:/Videos/Counter-strike  Global Offensive/${f}`,
          artist: "Unknown",
          id: 283
        });
      });
    });
    // search video folder 
  await fs.readdir("./videos", (err, files) => {
    if (err) return console.error(err);
    console.log(files);
    files.forEach(c => {
      vidDB.push("video", {
        title: c,
        URL: `./videos/${c}`,
        artist: "Unknown",
        id: 283
      });
    });

  })
}catch(e) {
  return console.error(e)
} }