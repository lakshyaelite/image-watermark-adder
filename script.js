// script.js
const imageInput = document.getElementById('imageInput');
const watermarkText = document.getElementById('watermarkText');
const opacityRange = document.getElementById('opacityRange');
const opacityValue = document.getElementById('opacityValue');
const fontSizeInput = document.getElementById('fontSize');
const previewArea = document.getElementById('previewArea');
const removeWatermarked = document.getElementById('removeWatermarked');
let images = [];

opacityRange.addEventListener('input', () => {
    opacityValue.textContent = opacityRange.value;
    updateAllPreviews();
});
watermarkText.addEventListener('input', updateAllPreviews);
fontSizeInput.addEventListener('input', updateAllPreviews);

imageInput.addEventListener('change', function() {
    images = Array.from(this.files);
    renderPreviews();
});

function renderPreviews() {
    previewArea.innerHTML = '';
    images.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const container = document.createElement('div');
            container.className = 'canvas-container';
            const canvas = document.createElement('canvas');
            canvas.className = 'preview-img';
            canvas.dataset.idx = idx;
            container.appendChild(canvas);
            previewArea.appendChild(container);
            drawWatermark(canvas, e.target.result, file.type);
        };
        reader.readAsDataURL(file);
    });
}

function updateAllPreviews() {
    document.querySelectorAll('.preview-img').forEach((canvas, idx) => {
        const file = images[idx];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            drawWatermark(canvas, e.target.result, file.type);
        };
        reader.readAsDataURL(file);
    });
}

function drawWatermark(canvas, imgSrc, imgType) {
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const text = watermarkText.value || '';
        if (text) {
            const fontSize = parseInt(fontSizeInput.value, 10) || 36;
            ctx.save();
            ctx.globalAlpha = parseFloat(opacityRange.value);
            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Diagonal
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(-Math.atan(canvas.height / canvas.width));
            ctx.strokeStyle = 'rgba(0,0,0,0.4)';
            ctx.lineWidth = fontSize / 8;
            ctx.strokeText(text, 0, 0);
            ctx.fillText(text, 0, 0);
            ctx.restore();
        }
    };
    img.src = imgSrc;
}

document.getElementById('exportSame').addEventListener('click', function() {
    exportImages(false);
});
document.getElementById('exportWebp').addEventListener('click', function() {
    exportImages(true);
});

function exportImages(asWebp) {
    document.querySelectorAll('.preview-img').forEach((canvas, idx) => {
        const file = images[idx];
        if (!file) return;
        let mimeType = asWebp ? 'image/webp' : file.type;
        let ext = asWebp ? 'webp' : file.name.split('.').pop();
        let baseName = file.name.replace(/\.[^.]+$/, '');
        let downloadName = baseName + (removeWatermarked.checked ? '' : '_watermarked') + '.' + ext;
        canvas.toBlob(function(blob) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = downloadName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }, mimeType, asWebp ? 0.7 : 1.0);
    });
}
