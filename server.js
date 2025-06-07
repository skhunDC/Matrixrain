const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;
const saveFile = path.join(__dirname, 'frames.json');

app.use(express.json());
app.use(express.static(__dirname));

app.get('/images', (req, res) => {
  fs.readdir(__dirname, (err, files) => {
    if (err) {
      console.error('Failed to read images', err);
      return res.json({ images: [] });
    }
    const images = files
      .filter(f => f.toLowerCase().endsWith('.png'))
      .map(f => encodeURI(`/${f}`));
    res.json({ images });
  });
});

app.get('/frames', (req, res) => {
  fs.readFile(saveFile, 'utf8', (err, data) => {
    if (err) {
      return res.json({ frameCount: 0, frames: [] });
    }
    try {
      res.json(JSON.parse(data));
    } catch {
      res.json({ frameCount: 0, frames: [] });
    }
  });
});

app.post('/frames', (req, res) => {
  fs.writeFile(saveFile, JSON.stringify(req.body || {}), err => {
    if (err) {
      console.error('Failed to save frames', err);
      return res.status(500).json({ message: 'Failed to save' });
    }
    res.json({ status: 'ok' });
  });
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
