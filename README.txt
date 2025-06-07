## Matrix Rain Animation

This small project renders a Matrix style "digital rain" animation on an HTML canvas.

The page also includes movable frames. You can change a frame's title by clicking on it. Layout and titles are saved to `frames.json` on the server and restored when the page loads.

To run the site with persistence enabled, start the built-in server:

```
npm start
```

Open `http://localhost:3000` in your browser to see the matrix rain animation. Frames can be moved, resized, minimized with the green underscore, and removed with the red **X** in their corner. When removing a frame you will be asked to confirm the deletion. Layout is saved server side so it persists across browsers.
