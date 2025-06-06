// Matrix rain effect
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

// Set canvas size based on the window and keep it updated
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = Array(columns).fill(1);
}

// Character set with a mix of latin and katakana symbols for a more "Matrix" feel
const letters =
  'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const fontSize = 16;
let columns;
let drops;

// How often the matrix updates. Higher values slow down the animation.
const speed = 80; // milliseconds - a bit faster
// Initialize drops based on current window size and update on resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function drawMatrix() {
    // Slightly darken the entire canvas to create the trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));

        // Give each symbol a subtle variation in brightness
        const brightness = 50 + Math.random() * 50; // 50% - 100%
        ctx.fillStyle = `hsl(120, 100%, ${brightness}%)`;
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

// Slow down the interval for a calmer rain effect
setInterval(drawMatrix, speed);

// Movable frames
const addButton = document.getElementById('addFrame');
const container = document.getElementById('framesContainer');
let frameCount = 0;
let zIndexCounter = 1;

function makeDraggable(el, ignoreSelector) {
    let offsetX, offsetY;
    const ignoreEl = ignoreSelector ? el.querySelector(ignoreSelector) : null;
    const onMouseMove = e => {
        el.style.left = e.pageX - offsetX + 'px';
        el.style.top = e.pageY - offsetY + 'px';
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    el.addEventListener('mousedown', e => {
        if (ignoreEl && (e.target === ignoreEl || ignoreEl.contains(e.target))) {
            return;
        }
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        el.style.zIndex = ++zIndexCounter;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}

addButton.addEventListener('click', () => {
    const frame = document.createElement('div');
    frame.className = 'frame';
    frame.innerHTML = `<span class="close">\u2716</span>Frame ${++frameCount}`;
    frame.style.left = '50px';
    frame.style.top = '50px';
    container.appendChild(frame);
    makeDraggable(frame, '.close');

    const close = frame.querySelector('.close');
    close.addEventListener('mousedown', e => e.stopPropagation());
    close.addEventListener('click', e => {
        e.stopPropagation();
        frame.remove();
    });
});
