// Matrix rain effect
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Character set with a mix of latin and katakana symbols for a more "Matrix" feel
const letters =
  'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const fontSize = 16;
const columns = Math.floor(canvas.width / fontSize);
const drops = Array(columns).fill(1);

// How often the matrix updates. Higher values slow down the animation.
const speed = 150; // milliseconds

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

function makeDraggable(el) {
    let offsetX, offsetY;
    const onMouseMove = e => {
        el.style.left = e.pageX - offsetX + 'px';
        el.style.top = e.pageY - offsetY + 'px';
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    el.addEventListener('mousedown', e => {
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}

addButton.addEventListener('click', () => {
    const frame = document.createElement('div');
    frame.className = 'frame';
    frame.textContent = 'Frame ' + (++frameCount);
    frame.style.left = '50px';
    frame.style.top = '50px';
    container.appendChild(frame);
    makeDraggable(frame);
});
