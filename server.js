const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = 3000;
const root = __dirname;
const saveFile = path.join(root, 'frames.json');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.json': 'application/json',
  '.txt': 'text/plain'
};

// ————— driver-photo frame cleanup —————
const leftover = frame.querySelector('.table-controls');
if (leftover) leftover.remove();

// … other code …

// make every file path safe for URLs
.map(f => '/' + encodeURIComponent(f));


function serveStatic(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);

  if (req.method === 'GET' && parsed.pathname === '/local-images') {
    fs.readdir(root, (err, files) => {
      if (err) {
        console.error('Failed to read directory', err);
        return sendJson(res, { images: [] });
      }
      const images = files.filter(f => /\.png$/i.test(f)).map(f => '/' + f);
      sendJson(res, { images });
    });
    return;
  }

  if (req.method === 'GET' && parsed.pathname === '/frames') {
    fs.readFile(saveFile, 'utf8', (err, data) => {
      let result;
      if (err) {
        result = { frameCount: 0, frames: [] };
      } else {
        try {
          result = JSON.parse(data);
        } catch {
          result = { frameCount: 0, frames: [] };
        }
      }
      sendJson(res, result);
    });
    return;
  }

  if (req.method === 'POST' && parsed.pathname === '/frames') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      fs.writeFile(saveFile, body || '{}', err => {
        if (err) {
          console.error('Failed to save frames', err);
          return sendJson(res, { message: 'Failed to save' }, 500);
        }
        sendJson(res, { status: 'ok' });
      });
    });
    return;
  }

  // Static files
  let filePath = path.join(root, parsed.pathname === '/' ? 'index.html' : parsed.pathname);
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  serveStatic(res, filePath);
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
