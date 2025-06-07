// Header elements
const datetimeEl = document.getElementById('datetime');
const weatherEl = document.getElementById('weather');
const quoteEl = document.getElementById('weeklyQuote');

const fallbackQuotes = [
    'The best way to get started is to quit talking and begin doing. — Walt Disney',
    'The pessimist sees difficulty in every opportunity. The optimist sees opportunity in every difficulty. — Winston Churchill',
    'Don\'t let yesterday take up too much of today. — Will Rogers'
];

function formatQuote(text) {
    if (text.length <= 120) {
        return text;
    }
    const half = Math.floor(text.length / 2);
    let idx = text.indexOf(' ', half);
    if (idx === -1) {
        idx = text.lastIndexOf(' ', half);
    }
    if (idx === -1) {
        idx = half;
    }
    return text.slice(0, idx) + '<br>' + text.slice(idx + 1).trim();
}

// Loading overlay elements
const loader = document.getElementById('loader');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const loaderCanvas = document.getElementById('loaderCanvas');
const loaderCtx = loaderCanvas.getContext('2d');
const loaderText = document.getElementById('loaderText');
const loaderFontSize = 16;
let loaderRows;
let loaderDrops;

function resizeLoaderCanvas() {
    loaderCanvas.width = progressContainer.offsetWidth;
    loaderCanvas.height = progressContainer.offsetHeight;
    loaderRows = Math.floor(loaderCanvas.height / loaderFontSize);
    loaderDrops = Array(loaderRows).fill(0);
}

function drawLoaderMatrix() {
    loaderCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    loaderCtx.fillRect(0, 0, loaderCanvas.width, loaderCanvas.height);
    loaderCtx.font = loaderFontSize + 'px monospace';
    for (let i = 0; i < loaderDrops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        const brightness = 50 + Math.random() * 50;
        loaderCtx.fillStyle = `hsl(120, 100%, ${brightness}%)`;
        loaderCtx.fillText(text, loaderDrops[i] * loaderFontSize, (i + 1) * loaderFontSize);
        if (loaderDrops[i] * loaderFontSize > loaderCanvas.width && Math.random() > 0.975) {
            loaderDrops[i] = 0;
        }
        loaderDrops[i]++;
    }
}

function updateProgress(percent) {
    progressBar.style.width = percent + '%';
    loaderText.textContent = `Loading... ${percent}%`;
}

function hideLoader() {
    clearInterval(loaderInterval);
    loader.style.display = 'none';
}

resizeLoaderCanvas();
window.addEventListener('resize', resizeLoaderCanvas);


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
let loaderInterval = setInterval(drawLoaderMatrix, speed);
const minLoadingTime = 2000; // keep loader visible for at least 2s
// extra pixels to keep frame headers clickable when minimized
const minimizePadding = 20;
// Initialize drops based on current window size and update on resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

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

const weatherDescriptions = {
    0: 'Sunny',
    1: 'Mostly clear',
    2: 'Partly cloudy',
    3: 'Cloudy',
    45: 'Fog',
    48: 'Fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    56: 'Freezing drizzle',
    57: 'Freezing drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Freezing rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Rain showers',
    81: 'Rain showers',
    82: 'Heavy rain showers',
    85: 'Snow showers',
    86: 'Snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm w/ hail',
    99: 'Thunderstorm w/ hail'
};

const dangerousCodes = new Set([65, 66, 67, 75, 82, 86, 95, 96, 99]);

function loadWeather() {
    const url =
        'https://api.open-meteo.com/v1/forecast?latitude=39.9578&longitude=-82.8993&current_weather=true&temperature_unit=fahrenheit';
    return fetch(url)
        .then(r => r.json())
        .then(data => {
            if (data && data.current_weather) {
                const t = Math.round(data.current_weather.temperature);
                const code = data.current_weather.weathercode;
                const desc = weatherDescriptions[code] || 'Unknown';
                const alert = dangerousCodes.has(code) ? '\u26A0\uFE0F ' : '';
                weatherEl.textContent = `${alert}${desc} ${t}\u00B0F`;
            } else {
                weatherEl.textContent = 'N/A';
            }
        })
        .catch(() => {
            weatherEl.textContent = 'N/A';
        });
}

function shouldFetchQuote(lastTime) {
    const now = new Date();
    const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const day = est.getDay();
    const diffToMonday = (day + 6) % 7;
    const monday = new Date(est);
    monday.setDate(est.getDate() - diffToMonday);
    monday.setHours(17, 0, 0, 0);
    if (est < monday) {
        monday.setDate(monday.getDate() - 7);
    }
    return !lastTime || lastTime < monday.getTime();
}

function loadWeeklyQuote() {
    const saved = localStorage.getItem('weeklyQuote');
    const savedTime = parseInt(localStorage.getItem('weeklyQuoteTime'), 10);
    if (shouldFetchQuote(savedTime)) {
        return fetch('https://api.quotable.io/random')
            .then(r => r.json())
            .then(d => {
                const text = `${d.content} — ${d.author}`;
                quoteEl.innerHTML = formatQuote(text);
                localStorage.setItem('weeklyQuote', text);
                localStorage.setItem('weeklyQuoteTime', Date.now());
            })
            .catch(() => {
                if (saved) {
                    quoteEl.innerHTML = formatQuote(saved);
                } else {
                    const fallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
                    quoteEl.innerHTML = formatQuote(fallback);
                    localStorage.setItem('weeklyQuote', fallback);
                    localStorage.setItem('weeklyQuoteTime', Date.now());
                }
            });
    } else {
        if (saved) {
            quoteEl.innerHTML = formatQuote(saved);
        }
        return Promise.resolve();
    }
}

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
    return fetch('/frames')
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

function createFrame(info, disableControls = false) {
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
    const tableEl = content.querySelector('table');
    if (!disableControls && tableEl) {
        const controls = document.createElement('div');
        controls.className = 'table-controls';
        controls.innerHTML = `
            <button class="add-row">Add Row</button>
            <button class="remove-row">Remove Row</button>
            <button class="add-col">Add Column</button>
            <button class="remove-col">Remove Column</button>
        `;
        content.appendChild(controls);
        setupSpreadsheet(content);
    }
    frame.appendChild(content);

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
    // Prevent dragging when clicking the close or minimize buttons
    makeDraggable(frame, header, '.close, .minimize');
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

function loadDriveImages(folderId) {
    const url = `/drive-images?folderId=${folderId}`;
    return fetch(url)
        .then(r => r.json())
        .then(data => data.images || [])
        .catch(err => {
            console.error('Failed to load drive images', err);
            return [];
        });
}

function loadLocalImages() {
    return fetch('/local-images')
        .then(r => r.json())
        .then(data => data.images || [])
        .catch(err => {
            console.error('Failed to load local images', err);
            return [];
        });
}

function createCarouselFrame() {
    const headerHeight = document.getElementById('header').offsetHeight;
    let id;
    if (availableNumbers.length > 0) {
        id = availableNumbers.shift();
    } else {
        id = ++frameCount;
    }
    const frameWidth = 300;
    const frameHeight = 220;
    const info = {
        id,
        left: 50,
        top: headerHeight + 10,
        width: frameWidth,
        height: frameHeight,
        minimized: false,
        title: 'Driver Photos',
        content: '<div class="carousel"><div class="carousel-inner"></div></div>'
    };
    const frame = createFrame(info, true);
    const inner = frame.querySelector('.carousel-inner');
    loadLocalImages().then(urls => {
        if (!urls.length) {
            inner.textContent = 'No images found';
            return;
        }
        const img = document.createElement('img');
        inner.appendChild(img);
        let idx = 0;
        function showNext() {
            img.src = urls[idx];
            idx = (idx + 1) % urls.length;
        }
        showNext();
        setInterval(showNext, 3000);
    });
    saveFrames();
}

function runLoadingSequence() {
    updateProgress(0);
    const start = Date.now();
    const tasks = [loadWeather(), loadWeeklyQuote(), loadFrames()];
    let done = 0;
    const total = tasks.length;
    tasks.forEach(p => {
        Promise.resolve(p).finally(() => {
            done++;
            const percent = Math.round((done / total) * 100);
            updateProgress(percent);
        });
    });
    return Promise.allSettled(tasks).then(() => {
        const elapsed = Date.now() - start;
        const delay = Math.max(minLoadingTime - elapsed, 0);
        return new Promise(resolve => {
            setTimeout(() => {
                hideLoader();
                resolve();
            }, delay);
        });
    });
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

// start loading sequence and create carousel frame only if one isn't loaded
runLoadingSequence().then(() => {
    if (!container.querySelector('.carousel')) {
        createCarouselFrame();
    }
});

lockButton.addEventListener('click', () => {
    framesLocked = !framesLocked;
    lockButton.textContent = framesLocked ? '🔓' : '🔒';
    container.querySelectorAll('.frame').forEach(f => {
        if (framesLocked) {
            f.classList.add('locked');
        } else {
            f.classList.remove('locked');
        }
    });
});
