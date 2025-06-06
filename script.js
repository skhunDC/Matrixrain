// Header elements
const datetimeEl = document.getElementById('datetime');
const weatherEl = document.getElementById('weather');

// Elements for the logo waving effect
const logoImg = document.getElementById('logoImg');
const logoCanvas = document.getElementById('logo');

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
// extra pixels to keep frame headers clickable when minimized
const minimizePadding = 6;
// Initialize drops based on current window size and update on resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Start the flag style animation on the logo
function startLogoWave() {
    if (!logoImg.complete) {
        logoImg.onload = startLogoWave;
        return;
    }
    const ctxL = logoCanvas.getContext('2d');
    // render at 150px wide for a crisp display
    const desiredWidth = 150;
    const scale = desiredWidth / logoImg.naturalWidth;
    logoCanvas.width = desiredWidth;
    logoCanvas.height = logoImg.naturalHeight * scale;
    logoCanvas.style.width = desiredWidth + 'px';
    logoCanvas.style.height = logoCanvas.height + 'px';
    logoImg.style.display = 'none';

    let t = 0;
    const slice = 1;           // use 1px slices for higher fidelity
    const waveLength = 50;     // slightly longer waves
    const amplitude = 4;       // gentler movement for clarity

    function draw() {
        ctxL.clearRect(0, 0, logoCanvas.width, logoCanvas.height);
        for (let x = 0; x < logoCanvas.width; x += slice) {
            const progress = x / logoCanvas.width;
            const offset = Math.sin((t + x) / waveLength) * amplitude * progress;
            ctxL.drawImage(
                logoImg,
                x, 0, slice, logoCanvas.height,
                x + offset, 0, slice, logoCanvas.height
            );
        }
        t += 0.5;
        requestAnimationFrame(draw);
    }
    draw();
}
startLogoWave();

// keep frames within the viewport on resize
window.addEventListener('resize', () => {
    const frames = document.querySelectorAll('.frame');
    frames.forEach(frame => constrainFrame(frame));
});

function updateDateTime() {
    const now = new Date();
    const options = {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    };
    const date = now.toLocaleDateString('en-US');
    const time = now.toLocaleTimeString('en-US', options);
    datetimeEl.textContent = `${date} ${time}`;
}
setInterval(updateDateTime, 1000);
updateDateTime();

function loadWeather() {
    const url =
        'https://api.open-meteo.com/v1/forecast?latitude=39.9578&longitude=-82.8993&current_weather=true&temperature_unit=fahrenheit';
    fetch(url)
        .then(r => r.json())
        .then(data => {
            if (data && data.current_weather) {
                const t = Math.round(data.current_weather.temperature);
                weatherEl.textContent = `${t}\u00B0F`;
            } else {
                weatherEl.textContent = 'N/A';
            }
        })
        .catch(() => {
            weatherEl.textContent = 'N/A';
        });
}
loadWeather();

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
const lockButton = document.getElementById('lockFrames');
const container = document.getElementById('framesContainer');
let frameCount = 0;
// numbers from removed frames that can be reused
let availableNumbers = [];
let zIndexCounter = 1;
let framesLocked = false;

function saveFrames() {
    const frames = [];
    container.querySelectorAll('.frame').forEach(frame => {
        const contentEl = frame.querySelector('.content');
        const clone = contentEl.cloneNode(true);
        const existing = clone.querySelector('.table-controls');
        if (existing) existing.remove();
        frames.push({
            id: frame.dataset.id,
            left: parseFloat(frame.style.left) || 0,
            top: parseFloat(frame.style.top) || 0,
            width: parseFloat(frame.style.width) || 200,
            height: parseFloat(frame.dataset.prevHeight || frame.style.height) || 150,
            minimized: frame.classList.contains('minimized'),
            title: frame.querySelector('.title').innerText,
            content: clone.innerHTML
        });
    });
    const state = { frameCount, frames };
    localStorage.setItem('framesState', JSON.stringify(state));
    fetch('/frames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
    }).catch(err => console.error('Failed to save frames', err));
}

function loadFrames() {
    fetch('/frames')
        .then(r => r.json())
        .then(data => {
            frameCount = data.frameCount || 0;
            const used = new Set();
            (data.frames || []).forEach(info => {
                createFrame(info);
                if (info.id) used.add(parseInt(info.id));
            });
            availableNumbers = [];
            for (let i = 1; i <= frameCount; i++) {
                if (!used.has(i)) availableNumbers.push(i);
            }
        })
        .catch(() => {
            const saved = localStorage.getItem('framesState');
            if (!saved) return;
            try {
                const data = JSON.parse(saved);
                frameCount = data.frameCount || 0;
                const used = new Set();
                (data.frames || []).forEach(info => {
                    createFrame(info);
                    if (info.id) used.add(parseInt(info.id));
                });
                availableNumbers = [];
                for (let i = 1; i <= frameCount; i++) {
                    if (!used.has(i)) availableNumbers.push(i);
                }
            } catch (e) {
                console.error('Failed to load frames', e);
            }
        });
}

function createFrame(info) {
    const frame = document.createElement('div');
    frame.className = 'frame';
    frame.dataset.id = info.id;
    frame.dataset.prevHeight = info.height || 150;

    const header = document.createElement('div');
    header.className = 'frame-header';
    header.innerHTML =
        `<span class="close">\u2716</span><span class="minimize">&#95;</span><div class="title" contenteditable="true">${info.title || ''}</div>`;
    frame.appendChild(header);

    const content = document.createElement('div');
    content.className = 'content';
    if (info.content) {
        content.innerHTML = info.content;
        const existing = content.querySelector('.table-controls');
        if (existing) existing.remove();
    } else {
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Header 1', 'Header 2'].forEach(text => {
            const th = document.createElement('th');
            th.contentEditable = 'true';
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        const row = document.createElement('tr');
        for (let i = 0; i < 2; i++) {
            const td = document.createElement('td');
            td.contentEditable = 'true';
            row.appendChild(td);
        }
        tbody.appendChild(row);
        table.appendChild(tbody);
        content.appendChild(table);
    }
    const controls = document.createElement('div');
    controls.className = 'table-controls';
    controls.innerHTML = `
        <button class="add-row">Add Row</button>
        <button class="remove-row">Remove Row</button>
        <button class="add-col">Add Column</button>
        <button class="remove-col">Remove Column</button>
    `;
    content.appendChild(controls);
    frame.appendChild(content);
    setupSpreadsheet(content);

    frame.style.left = (info.left || 0) + 'px';
    frame.style.top = (info.top || 0) + 'px';
    frame.style.width = (info.width || 200) + 'px';
    frame.style.height = (info.height || 150) + 'px';
    container.appendChild(frame);

    if (info.minimized) {
        // ensure header height is available before minimizing
        toggleMinimize(frame);
    }

    constrainFrame(frame);
    makeDraggable(frame, header);
    makeResizable(frame);

    if (framesLocked) {
        frame.classList.add('locked');
    }

    const close = frame.querySelector('.close');
    close.addEventListener('click', e => {
        e.stopPropagation();
        if (confirm('ARE YOU SURE YOU WANT TO DELETE THE FRAME?')) {
            const id = parseInt(frame.dataset.id);
            frame.remove();
            if (!availableNumbers.includes(id)) {
                availableNumbers.push(id);
                availableNumbers.sort((a, b) => a - b);
            }
            saveFrames();
        }
    });

    const title = frame.querySelector('.title');
    title.addEventListener('blur', saveFrames);

    const body = frame.querySelector('.content');
    body.addEventListener('mousedown', e => e.stopPropagation());
    body.addEventListener('blur', saveFrames);

    const minimize = frame.querySelector('.minimize');
    minimize.addEventListener('click', e => {
        e.stopPropagation();
        toggleMinimize(frame);
        saveFrames();
    });

    return frame;
}

function constrainFrame(el) {
    const headerHeight = document.getElementById('header').offsetHeight;
    const maxX = window.innerWidth - el.offsetWidth;
    const maxY = window.innerHeight - el.offsetHeight;
    let left = parseFloat(el.style.left);
    let top = parseFloat(el.style.top);

    if (isNaN(left)) left = 0;
    if (isNaN(top)) top = headerHeight;

    left = Math.min(Math.max(0, left), maxX);
    top = Math.min(Math.max(headerHeight, top), maxY);

    el.style.left = left + 'px';
    el.style.top = top + 'px';
}

function makeDraggable(el, handle, ignoreSelector) {
    let offsetX, offsetY;
    const target = handle || el;
    const ignored = ignoreSelector ? Array.from(target.querySelectorAll(ignoreSelector)) : [];

    const onMouseMove = e => {
        const headerHeight = document.getElementById('header').offsetHeight;
        const maxX = window.innerWidth - el.offsetWidth;
        const maxY = window.innerHeight - el.offsetHeight;

        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        newX = Math.min(Math.max(0, newX), maxX);
        newY = Math.min(Math.max(headerHeight, newY), maxY);

        el.style.left = newX + 'px';
        el.style.top = newY + 'px';
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        el.dataset.prevHeight = parseFloat(el.style.height);
        saveFrames();
    };

    target.addEventListener('mousedown', e => {
        if (framesLocked) return;
        if (ignored.some(i => i === e.target || i.contains(e.target))) {
            return;
        }
        offsetX = e.clientX - el.offsetLeft;
        offsetY = e.clientY - el.offsetTop;
        el.style.zIndex = ++zIndexCounter;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}

function toggleMinimize(frame) {
    const header = frame.querySelector('.frame-header');
    const headerHeight = header ? header.offsetHeight : 0;
    if (frame.classList.contains('minimized')) {
        frame.classList.remove('minimized');
        const prev = frame.dataset.prevHeight || 150;
        frame.style.height = prev + 'px';
    } else {
        frame.dataset.prevHeight = parseFloat(frame.style.height) || frame.dataset.prevHeight || 150;
        // leave a little extra room so the minimize button remains clickable
        frame.style.height = (headerHeight + minimizePadding) + 'px';
        frame.classList.add('minimized');
    }
}

function makeResizable(el) {
    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    el.appendChild(resizer);

    let startX, startY, startWidth, startHeight;

    const onMouseMove = e => {
        const maxWidth = window.innerWidth - el.offsetLeft;
        const maxHeight = window.innerHeight - el.offsetTop;
        const newWidth = startWidth + (e.pageX - startX);
        const newHeight = startHeight + (e.pageY - startY);
        el.style.width = Math.min(newWidth, maxWidth) + 'px';
        el.style.height = Math.min(newHeight, maxHeight) + 'px';
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        el.dataset.prevHeight = parseFloat(el.style.height);
        saveFrames();
    };

    resizer.addEventListener('mousedown', e => {
        if (framesLocked) return;
        e.stopPropagation();
        startX = e.pageX;
        startY = e.pageY;
        startWidth = parseFloat(getComputedStyle(el).width);
        startHeight = parseFloat(getComputedStyle(el).height);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}

function setupSpreadsheet(content) {
    const table = content.querySelector('table');
    const controls = content.querySelector('.table-controls');
    if (!table || !controls) return;

    const addRowBtn = controls.querySelector('.add-row');
    const removeRowBtn = controls.querySelector('.remove-row');
    const addColBtn = controls.querySelector('.add-col');
    const removeColBtn = controls.querySelector('.remove-col');

    addRowBtn.addEventListener('click', () => {
        const cols = table.rows[0].cells.length;
        const row = table.insertRow(-1);
        for (let i = 0; i < cols; i++) {
            const cell = row.insertCell(i);
            cell.contentEditable = 'true';
        }
        saveFrames();
    });

    removeRowBtn.addEventListener('click', () => {
        if (table.rows.length > 1) {
            table.deleteRow(-1);
            saveFrames();
        }
    });

    addColBtn.addEventListener('click', () => {
        for (let i = 0; i < table.rows.length; i++) {
            const cell = i === 0 ? document.createElement('th') : document.createElement('td');
            cell.contentEditable = 'true';
            table.rows[i].appendChild(cell);
        }
        saveFrames();
    });

    removeColBtn.addEventListener('click', () => {
        const cols = table.rows[0].cells.length;
        if (cols > 1) {
            for (let i = 0; i < table.rows.length; i++) {
                table.rows[i].deleteCell(-1);
            }
            saveFrames();
        }
    });

    table.addEventListener('blur', e => {
        if (e.target.tagName === 'TD' || e.target.tagName === 'TH') {
            saveFrames();
        }
    }, true);
}

addButton.addEventListener('click', () => {
    const headerHeight = document.getElementById('header').offsetHeight;
    let id;
    if (availableNumbers.length > 0) {
        id = availableNumbers.shift();
    } else {
        id = ++frameCount;
    }
    const frameWidth = 200;
    const info = {
        id,
        left: window.innerWidth - frameWidth - 50,
        top: headerHeight + 10,
        width: frameWidth,
        height: 150,
        minimized: false,
        title: `New Frame ${id}`,
        content: ''
    };
    createFrame(info);
    saveFrames();
});

// restore any saved frames on load
loadFrames();

lockButton.addEventListener('click', () => {
    framesLocked = !framesLocked;
    lockButton.textContent = framesLocked ? 'Unlock Frames' : 'Lock Frames';
    container.querySelectorAll('.frame').forEach(f => {
        if (framesLocked) {
            f.classList.add('locked');
        } else {
            f.classList.remove('locked');
        }
    });
});
