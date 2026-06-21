
const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');

let animationTime = 0;
let animationFrameId = null;

document.querySelectorAll('.collapsible-header').forEach(header => {
  header.addEventListener('click', () => {
    const content = header.nextElementSibling;
    header.classList.toggle('collapsed');
    content.classList.toggle('collapsed');
  });
});

const state = {
  bgImage: null,
  bgX: 50,
  bgY: 50,
  bgScale: 100,
  charImage: null,
  charX: 50,
  charY: 50,
  charScale: 100,
  charFlipped: false,
  char2Image: null,
  char2X: 50,
  char2Y: 50,
  char2Scale: 100,
  char2Flipped: false,
  showDialogue: true,
  charName: 'Hero',
  dialogueText: 'Welcome to the adventure!',
  nameX: 10,
  nameY: 75,
  dialogueX: 10,
  dialogueY: 85,
  boxColor: '#7c5941',
  textColor: '#2d1f1f',
  frames: [],
  frameDuration: 1000,
  typingSpeed: 50,
  customFont: null,
  fontFamily: '"Courier New", monospace',
  boxStyle: 'simple',
  customBoxImage: null,
  ornateBorderColor: '#5a2f2f',
  ornateAccentColor: '#c97676',
  ornateCornerColor: '#8b4545',
  scenes: [],
  currentSceneIndex: -1,
  activeSpeaker: 'none',
  bobbingEnabled: true,
  bobbingTarget: 'none',
  bobbingSpeed: 2,
  bobbingAmplitude: 6,
  bobbingDirection: 'vertical',
  char1Library: [],
  char2Library: [],
  selectedChar1: null,
  selectedChar2: null,
  bgLibrary: [],
  selectedBg: null,
  textBoxLibrary: [],
  selectedTextBox: null,
  editingMovementSceneIndex: -1
};

function drawScene(partialText = null, speakerOverride = null, sceneBoxStyle = null, fadeOpacity = 1, fadeType = null) {
  const activeSpeaker = speakerOverride !== null ? speakerOverride : state.activeSpeaker;
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 1;

  if (state.bgImage) {
    const scaleFactor = state.bgScale / 100;
    const bgWidth = state.bgImage.width * scaleFactor;
    const bgHeight = state.bgImage.height * scaleFactor;
    const x = (canvas.width * state.bgX / 100) - (bgWidth / 2);
    const y = (canvas.height * state.bgY / 100) - (bgHeight / 2);
    ctx.drawImage(state.bgImage, x, y, bgWidth, bgHeight);
  }

  if (state.charImage) {
    const scaleFactor = state.charScale / 100;
    const charWidth = state.charImage.width * scaleFactor;
    const charHeight = state.charImage.height * scaleFactor;
    const shouldBob = state.bobbingEnabled && (state.bobbingTarget === 'char1' || state.bobbingTarget === 'both');
    const bobOffset = shouldBob ? Math.sin(animationTime * 0.004 * state.bobbingSpeed) * state.bobbingAmplitude : 0;
    const xOffset = state.bobbingDirection === 'horizontal' ? bobOffset : 0;
    const yOffset = state.bobbingDirection === 'vertical' ? bobOffset : 0;
    const x = (canvas.width * state.charX / 100) - (charWidth / 2) + xOffset;
    const y = (canvas.height * state.charY / 100) - (charHeight / 2) + yOffset;

    ctx.save();
    if (state.charFlipped) {
      ctx.translate(x + charWidth, y);
      ctx.scale(-1, 1);
      ctx.drawImage(state.charImage, 0, 0, charWidth, charHeight);
    } else {
      ctx.drawImage(state.charImage, x, y, charWidth, charHeight);
    }
    ctx.restore();
  }

  if (state.char2Image) {
    const scaleFactor = state.char2Scale / 100;
    const charWidth = state.char2Image.width * scaleFactor;
    const charHeight = state.char2Image.height * scaleFactor;
    const shouldBob = state.bobbingEnabled && (state.bobbingTarget === 'char2' || state.bobbingTarget === 'both');
    const bobOffset = shouldBob ? Math.sin(animationTime * 0.004 * state.bobbingSpeed) * state.bobbingAmplitude : 0;
    const xOffset = state.bobbingDirection === 'horizontal' ? bobOffset : 0;
    const yOffset = state.bobbingDirection === 'vertical' ? bobOffset : 0;
    const x = (canvas.width * state.char2X / 100) - (charWidth / 2) + xOffset;
    const y = (canvas.height * state.char2Y / 100) - (charHeight / 2) + yOffset;

    ctx.save();
    if (state.char2Flipped) {
      ctx.translate(x + charWidth, y);
      ctx.scale(-1, 1);
      ctx.drawImage(state.char2Image, 0, 0, charWidth, charHeight);
    } else {
      ctx.drawImage(state.char2Image, x, y, charWidth, charHeight);
    }
    ctx.restore();
  }

  if (state.showDialogue) {
    drawDialogueBox(partialText, sceneBoxStyle);
  }

  if (fadeType === 'fadeIn') {
    ctx.globalAlpha = 1 - fadeOpacity;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (fadeType === 'fadeOut') {
    ctx.globalAlpha = fadeOpacity;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.globalAlpha = 1;
}

function drawDecorativeCorner(x, y, size, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.fillStyle = state.ornateCornerColor;
  ctx.strokeStyle = state.ornateBorderColor;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size, 0);
  ctx.lineTo(size * 0.7, size * 0.3);
  ctx.lineTo(size * 0.3, size * 0.7);
  ctx.lineTo(0, size);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = state.ornateAccentColor;
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.5, size * 0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawRose(x, y, size) {
  ctx.save();

  ctx.fillStyle = '#d45d79';
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((i * Math.PI * 2) / 5);
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.4, size * 0.3, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = '#b84560';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawDialogueBox(partialText = null, sceneBoxStyle = null) {
  const boxHeight = 160;
  const boxY = canvas.height - boxHeight - 20;
  const boxX = 20;
  const boxWidth = canvas.width - 40;
  const cornerSize = 40;

  const boxStyle = sceneBoxStyle?.boxStyle || state.boxStyle;
  const customBoxImage = sceneBoxStyle?.customBoxImage || state.customBoxImage;
  const ornateBorderColor = sceneBoxStyle?.ornateBorderColor || state.ornateBorderColor;
  const ornateAccentColor = sceneBoxStyle?.ornateAccentColor || state.ornateAccentColor;
  const ornateCornerColor = sceneBoxStyle?.ornateCornerColor || state.ornateCornerColor;
  const boxColor = sceneBoxStyle?.boxColor || state.boxColor;
  const textColor = sceneBoxStyle?.textColor || state.textColor;

  const activeTextBoxImage = state.selectedTextBox !== null ? state.textBoxLibrary[state.selectedTextBox]?.image : null;

  if (activeTextBoxImage) {
    ctx.drawImage(activeTextBoxImage, boxX, boxY, boxWidth, boxHeight);
  } else if (boxStyle === 'custom' && customBoxImage) {
    ctx.drawImage(customBoxImage, boxX, boxY, boxWidth, boxHeight);
  } else {
    ctx.fillStyle = boxColor;
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    if (boxStyle === 'simple') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.strokeRect(boxX + 4, boxY + 4, boxWidth - 8, boxHeight - 8);
    } else if (boxStyle === 'ornate') {
      ctx.strokeStyle = ornateBorderColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

      ctx.strokeStyle = ornateAccentColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX + 4, boxY + 4, boxWidth - 8, boxHeight - 8);

      const savedOrnateCornerColor = state.ornateCornerColor;
      state.ornateCornerColor = ornateCornerColor;
      drawDecorativeCorner(boxX + 5, boxY + 5, cornerSize, 0);
      drawDecorativeCorner(boxX + boxWidth - 5, boxY + 5, cornerSize, Math.PI / 2);
      drawDecorativeCorner(boxX + boxWidth - 5, boxY + boxHeight - 5, cornerSize, Math.PI);
      drawDecorativeCorner(boxX + 5, boxY + boxHeight - 5, cornerSize, -Math.PI / 2);
      state.ornateCornerColor = savedOrnateCornerColor;

      drawRose(boxX + boxWidth - 45, boxY + boxHeight - 45, 20);
    }
  }

  ctx.fillStyle = textColor;
  ctx.font = `bold 24px ${state.fontFamily}`;
  const nameXPos = (canvas.width * state.nameX / 100);
  const nameYPos = (canvas.height * state.nameY / 100);
  ctx.fillText(state.charName, nameXPos, nameYPos);

  ctx.font = `20px ${state.fontFamily}`;
  const textToDisplay = partialText !== null ? partialText : state.dialogueText;
  const lines = wrapText(textToDisplay, boxWidth - 120);
  const dialogueXPos = (canvas.width * state.dialogueX / 100);
  const dialogueYPos = (canvas.height * state.dialogueY / 100);
  lines.forEach((line, index) => {
    ctx.fillText(line, dialogueXPos, dialogueYPos + (index * 30));
  });
}

function wrapText(text, maxWidth) {
  ctx.font = `20px ${state.fontFamily}`;
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 3);
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function animate() {
  animationTime = performance.now();
  drawScene();
  animationFrameId = requestAnimationFrame(animate);
}

function startAnimation() {
  if (!animationFrameId) {
    animate();
  }
}

function stopAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function updateBgSelect() {
  const select = document.getElementById('bgSelect');
  select.innerHTML = '<option value="">None</option>';
  state.bgLibrary.forEach((item, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = item.name;
    select.appendChild(option);
  });
  if (state.selectedBg !== null) {
    select.value = state.selectedBg;
  }
}

document.getElementById('bgImageInput').addEventListener('change', async (e) => {
  if (e.target.files[0]) {
    const nameInput = document.getElementById('bgNameInput');
    const name = nameInput.value.trim() || `Background ${state.bgLibrary.length + 1}`;
    const img = await loadImage(e.target.files[0]);

    state.bgLibrary.push({ name, image: img });
    state.selectedBg = state.bgLibrary.length - 1;
    state.bgImage = img;

    updateBgSelect();
    renderScenes();
    nameInput.value = '';
    e.target.value = '';
    drawScene();
  }
});

document.getElementById('bgSelect').addEventListener('change', (e) => {
  const index = e.target.value;
  if (index === '') {
    state.selectedBg = null;
    state.bgImage = null;
  } else {
    state.selectedBg = parseInt(index);
    state.bgImage = state.bgLibrary[state.selectedBg].image;
  }
  drawScene();
});

function updateChar1Select() {
  const select = document.getElementById('char1Select');
  select.innerHTML = '<option value="">None</option>';
  state.char1Library.forEach((item, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = item.name;
    select.appendChild(option);
  });
  if (state.selectedChar1 !== null) {
    select.value = state.selectedChar1;
  }
}

function updateChar2Select() {
  const select = document.getElementById('char2Select');
  select.innerHTML = '<option value="">None</option>';
  state.char2Library.forEach((item, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = item.name;
    select.appendChild(option);
  });
  if (state.selectedChar2 !== null) {
    select.value = state.selectedChar2;
  }
}

document.getElementById('charImageInput').addEventListener('change', async (e) => {
  if (e.target.files[0]) {
    const nameInput = document.getElementById('char1NameInput');
    const name = nameInput.value.trim() || `Image ${state.char1Library.length + 1}`;
    const img = await loadImage(e.target.files[0]);

    state.char1Library.push({ name, image: img });
    state.selectedChar1 = state.char1Library.length - 1;
    state.charImage = img;

    updateChar1Select();
    renderScenes();
    nameInput.value = '';
    e.target.value = '';
    startAnimation();
  }
});

document.getElementById('char1Select').addEventListener('change', (e) => {
  const index = e.target.value;
  if (index === '') {
    state.selectedChar1 = null;
    state.charImage = null;
    stopAnimation();
  } else {
    state.selectedChar1 = parseInt(index);
    state.charImage = state.char1Library[state.selectedChar1].image;
    startAnimation();
  }
  drawScene();
});

document.getElementById('clearBgBtn').addEventListener('click', () => {
  state.bgImage = null;
  state.selectedBg = null;
  document.getElementById('bgSelect').value = '';
  drawScene();
});

document.getElementById('clearBgLibraryBtn').addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all background images?')) {
    state.bgLibrary = [];
    state.bgImage = null;
    state.selectedBg = null;
    updateBgSelect();
    drawScene();
  }
});

document.getElementById('clearCharBtn').addEventListener('click', () => {
  state.charImage = null;
  state.selectedChar1 = null;
  document.getElementById('char1Select').value = '';
  stopAnimation();
  drawScene();
});

document.getElementById('clearChar1LibraryBtn').addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all Character 1 images?')) {
    state.char1Library = [];
    state.charImage = null;
    state.selectedChar1 = null;
    updateChar1Select();
    drawScene();
  }
});

document.getElementById('flipCharBtn').addEventListener('click', () => {
  state.charFlipped = !state.charFlipped;
  drawScene();
});

document.getElementById('charXPos').addEventListener('input', (e) => {
  state.charX = parseInt(e.target.value);
  document.getElementById('charXValue').textContent = state.charX;
  drawScene();
});

document.getElementById('charYPos').addEventListener('input', (e) => {
  state.charY = parseInt(e.target.value);
  document.getElementById('charYValue').textContent = state.charY;
  drawScene();
});

document.getElementById('charScale').addEventListener('input', (e) => {
  state.charScale = parseInt(e.target.value);
  document.getElementById('charScaleValue').textContent = state.charScale;
  drawScene();
});

document.getElementById('char2ImageInput').addEventListener('change', async (e) => {
  if (e.target.files[0]) {
    const nameInput = document.getElementById('char2NameInput');
    const name = nameInput.value.trim() || `Image ${state.char2Library.length + 1}`;
    const img = await loadImage(e.target.files[0]);

    state.char2Library.push({ name, image: img });
    state.selectedChar2 = state.char2Library.length - 1;
    state.char2Image = img;

    updateChar2Select();
    renderScenes();
    nameInput.value = '';
    e.target.value = '';
    if (!animationFrameId && (state.charImage || state.char2Image)) {
      startAnimation();
    }
  }
});

document.getElementById('char2Select').addEventListener('change', (e) => {
  const index = e.target.value;
  if (index === '') {
    state.selectedChar2 = null;
    state.char2Image = null;
    if (!state.charImage) {
      stopAnimation();
    }
  } else {
    state.selectedChar2 = parseInt(index);
    state.char2Image = state.char2Library[state.selectedChar2].image;
    if (!animationFrameId && (state.charImage || state.char2Image)) {
      startAnimation();
    }
  }
  drawScene();
});

document.getElementById('clearChar2Btn').addEventListener('click', () => {
  state.char2Image = null;
  state.selectedChar2 = null;
  document.getElementById('char2Select').value = '';
  if (!state.charImage) {
    stopAnimation();
  }
  drawScene();
});

document.getElementById('clearChar2LibraryBtn').addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all Character 2 images?')) {
    state.char2Library = [];
    state.char2Image = null;
    state.selectedChar2 = null;
    updateChar2Select();
    drawScene();
  }
});

document.getElementById('flipChar2Btn').addEventListener('click', () => {
  state.char2Flipped = !state.char2Flipped;
  drawScene();
});

document.getElementById('char2XPos').addEventListener('input', (e) => {
  state.char2X = parseInt(e.target.value);
  document.getElementById('char2XValue').textContent = state.char2X;
  drawScene();
});

document.getElementById('char2YPos').addEventListener('input', (e) => {
  state.char2Y = parseInt(e.target.value);
  document.getElementById('char2YValue').textContent = state.char2Y;
  drawScene();
});

document.getElementById('char2Scale').addEventListener('input', (e) => {
  state.char2Scale = parseInt(e.target.value);
  document.getElementById('char2ScaleValue').textContent = state.char2Scale;
  drawScene();
});

document.getElementById('bgXPos').addEventListener('input', (e) => {
  state.bgX = parseInt(e.target.value);
  document.getElementById('bgXValue').textContent = state.bgX;
  drawScene();
});

document.getElementById('bgYPos').addEventListener('input', (e) => {
  state.bgY = parseInt(e.target.value);
  document.getElementById('bgYValue').textContent = state.bgY;
  drawScene();
});

document.getElementById('bgScale').addEventListener('input', (e) => {
  state.bgScale = parseInt(e.target.value);
  document.getElementById('bgScaleValue').textContent = state.bgScale;
  drawScene();
});

document.getElementById('showDialogue').addEventListener('change', (e) => {
  state.showDialogue = e.target.checked;
  drawScene();
});

document.getElementById('charName').addEventListener('input', (e) => {
  state.charName = e.target.value;
  if (state.currentSceneIndex >= 0) {
    state.scenes[state.currentSceneIndex].charName = e.target.value;
    renderScenes();
  }
  drawScene();
});

document.getElementById('dialogueText').addEventListener('input', (e) => {
  state.dialogueText = e.target.value;
  if (state.currentSceneIndex >= 0) {
    state.scenes[state.currentSceneIndex].dialogueText = e.target.value;
    renderScenes();
  }
  drawScene();
});

document.getElementById('nameXPos').addEventListener('input', (e) => {
  state.nameX = parseInt(e.target.value);
  document.getElementById('nameXValue').textContent = e.target.value;
  if (state.currentSceneIndex >= 0) {
    state.scenes[state.currentSceneIndex].nameX = parseInt(e.target.value);
  }
  drawScene();
});

document.getElementById('nameYPos').addEventListener('input', (e) => {
  state.nameY = parseInt(e.target.value);
  document.getElementById('nameYValue').textContent = e.target.value;
  if (state.currentSceneIndex >= 0) {
    state.scenes[state.currentSceneIndex].nameY = parseInt(e.target.value);
  }
  drawScene();
});

document.getElementById('dialogueXPos').addEventListener('input', (e) => {
  state.dialogueX = parseInt(e.target.value);
  document.getElementById('dialogueXValue').textContent = e.target.value;
  if (state.currentSceneIndex >= 0) {
    state.scenes[state.currentSceneIndex].dialogueX = parseInt(e.target.value);
  }
  drawScene();
});

document.getElementById('dialogueYPos').addEventListener('input', (e) => {
  state.dialogueY = parseInt(e.target.value);
  document.getElementById('dialogueYValue').textContent = e.target.value;
  if (state.currentSceneIndex >= 0) {
    state.scenes[state.currentSceneIndex].dialogueY = parseInt(e.target.value);
  }
  drawScene();
});

document.getElementById('boxColor').addEventListener('input', (e) => {
  state.boxColor = e.target.value;
  if (state.currentSceneIndex >= 0) {
    state.scenes[state.currentSceneIndex].boxColor = e.target.value;
  }
  drawScene();
});

document.getElementById('textColor').addEventListener('input', (e) => {
  state.textColor = e.target.value;
  if (state.currentSceneIndex >= 0) {
    state.scenes[state.currentSceneIndex].textColor = e.target.value;
  }
  drawScene();
});

document.getElementById('typingSpeed').addEventListener('input', (e) => {
  state.typingSpeed = parseInt(e.target.value);
  document.getElementById('typingSpeedValue').textContent = state.typingSpeed;
});


document.getElementById('fontInput').addEventListener('change', async (e) => {
  if (e.target.files[0]) {
    const file = e.target.files[0];
    const fontName = 'CustomFont_' + Date.now();
    const fontInfo = document.querySelector('.font-info small');

    try {
      fontInfo.textContent = 'Loading font...';
      fontInfo.style.color = '#999';

      const arrayBuffer = await file.arrayBuffer();
      const fontFace = new FontFace(fontName, arrayBuffer);

      const loadedFont = await fontFace.load();
      document.fonts.add(loadedFont);

      await document.fonts.ready;

      state.customFont = fontName;
      state.fontFamily = `"${fontName}", "Courier New", monospace`;

      await new Promise(resolve => setTimeout(resolve, 150));

      drawScene();

      fontInfo.textContent = `Using: ${file.name}`;
      fontInfo.style.color = '#667eea';
      fontInfo.style.fontWeight = '600';

      console.log('Font loaded successfully:', fontName);
    } catch (error) {
      console.error('Font loading error:', error);
      fontInfo.textContent = 'Error: ' + error.message;
      fontInfo.style.color = '#f56565';
      fontInfo.style.fontWeight = '600';
    }
  }
});

document.getElementById('clearFontBtn').addEventListener('click', () => {
  state.customFont = null;
  state.fontFamily = '"Courier New", monospace';
  drawScene();

  const fontInfo = document.querySelector('.font-info small');
  fontInfo.textContent = 'Upload .ttf, .otf, .woff, or .woff2 font files';
  fontInfo.style.color = '#666';
  fontInfo.style.fontWeight = 'normal';

  document.getElementById('fontInput').value = '';
});

function updateTextBoxSelect() {
  const select = document.getElementById('textBoxSelect');
  select.innerHTML = '<option value="">Simple (Generated)</option>';
  state.textBoxLibrary.forEach((item, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = item.name;
    select.appendChild(option);
  });
  if (state.selectedTextBox !== null) {
    select.value = state.selectedTextBox;
  }
}

document.getElementById('textBoxImageInput').addEventListener('change', async (e) => {
  if (e.target.files[0]) {
    const nameInput = document.getElementById('textBoxNameInput');
    const name = nameInput.value.trim() || `Text Box ${state.textBoxLibrary.length + 1}`;
    const img = await loadImage(e.target.files[0]);

    state.textBoxLibrary.push({ name, image: img });
    state.selectedTextBox = state.textBoxLibrary.length - 1;

    updateTextBoxSelect();
    renderScenes();
    nameInput.value = '';
    e.target.value = '';
    drawScene();
  }
});

document.getElementById('textBoxSelect').addEventListener('change', (e) => {
  const index = e.target.value;
  if (index === '') {
    state.selectedTextBox = null;
  } else {
    state.selectedTextBox = parseInt(index);
  }
  drawScene();
});

document.getElementById('clearTextBoxBtn').addEventListener('click', () => {
  state.selectedTextBox = null;
  document.getElementById('textBoxSelect').value = '';
  drawScene();
});

document.getElementById('clearTextBoxLibraryBtn').addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all text boxes?')) {
    state.textBoxLibrary = [];
    state.selectedTextBox = null;
    updateTextBoxSelect();
    drawScene();
  }
});

async function loadDefaultTextBoxes() {
  const defaultBoxes = [
    { name: 'Caligo', path: 'images/Caligo.png' },
    { name: 'Classic Black', path: 'images/Classic_Black.png' },
    { name: 'Classic Blue', path: 'images/Classic_Blue.png' },
    { name: 'Classic Brown', path: 'images/Classic_Brown.png' },
    { name: 'Classic Cyan', path: 'images/Classic_Cyan.png' },
    { name: 'Classic Green', path: 'images/Classic_Green.png' },
    { name: 'Classic Light Blue', path: 'images/Classic_Light_Blue.png' },
    { name: 'Classic Lime Green', path: 'images/Classic_Lime_Green.png' },
    { name: 'Classic Peach', path: 'images/Classic_Peach.png' },
    { name: 'Classic Pink', path: 'images/Classic_Pink.png' },
    { name: 'Classic Purple', path: 'images/Classic_Purple.png' },
    { name: 'Classic White', path: 'images/Classic_White.png' },
    { name: 'Classic Yellow', path: 'images/Classic_Yellow.png' },
    { name: 'Flower Theatre', path: 'images/Flower_Theatre.png' },
    { name: 'Henri', path: 'images/Henri.png' }
  ];

  for (const box of defaultBoxes) {
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = box.path;
      });
      state.textBoxLibrary.push({ name: box.name, image: img });
    } catch (error) {
      console.error(`Failed to load ${box.name}:`, error);
    }
  }

  updateTextBoxSelect();
}

loadDefaultTextBoxes();

document.getElementById('exportGifBtn').addEventListener('click', async () => {
  const statusDiv = document.getElementById('exportStatus');

  if (state.scenes.length === 0) {
    statusDiv.className = 'export-status error';
    statusDiv.textContent = 'Please add at least one scene before exporting.';
    return;
  }

  statusDiv.className = 'export-status processing';
  statusDiv.textContent = 'Generating typing animation GIF...';

  try {
    await document.fonts.ready;

    if (!window.gifenc) {
      throw new Error('GIF encoder not loaded yet. Please wait a moment and try again.');
    }

    const ctx = canvas.getContext('2d');
    const { GIFEncoder, quantize, applyPalette } = window.gifenc;

    statusDiv.textContent = 'Generating frames...';

    const frames = [];
    let frameTime = 0;

    stopAnimation();

    for (let sceneIndex = 0; sceneIndex < state.scenes.length; sceneIndex++) {
      const scene = state.scenes[sceneIndex];

      const savedState = {
        charName: state.charName,
        dialogueText: state.dialogueText,
        activeSpeaker: state.activeSpeaker,
        charImage: state.charImage,
        char2Image: state.char2Image,
        bgImage: state.bgImage,
        charX: state.charX,
        charY: state.charY,
        char2X: state.char2X,
        char2Y: state.char2Y,
        showDialogue: state.showDialogue,
        bobbingEnabled: state.bobbingEnabled,
        bobbingTarget: state.bobbingTarget,
        bobbingDirection: state.bobbingDirection,
        bobbingSpeed: state.bobbingSpeed,
        bobbingAmplitude: state.bobbingAmplitude
      };

      state.charName = scene.charName || '';
      state.dialogueText = scene.dialogueText || '';
      state.activeSpeaker = scene.speaker || 'none';
      state.bobbingEnabled = scene.bobbingEnabled !== undefined ? scene.bobbingEnabled : true;
      state.bobbingTarget = scene.bobbingTarget !== undefined ? scene.bobbingTarget : 'none';
      state.bobbingDirection = scene.bobbingDirection !== undefined ? scene.bobbingDirection : 'vertical';
      state.bobbingSpeed = scene.bobbingSpeed !== undefined ? scene.bobbingSpeed : 2;
      state.bobbingAmplitude = scene.bobbingAmplitude !== undefined ? scene.bobbingAmplitude : 6;

      if (scene.char1Index !== undefined && scene.char1Index !== null) {
        state.charImage = state.char1Library[scene.char1Index]?.image || null;
      } else {
        state.charImage = null;
      }

      if (scene.char2Index !== undefined && scene.char2Index !== null) {
        state.char2Image = state.char2Library[scene.char2Index]?.image || null;
      } else {
        state.char2Image = null;
      }

      if (scene.bgIndex !== undefined && scene.bgIndex !== null) {
        state.bgImage = state.bgLibrary[scene.bgIndex]?.image || null;
      } else {
        state.bgImage = null;
      }

      if (scene.type === 'movement') {
        const nodes = scene.nodes || [];
        state.showDialogue = false;

        if (nodes.length >= 2) {
          const frameDelay = 33;
          const speed = scene.movementSpeed || 200;

          for (let seg = 0; seg < nodes.length - 1; seg++) {
            const fromNode = nodes[seg];
            const toNode = nodes[seg + 1];
            const dx = (toNode.x - fromNode.x) / 100 * canvas.width;
            const dy = (toNode.y - fromNode.y) / 100 * canvas.height;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const segDuration = (dist / speed) * 1000;
            const segFrames = Math.max(1, Math.ceil(segDuration / frameDelay));

            for (let f = 0; f <= segFrames; f++) {
              const t = f / segFrames;
              const x = fromNode.x + (toNode.x - fromNode.x) * t;
              const y = fromNode.y + (toNode.y - fromNode.y) * t;
              if (scene.movingCharacter === 'char2') {
                state.char2X = x; state.char2Y = y;
              } else {
                state.charX = x; state.charY = y;
              }
              animationTime = frameTime;
              drawScene(null, 'none', scene);
              await new Promise(resolve => requestAnimationFrame(resolve));
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              frames.push({ data: imageData.data, delay: frameDelay });
              frameTime += frameDelay;
            }
          }
        } else if (nodes.length === 1) {
          if (scene.movingCharacter === 'char2') {
            state.char2X = nodes[0].x; state.char2Y = nodes[0].y;
          } else {
            state.charX = nodes[0].x; state.charY = nodes[0].y;
          }
          animationTime = frameTime;
          drawScene(null, 'none', scene);
          await new Promise(resolve => requestAnimationFrame(resolve));
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          frames.push({ data: imageData.data, delay: 1000 });
          frameTime += 1000;
        }
      } else {
        const text = scene.dialogueText;

        if (scene.transitionType === 'fadeIn' && scene.transitionDuration > 0) {
          const transitionFrames = Math.ceil(scene.transitionDuration / state.typingSpeed);
          for (let i = 0; i < transitionFrames; i++) {
            const fadeOpacity = i / transitionFrames;
            animationTime = frameTime;
            drawScene('', scene.speaker, scene, fadeOpacity, 'fadeIn');
            await new Promise(resolve => requestAnimationFrame(resolve));
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            frames.push({ data: imageData.data, delay: state.typingSpeed });
            frameTime += state.typingSpeed;
          }
        }

        for (let i = 0; i <= text.length; i++) {
          const partialText = text.substring(0, i);
          animationTime = frameTime;
          drawScene(partialText, scene.speaker, scene);
          await new Promise(resolve => requestAnimationFrame(resolve));
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          frames.push({ data: imageData.data, delay: state.typingSpeed });
          frameTime += state.typingSpeed;
        }

        const holdDuration = scene.duration || 2000;
        const holdFrames = Math.ceil(holdDuration / state.typingSpeed);
        for (let i = 0; i < holdFrames; i++) {
          animationTime = frameTime;
          drawScene(text, scene.speaker, scene);
          await new Promise(resolve => requestAnimationFrame(resolve));
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          frames.push({ data: imageData.data, delay: state.typingSpeed });
          frameTime += state.typingSpeed;
        }

        if (scene.transitionType === 'fadeOut' && scene.transitionDuration > 0) {
          const transitionFrames = Math.ceil(scene.transitionDuration / state.typingSpeed);
          for (let i = 0; i < transitionFrames; i++) {
            const fadeOpacity = i / transitionFrames;
            animationTime = frameTime;
            drawScene(text, scene.speaker, scene, fadeOpacity, 'fadeOut');
            await new Promise(resolve => requestAnimationFrame(resolve));
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            frames.push({ data: imageData.data, delay: state.typingSpeed });
            frameTime += state.typingSpeed;
          }
        }
      }

      Object.assign(state, savedState);

      const progress = Math.round(((sceneIndex + 1) / state.scenes.length) * 80);
      statusDiv.textContent = `Generating frames... ${progress}%`;
    }

    drawScene();

    statusDiv.textContent = 'Creating color palette...';

    const allPixels = new Uint8Array(frames.length * frames[0].data.length);
    frames.forEach((frame, i) => {
      allPixels.set(frame.data, i * frame.data.length);
    });

    const palette = quantize(allPixels, 256, { format: 'rgba' });

    statusDiv.textContent = 'Encoding GIF... 0%';

    const gif = GIFEncoder();

    frames.forEach((frame, idx) => {
      const index = applyPalette(frame.data, palette, 'rgba');
      gif.writeFrame(index, canvas.width, canvas.height, {
        palette,
        delay: Math.round(frame.delay / 10),
        dispose: 2
      });
      statusDiv.textContent = `Encoding GIF... ${Math.round(((idx + 1) / frames.length) * 100)}%`;
    });

    gif.finish();

    const buffer = gif.bytes();
    const blob = new Blob([buffer], { type: 'image/gif' });
    const url = URL.createObjectURL(blob);

    const exportPreview = document.getElementById('exportPreview');
    const exportPreviewImage = document.getElementById('exportPreviewImage');
    const exportPreviewVideo = document.getElementById('exportPreviewVideo');
    exportPreviewImage.src = url;
    exportPreviewImage.style.display = 'block';
    exportPreviewVideo.style.display = 'none';
    exportPreview.style.display = 'block';

    const fileName = document.getElementById('exportFileName').value.trim() || 'dialogue_animation';
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.gif`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    statusDiv.className = 'export-status success';
    statusDiv.textContent = 'GIF exported successfully!';

    if (state.charImage || state.char2Image) {
      startAnimation();
    }
  } catch (error) {
    console.error('Export error:', error);
    statusDiv.className = 'export-status error';
    statusDiv.textContent = 'Error exporting GIF: ' + error.message;

    if (state.charImage || state.char2Image) {
      startAnimation();
    }
  }
});

let sceneIdCounter = 0;

function createScene() {
  return {
    id: sceneIdCounter++,
    charName: state.charName,
    dialogueText: '',
    speaker: 'none',
    duration: 2000,
    boxStyle: state.boxStyle,
    customBoxImage: state.customBoxImage,
    ornateBorderColor: state.ornateBorderColor,
    ornateAccentColor: state.ornateAccentColor,
    ornateCornerColor: state.ornateCornerColor,
    boxColor: state.boxColor,
    textColor: state.textColor,
    nameX: state.nameX,
    nameY: state.nameY,
    dialogueX: state.dialogueX,
    dialogueY: state.dialogueY,
    bobbingEnabled: state.bobbingEnabled,
    bobbingTarget: state.bobbingTarget,
    bobbingDirection: state.bobbingDirection,
    bobbingSpeed: state.bobbingSpeed,
    bobbingAmplitude: state.bobbingAmplitude,
    char1Index: state.selectedChar1,
    char2Index: state.selectedChar2,
    bgIndex: state.selectedBg,
    textBoxIndex: state.selectedTextBox,
    transitionType: 'none',
    transitionDuration: 500
  };
}

function createMovementScene() {
  return {
    id: sceneIdCounter++,
    type: 'movement',
    movingCharacter: 'char1',
    nodes: [],
    movementSpeed: 200,
    char1Index: state.selectedChar1,
    char2Index: state.selectedChar2,
    bgIndex: state.selectedBg,
    textBoxIndex: state.selectedTextBox,
    transitionType: 'none',
    transitionDuration: 500,
    bobbingEnabled: false,
    bobbingTarget: 'none',
    bobbingDirection: 'vertical',
    bobbingSpeed: 2,
    bobbingAmplitude: 6,
    showDialogue: false,
    charName: state.charName,
    dialogueText: '',
    speaker: 'none',
    boxStyle: state.boxStyle,
    customBoxImage: state.customBoxImage,
    ornateBorderColor: state.ornateBorderColor,
    ornateAccentColor: state.ornateAccentColor,
    ornateCornerColor: state.ornateCornerColor,
    boxColor: state.boxColor,
    textColor: state.textColor,
    nameX: state.nameX,
    nameY: state.nameY,
    dialogueX: state.dialogueX,
    dialogueY: state.dialogueY
  };
}

function calculateMovementDuration(scene) {
  if (!scene.nodes || scene.nodes.length < 2) return 1000;
  let totalPixels = 0;
  for (let i = 1; i < scene.nodes.length; i++) {
    const dx = (scene.nodes[i].x - scene.nodes[i - 1].x) / 100 * canvas.width;
    const dy = (scene.nodes[i].y - scene.nodes[i - 1].y) / 100 * canvas.height;
    totalPixels += Math.sqrt(dx * dx + dy * dy);
  }
  return Math.round((totalPixels / (scene.movementSpeed || 200)) * 1000);
}

function calculateSceneDuration(scene) {
  if (scene.type === 'movement') return calculateMovementDuration(scene);
  const textLength = scene.dialogueText.length;
  const typingTime = textLength * state.typingSpeed;
  const holdTime = scene.duration;
  return typingTime + holdTime;
}

function formatDuration(ms) {
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
}

function buildSharedImageFields(container, scene, index) {
  const char1Options = state.char1Library.map((item, idx) =>
    `<option value="${idx}" ${scene.char1Index === idx ? 'selected' : ''}>${item.name}</option>`
  ).join('');
  const char1ImageField = document.createElement('div');
  char1ImageField.className = 'scene-field';
  char1ImageField.innerHTML = `
    <label>Character 1 Image:</label>
    <select onchange="updateScene(${index}, 'char1Index', this.value === '' ? null : parseInt(this.value))">
      <option value="" ${scene.char1Index === null || scene.char1Index === undefined ? 'selected' : ''}>None</option>
      ${char1Options}
    </select>
  `;

  const char2Options = state.char2Library.map((item, idx) =>
    `<option value="${idx}" ${scene.char2Index === idx ? 'selected' : ''}>${item.name}</option>`
  ).join('');
  const char2ImageField = document.createElement('div');
  char2ImageField.className = 'scene-field';
  char2ImageField.innerHTML = `
    <label>Character 2 Image:</label>
    <select onchange="updateScene(${index}, 'char2Index', this.value === '' ? null : parseInt(this.value))">
      <option value="" ${scene.char2Index === null || scene.char2Index === undefined ? 'selected' : ''}>None</option>
      ${char2Options}
    </select>
  `;

  const bgOptions = state.bgLibrary.map((item, idx) =>
    `<option value="${idx}" ${scene.bgIndex === idx ? 'selected' : ''}>${item.name}</option>`
  ).join('');
  const bgImageField = document.createElement('div');
  bgImageField.className = 'scene-field';
  bgImageField.innerHTML = `
    <label>Background Image:</label>
    <select onchange="updateScene(${index}, 'bgIndex', this.value === '' ? null : parseInt(this.value))">
      <option value="" ${scene.bgIndex === null || scene.bgIndex === undefined ? 'selected' : ''}>None</option>
      ${bgOptions}
    </select>
  `;

  const transitionField = document.createElement('div');
  transitionField.className = 'scene-field';
  const currentTransition = scene.transitionType || 'none';
  transitionField.innerHTML = `
    <label>Transition Type:</label>
    <select onchange="updateScene(${index}, 'transitionType', this.value)">
      <option value="none" ${currentTransition === 'none' ? 'selected' : ''}>None</option>
      <option value="fadeIn" ${currentTransition === 'fadeIn' ? 'selected' : ''}>Fade In from Black</option>
      <option value="fadeOut" ${currentTransition === 'fadeOut' ? 'selected' : ''}>Fade Out to Black</option>
    </select>
  `;

  const transitionDurationValue = scene.transitionDuration || 500;
  const transitionDurationField = document.createElement('div');
  transitionDurationField.className = 'scene-field';
  transitionDurationField.innerHTML = `
    <label>Transition Duration: <span>${formatDuration(transitionDurationValue)}</span></label>
    <input type="range" min="100" max="2000" step="100" value="${transitionDurationValue}"
      oninput="this.previousElementSibling.querySelector('span').textContent = formatDuration(this.value); updateScene(${index}, 'transitionDuration', parseInt(this.value))" />
  `;

  container.appendChild(bgImageField);
  container.appendChild(char1ImageField);
  container.appendChild(char2ImageField);
  container.appendChild(transitionField);
  container.appendChild(transitionDurationField);
}

function buildMovementSceneDetails(container, scene, index) {
  const movingCharField = document.createElement('div');
  movingCharField.className = 'scene-field';
  const movingChar = scene.movingCharacter || 'char1';
  movingCharField.innerHTML = `
    <label>Moving Character:</label>
    <select onchange="updateScene(${index}, 'movingCharacter', this.value)">
      <option value="char1" ${movingChar === 'char1' ? 'selected' : ''}>Character 1</option>
      <option value="char2" ${movingChar === 'char2' ? 'selected' : ''}>Character 2</option>
    </select>
  `;

  const speedValue = scene.movementSpeed || 200;
  const speedField = document.createElement('div');
  speedField.className = 'scene-field';
  speedField.innerHTML = `
    <label>Movement Speed: <span>${speedValue}px/s</span></label>
    <input type="range" min="50" max="800" step="10" value="${speedValue}"
      oninput="this.previousElementSibling.querySelector('span').textContent = this.value + 'px/s'; updateScene(${index}, 'movementSpeed', parseInt(this.value))" />
  `;

  const nodesField = document.createElement('div');
  nodesField.className = 'scene-field';
  const nodes = scene.nodes || [];
  const nodeRows = nodes.map((n, ni) => `
    <div class="movement-node" data-scene="${index}" data-node="${ni}">
      <span class="node-number">${ni + 1}</span>
      <span class="node-coords">X: ${n.x}% Y: ${n.y}%</span>
      <button class="scene-btn delete" onclick="removeMovementNode(${index}, ${ni})">x</button>
    </div>
  `).join('');
  const isEditing = state.currentSceneIndex === index && state.editingMovementSceneIndex === index;
  nodesField.innerHTML = `
    <label>Movement Nodes (${nodes.length}):</label>
    <div class="nodes-list">${nodeRows || '<small style="color:#999">No nodes yet</small>'}</div>
    <button class="scene-btn ${isEditing ? 'active-node-btn' : ''}" style="margin-top:6px;width:100%"
      onclick="toggleMovementNodeEdit(${index})">
      ${isEditing ? 'Done Adding Nodes' : 'Click Canvas to Add Nodes'}
    </button>
    <button class="scene-btn" style="margin-top:4px;width:100%;color:#e53e3e;border-color:#e53e3e"
      onclick="clearMovementNodes(${index})">Clear All Nodes</button>
  `;

  container.appendChild(movingCharField);
  container.appendChild(speedField);
  buildSharedImageFields(container, scene, index);
  container.appendChild(nodesField);
}

function buildDialogueSceneDetails(container, scene, index) {
  const nameField = document.createElement('div');
  nameField.className = 'scene-field';
  nameField.innerHTML = `
    <label>Character Name:</label>
    <input type="text" value="${scene.charName}" onchange="updateScene(${index}, 'charName', this.value)" />
  `;

  const textField = document.createElement('div');
  textField.className = 'scene-field';
  textField.innerHTML = `
    <label>Dialogue:</label>
    <textarea onchange="updateScene(${index}, 'dialogueText', this.value)">${scene.dialogueText}</textarea>
  `;

  const textBoxOptions = state.textBoxLibrary.map((item, idx) =>
    `<option value="${idx}" ${scene.textBoxIndex === idx ? 'selected' : ''}>${item.name}</option>`
  ).join('');
  const textBoxField = document.createElement('div');
  textBoxField.className = 'scene-field';
  textBoxField.innerHTML = `
    <label>Text Box:</label>
    <select onchange="updateScene(${index}, 'textBoxIndex', this.value === '' ? null : parseInt(this.value))">
      <option value="" ${scene.textBoxIndex === null || scene.textBoxIndex === undefined ? 'selected' : ''}>Simple (Generated)</option>
      ${textBoxOptions}
    </select>
  `;

  const speakerField = document.createElement('div');
  speakerField.className = 'scene-field';
  speakerField.innerHTML = `
    <label>Who's Talking:</label>
    <select onchange="updateScene(${index}, 'speaker', this.value)">
      <option value="none" ${scene.speaker === 'none' ? 'selected' : ''}>None</option>
      <option value="char1" ${scene.speaker === 'char1' ? 'selected' : ''}>Character 1</option>
      <option value="char2" ${scene.speaker === 'char2' ? 'selected' : ''}>Character 2</option>
    </select>
  `;

  const bobbingChecked = scene.bobbingEnabled !== false;
  const bobbingEnabledField = document.createElement('div');
  bobbingEnabledField.className = 'scene-field';
  bobbingEnabledField.innerHTML = `
    <label style="display: flex; align-items: center; gap: 8px;">
      <input type="checkbox" ${bobbingChecked ? 'checked' : ''}
        onchange="updateScene(${index}, 'bobbingEnabled', this.checked)" />
      Enable Bobbing Animation
    </label>
  `;

  const bobbingTarget = scene.bobbingTarget || 'none';
  const bobbingTargetField = document.createElement('div');
  bobbingTargetField.className = 'scene-field';
  bobbingTargetField.innerHTML = `
    <label>Bobbing Target:</label>
    <select onchange="updateScene(${index}, 'bobbingTarget', this.value)">
      <option value="none" ${bobbingTarget === 'none' ? 'selected' : ''}>None</option>
      <option value="char1" ${bobbingTarget === 'char1' ? 'selected' : ''}>Character 1</option>
      <option value="char2" ${bobbingTarget === 'char2' ? 'selected' : ''}>Character 2</option>
      <option value="both" ${bobbingTarget === 'both' ? 'selected' : ''}>Both Characters</option>
    </select>
  `;

  const bobbingDirection = scene.bobbingDirection || 'vertical';
  const bobbingDirectionField = document.createElement('div');
  bobbingDirectionField.className = 'scene-field';
  bobbingDirectionField.innerHTML = `
    <label>Bobbing Direction:</label>
    <select onchange="updateScene(${index}, 'bobbingDirection', this.value)">
      <option value="vertical" ${bobbingDirection === 'vertical' ? 'selected' : ''}>Vertical</option>
      <option value="horizontal" ${bobbingDirection === 'horizontal' ? 'selected' : ''}>Horizontal</option>
    </select>
  `;

  const bobbingSpeed = scene.bobbingSpeed !== undefined ? scene.bobbingSpeed : 2;
  const bobbingSpeedField = document.createElement('div');
  bobbingSpeedField.className = 'scene-field';
  bobbingSpeedField.innerHTML = `
    <label>Bobbing Speed: <span>${bobbingSpeed}</span></label>
    <input type="range" min="1" max="5" step="1" value="${bobbingSpeed}"
      oninput="this.previousElementSibling.querySelector('span').textContent = this.value; updateScene(${index}, 'bobbingSpeed', parseInt(this.value))" />
  `;

  const bobbingAmplitude = scene.bobbingAmplitude !== undefined ? scene.bobbingAmplitude : 6;
  const bobbingAmplitudeField = document.createElement('div');
  bobbingAmplitudeField.className = 'scene-field';
  bobbingAmplitudeField.innerHTML = `
    <label>Bobbing Amplitude: <span>${bobbingAmplitude}px</span></label>
    <input type="range" min="1" max="20" step="1" value="${bobbingAmplitude}"
      oninput="this.previousElementSibling.querySelector('span').textContent = this.value + 'px'; updateScene(${index}, 'bobbingAmplitude', parseInt(this.value))" />
  `;

  const durationValue = scene.duration || 2000;
  const durationField = document.createElement('div');
  durationField.className = 'scene-field';
  durationField.innerHTML = `
    <label>Hold Duration: <span>${formatDuration(durationValue)}</span></label>
    <input type="range" min="500" max="5000" step="100" value="${durationValue}"
      oninput="this.previousElementSibling.querySelector('span').textContent = formatDuration(this.value); updateScene(${index}, 'duration', parseInt(this.value))" />
  `;

  const currentBoxStyle = scene.boxStyle || 'simple';
  const boxStyleField = document.createElement('div');
  boxStyleField.className = 'scene-field';
  boxStyleField.innerHTML = `
    <label>Dialogue Box Style:</label>
    <select onchange="updateSceneBoxStyle(${index}, this.value)">
      <option value="simple" ${currentBoxStyle === 'simple' ? 'selected' : ''}>Simple</option>
      <option value="ornate" ${currentBoxStyle === 'ornate' ? 'selected' : ''}>Ornate</option>
      <option value="custom" ${currentBoxStyle === 'custom' ? 'selected' : ''}>Custom Image</option>
    </select>
  `;

  const ornateColorsField = document.createElement('div');
  ornateColorsField.className = 'scene-field';
  ornateColorsField.style.display = currentBoxStyle === 'ornate' ? 'block' : 'none';
  ornateColorsField.innerHTML = `
    <label>Border Color:</label>
    <input type="color" value="${scene.ornateBorderColor || '#5a2f2f'}" onchange="updateScene(${index}, 'ornateBorderColor', this.value)" />
    <label>Accent Color:</label>
    <input type="color" value="${scene.ornateAccentColor || '#c97676'}" onchange="updateScene(${index}, 'ornateAccentColor', this.value)" />
    <label>Corner Color:</label>
    <input type="color" value="${scene.ornateCornerColor || '#8b4545'}" onchange="updateScene(${index}, 'ornateCornerColor', this.value)" />
  `;

  const customBoxImageField = document.createElement('div');
  customBoxImageField.className = 'scene-field';
  customBoxImageField.style.display = currentBoxStyle === 'custom' ? 'block' : 'none';
  customBoxImageField.innerHTML = `
    <label>Custom Box Image:</label>
    <input type="file" accept="image/*" onchange="handleSceneBoxImageUpload(${index}, this.files[0])" />
    ${scene.customBoxImage ? '<small style="color: #667eea;">Image uploaded</small>' : '<small>No image uploaded</small>'}
  `;

  container.appendChild(nameField);
  container.appendChild(textField);
  buildSharedImageFields(container, scene, index);
  container.appendChild(textBoxField);
  container.appendChild(speakerField);
  container.appendChild(bobbingEnabledField);
  container.appendChild(bobbingTargetField);
  container.appendChild(bobbingDirectionField);
  container.appendChild(bobbingSpeedField);
  container.appendChild(bobbingAmplitudeField);
  container.appendChild(durationField);
  container.appendChild(boxStyleField);
  container.appendChild(ornateColorsField);
  container.appendChild(customBoxImageField);
}

function renderScenes() {
  const scenesList = document.getElementById('scenesList');
  scenesList.innerHTML = '';

  state.scenes.forEach((scene, index) => {
    const sceneItem = document.createElement('div');
    sceneItem.className = 'scene-item' + (index === state.currentSceneIndex ? ' selected' : '');

    const sceneHeader = document.createElement('div');
    sceneHeader.className = 'scene-header';

    const sceneTitle = document.createElement('div');
    sceneTitle.className = 'scene-title';
    const duration = calculateSceneDuration(scene);
    const sceneTypeLabel = scene.type === 'movement' ? ' [Movement]' : '';
    sceneTitle.textContent = `Scene ${index + 1}${sceneTypeLabel} (${formatDuration(duration)})`;
    sceneTitle.onclick = () => loadScene(index);

    const sceneActions = document.createElement('div');
    sceneActions.className = 'scene-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'scene-btn delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteScene(index);
    };

    sceneActions.appendChild(deleteBtn);
    sceneHeader.appendChild(sceneTitle);
    sceneHeader.appendChild(sceneActions);
    sceneItem.appendChild(sceneHeader);

    const sceneDetails = document.createElement('div');
    sceneDetails.className = 'scene-details';

    if (scene.type === 'movement') {
      buildMovementSceneDetails(sceneDetails, scene, index);
    } else {
      buildDialogueSceneDetails(sceneDetails, scene, index);
    }

    sceneItem.appendChild(sceneDetails);

    scenesList.appendChild(sceneItem);
  });
}

function loadScene(index) {
  const scene = state.scenes[index];
  state.currentSceneIndex = index;
  state.editingMovementSceneIndex = -1;
  canvas.style.cursor = 'default';
  state.charName = scene.charName || '';
  state.dialogueText = scene.dialogueText || '';
  state.activeSpeaker = scene.speaker || 'none';
  state.nameX = scene.nameX !== undefined ? scene.nameX : 10;
  state.nameY = scene.nameY !== undefined ? scene.nameY : 75;
  state.dialogueX = scene.dialogueX !== undefined ? scene.dialogueX : 10;
  state.dialogueY = scene.dialogueY !== undefined ? scene.dialogueY : 85;
  state.bobbingEnabled = scene.bobbingEnabled !== undefined ? scene.bobbingEnabled : true;
  state.bobbingTarget = scene.bobbingTarget !== undefined ? scene.bobbingTarget : 'none';
  state.bobbingDirection = scene.bobbingDirection !== undefined ? scene.bobbingDirection : 'vertical';
  state.bobbingSpeed = scene.bobbingSpeed !== undefined ? scene.bobbingSpeed : 2;
  state.bobbingAmplitude = scene.bobbingAmplitude !== undefined ? scene.bobbingAmplitude : 6;

  if (scene.char1Index !== undefined && scene.char1Index !== null) {
    state.selectedChar1 = scene.char1Index;
    state.charImage = state.char1Library[scene.char1Index]?.image || null;
    document.getElementById('char1Select').value = scene.char1Index;
  } else {
    state.selectedChar1 = null;
    state.charImage = null;
    document.getElementById('char1Select').value = '';
  }

  if (scene.char2Index !== undefined && scene.char2Index !== null) {
    state.selectedChar2 = scene.char2Index;
    state.char2Image = state.char2Library[scene.char2Index]?.image || null;
    document.getElementById('char2Select').value = scene.char2Index;
  } else {
    state.selectedChar2 = null;
    state.char2Image = null;
    document.getElementById('char2Select').value = '';
  }

  if (scene.bgIndex !== undefined && scene.bgIndex !== null) {
    state.selectedBg = scene.bgIndex;
    state.bgImage = state.bgLibrary[scene.bgIndex]?.image || null;
    document.getElementById('bgSelect').value = scene.bgIndex;
  } else {
    state.selectedBg = null;
    state.bgImage = null;
    document.getElementById('bgSelect').value = '';
  }

  if (scene.textBoxIndex !== undefined && scene.textBoxIndex !== null) {
    state.selectedTextBox = scene.textBoxIndex;
    document.getElementById('textBoxSelect').value = scene.textBoxIndex;
  } else {
    state.selectedTextBox = null;
    document.getElementById('textBoxSelect').value = '';
  }

  document.getElementById('charName').value = scene.charName || '';
  document.getElementById('dialogueText').value = scene.dialogueText || '';
  document.getElementById('boxColor').value = state.boxColor;
  document.getElementById('textColor').value = state.textColor;

  renderScenes();
  if (scene.type === 'movement') {
    drawMovementScenePreview(scene);
  } else {
    drawScene(null, null, scene);
  }
}

window.updateScene = function(index, field, value) {
  state.scenes[index][field] = value;
  if (index === state.currentSceneIndex) {
    if (field === 'speaker') {
      state.activeSpeaker = value;
    } else if (field === 'char1Index') {
      state.selectedChar1 = value;
      state.charImage = value !== null ? state.char1Library[value]?.image || null : null;
      document.getElementById('char1Select').value = value !== null ? value : '';
    } else if (field === 'char2Index') {
      state.selectedChar2 = value;
      state.char2Image = value !== null ? state.char2Library[value]?.image || null : null;
      document.getElementById('char2Select').value = value !== null ? value : '';
    } else if (field === 'bgIndex') {
      state.selectedBg = value;
      state.bgImage = value !== null ? state.bgLibrary[value]?.image || null : null;
      document.getElementById('bgSelect').value = value !== null ? value : '';
    } else if (field === 'textBoxIndex') {
      state.selectedTextBox = value;
      document.getElementById('textBoxSelect').value = value !== null ? value : '';
    } else if (!['boxStyle', 'ornateBorderColor', 'ornateAccentColor', 'ornateCornerColor', 'customBoxImage'].includes(field)) {
      state[field] = value;
    }
    if (state.scenes[index].type === 'movement') {
      drawMovementScenePreview(state.scenes[index]);
    } else {
      drawScene(null, null, state.scenes[index]);
    }
  }
  renderScenes();
};

window.formatDuration = formatDuration;

window.handleSceneBoxImageUpload = async function(index, file) {
  if (file) {
    const img = await loadImage(file);
    state.scenes[index].customBoxImage = img;
    if (index === state.currentSceneIndex) {
      state.customBoxImage = img;
    }
    renderScenes();
    drawScene(null, null, state.scenes[index]);
  }
};

window.updateSceneBoxStyle = function(index, value) {
  state.scenes[index].boxStyle = value;
  if (index === state.currentSceneIndex) {
    state.boxStyle = value;
    drawScene(null, null, state.scenes[index]);
  }
  renderScenes();
};

function deleteScene(index) {
  state.scenes.splice(index, 1);
  if (state.currentSceneIndex === index) {
    state.currentSceneIndex = state.scenes.length > 0 ? 0 : -1;
    if (state.currentSceneIndex >= 0) {
      loadScene(state.currentSceneIndex);
    }
  } else if (state.currentSceneIndex > index) {
    state.currentSceneIndex--;
  }
  renderScenes();
}

document.getElementById('addSceneBtn').addEventListener('click', () => {
  const scene = createScene();
  scene.dialogueText = state.dialogueText;
  scene.speaker = state.activeSpeaker;
  state.scenes.push(scene);
  loadScene(state.scenes.length - 1);
});

document.getElementById('addMovementSceneBtn').addEventListener('click', () => {
  const scene = createMovementScene();
  state.scenes.push(scene);
  loadScene(state.scenes.length - 1);
});

async function exportAsMP4() {
  const statusDiv = document.getElementById('exportStatus');

  if (state.scenes.length === 0) {
    statusDiv.className = 'export-status error';
    statusDiv.textContent = 'Please add at least one scene before exporting.';
    return;
  }

  statusDiv.className = 'export-status processing';
  statusDiv.textContent = 'Recording video...';

  try {
    await document.fonts.ready;
    stopAnimation();

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 5000000
    });

    const chunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);

      const exportPreview = document.getElementById('exportPreview');
      const exportPreviewImage = document.getElementById('exportPreviewImage');
      const exportPreviewVideo = document.getElementById('exportPreviewVideo');
      exportPreviewVideo.src = url;
      exportPreviewVideo.style.display = 'block';
      exportPreviewImage.style.display = 'none';
      exportPreview.style.display = 'block';

      const fileName = document.getElementById('exportFileName').value.trim() || 'dialogue_animation';
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      statusDiv.className = 'export-status success';
      statusDiv.textContent = 'Video exported successfully!';

      if (state.charImage || state.char2Image) {
        startAnimation();
      }
    };

    mediaRecorder.start();

    let frameTime = 0;

    for (let sceneIndex = 0; sceneIndex < state.scenes.length; sceneIndex++) {
      const scene = state.scenes[sceneIndex];

      const savedState = {
        charName: state.charName,
        dialogueText: state.dialogueText,
        activeSpeaker: state.activeSpeaker,
        charImage: state.charImage,
        char2Image: state.char2Image,
        bgImage: state.bgImage,
        charX: state.charX,
        charY: state.charY,
        char2X: state.char2X,
        char2Y: state.char2Y,
        showDialogue: state.showDialogue,
        bobbingEnabled: state.bobbingEnabled,
        bobbingTarget: state.bobbingTarget,
        bobbingDirection: state.bobbingDirection,
        bobbingSpeed: state.bobbingSpeed,
        bobbingAmplitude: state.bobbingAmplitude
      };

      state.charName = scene.charName || '';
      state.dialogueText = scene.dialogueText || '';
      state.activeSpeaker = scene.speaker || 'none';
      state.bobbingEnabled = scene.bobbingEnabled !== undefined ? scene.bobbingEnabled : true;
      state.bobbingTarget = scene.bobbingTarget !== undefined ? scene.bobbingTarget : 'none';
      state.bobbingDirection = scene.bobbingDirection !== undefined ? scene.bobbingDirection : 'vertical';
      state.bobbingSpeed = scene.bobbingSpeed !== undefined ? scene.bobbingSpeed : 2;
      state.bobbingAmplitude = scene.bobbingAmplitude !== undefined ? scene.bobbingAmplitude : 6;

      if (scene.char1Index !== undefined && scene.char1Index !== null) {
        state.charImage = state.char1Library[scene.char1Index]?.image || null;
      } else {
        state.charImage = null;
      }

      if (scene.char2Index !== undefined && scene.char2Index !== null) {
        state.char2Image = state.char2Library[scene.char2Index]?.image || null;
      } else {
        state.char2Image = null;
      }

      if (scene.bgIndex !== undefined && scene.bgIndex !== null) {
        state.bgImage = state.bgLibrary[scene.bgIndex]?.image || null;
      } else {
        state.bgImage = null;
      }

      if (scene.type === 'movement') {
        const nodes = scene.nodes || [];
        state.showDialogue = false;

        if (nodes.length >= 2) {
          const frameDelay = 33;
          const speed = scene.movementSpeed || 200;

          for (let seg = 0; seg < nodes.length - 1; seg++) {
            const fromNode = nodes[seg];
            const toNode = nodes[seg + 1];
            const dx = (toNode.x - fromNode.x) / 100 * canvas.width;
            const dy = (toNode.y - fromNode.y) / 100 * canvas.height;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const segDuration = (dist / speed) * 1000;
            const segFrames = Math.max(1, Math.ceil(segDuration / frameDelay));

            for (let f = 0; f <= segFrames; f++) {
              const t = f / segFrames;
              const x = fromNode.x + (toNode.x - fromNode.x) * t;
              const y = fromNode.y + (toNode.y - fromNode.y) * t;
              if (scene.movingCharacter === 'char2') {
                state.char2X = x; state.char2Y = y;
              } else {
                state.charX = x; state.charY = y;
              }
              animationTime = frameTime;
              drawScene(null, 'none', scene);
              await new Promise(resolve => setTimeout(resolve, frameDelay));
              frameTime += frameDelay;
            }
          }
        } else if (nodes.length === 1) {
          if (scene.movingCharacter === 'char2') {
            state.char2X = nodes[0].x; state.char2Y = nodes[0].y;
          } else {
            state.charX = nodes[0].x; state.charY = nodes[0].y;
          }
          animationTime = frameTime;
          drawScene(null, 'none', scene);
          await new Promise(resolve => setTimeout(resolve, 1000));
          frameTime += 1000;
        }
      } else {
        const text = scene.dialogueText;

        if (scene.transitionType === 'fadeIn' && scene.transitionDuration > 0) {
          const transitionFrames = Math.ceil(scene.transitionDuration / state.typingSpeed);
          for (let i = 0; i < transitionFrames; i++) {
            const fadeOpacity = i / transitionFrames;
            animationTime = frameTime;
            drawScene('', scene.speaker, scene, fadeOpacity, 'fadeIn');
            await new Promise(resolve => setTimeout(resolve, state.typingSpeed));
            frameTime += state.typingSpeed;
          }
        }

        for (let i = 0; i <= text.length; i++) {
          const partialText = text.substring(0, i);
          animationTime = frameTime;
          drawScene(partialText, scene.speaker, scene);
          await new Promise(resolve => setTimeout(resolve, state.typingSpeed));
          frameTime += state.typingSpeed;
        }

        const holdDuration = scene.duration || 2000;
        await new Promise(resolve => {
          let elapsed = 0;
          const interval = setInterval(() => {
            animationTime = frameTime + elapsed;
            drawScene(text, scene.speaker, scene);
            elapsed += 16;
            if (elapsed >= holdDuration) {
              clearInterval(interval);
              resolve();
            }
          }, 16);
        });
        frameTime += holdDuration;

        if (scene.transitionType === 'fadeOut' && scene.transitionDuration > 0) {
          const transitionFrames = Math.ceil(scene.transitionDuration / state.typingSpeed);
          for (let i = 0; i < transitionFrames; i++) {
            const fadeOpacity = i / transitionFrames;
            animationTime = frameTime;
            drawScene(text, scene.speaker, scene, fadeOpacity, 'fadeOut');
            await new Promise(resolve => setTimeout(resolve, state.typingSpeed));
            frameTime += state.typingSpeed;
          }
        }
      }

      Object.assign(state, savedState);

      const progress = Math.round(((sceneIndex + 1) / state.scenes.length) * 100);
      statusDiv.textContent = `Recording video... ${progress}%`;
    }

    mediaRecorder.stop();
    drawScene();

  } catch (error) {
    console.error('Export error:', error);
    statusDiv.className = 'export-status error';
    statusDiv.textContent = 'Error exporting video: ' + error.message;

    if (state.charImage || state.char2Image) {
      startAnimation();
    }
  }
}

document.getElementById('exportMp4Btn').addEventListener('click', exportAsMP4);

canvas.addEventListener('click', (e) => {
  if (state.editingMovementSceneIndex < 0) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const canvasX = (e.clientX - rect.left) * scaleX;
  const canvasY = (e.clientY - rect.top) * scaleY;
  const xPct = Math.round((canvasX / canvas.width) * 100);
  const yPct = Math.round((canvasY / canvas.height) * 100);
  const scene = state.scenes[state.editingMovementSceneIndex];
  if (!scene || scene.type !== 'movement') return;
  scene.nodes.push({ x: xPct, y: yPct });
  renderScenes();
  drawMovementScenePreview(scene);
});

canvas.style.cursor = 'default';

function drawMovementScenePreview(scene) {
  const savedChar = { charX: state.charX, charY: state.charY, char2X: state.char2X, char2Y: state.char2Y };

  if (scene.char1Index !== undefined && scene.char1Index !== null) {
    state.charImage = state.char1Library[scene.char1Index]?.image || null;
  } else {
    state.charImage = null;
  }
  if (scene.char2Index !== undefined && scene.char2Index !== null) {
    state.char2Image = state.char2Library[scene.char2Index]?.image || null;
  } else {
    state.char2Image = null;
  }
  if (scene.bgIndex !== undefined && scene.bgIndex !== null) {
    state.bgImage = state.bgLibrary[scene.bgIndex]?.image || null;
  } else {
    state.bgImage = null;
  }

  if (scene.nodes.length > 0) {
    const firstNode = scene.nodes[0];
    if (scene.movingCharacter === 'char1') {
      state.charX = firstNode.x;
      state.charY = firstNode.y;
    } else {
      state.char2X = firstNode.x;
      state.char2Y = firstNode.y;
    }
  }

  const savedShowDialogue = state.showDialogue;
  state.showDialogue = false;
  drawScene();
  state.showDialogue = savedShowDialogue;

  // Draw node path overlay
  if (scene.nodes.length > 0) {
    ctx.save();
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    scene.nodes.forEach((n, i) => {
      const px = n.x / 100 * canvas.width;
      const py = n.y / 100 * canvas.height;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    scene.nodes.forEach((n, i) => {
      const px = n.x / 100 * canvas.width;
      const py = n.y / 100 * canvas.height;
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? '#22c55e' : '#00d4ff';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i + 1, px, py);
    });
    ctx.restore();
  }

  Object.assign(state, savedChar);
}

window.toggleMovementNodeEdit = function(index) {
  if (state.editingMovementSceneIndex === index) {
    state.editingMovementSceneIndex = -1;
    canvas.style.cursor = 'default';
    drawScene();
  } else {
    state.editingMovementSceneIndex = index;
    canvas.style.cursor = 'crosshair';
    drawMovementScenePreview(state.scenes[index]);
  }
  renderScenes();
};

window.removeMovementNode = function(sceneIndex, nodeIndex) {
  state.scenes[sceneIndex].nodes.splice(nodeIndex, 1);
  renderScenes();
  if (state.currentSceneIndex === sceneIndex) {
    drawMovementScenePreview(state.scenes[sceneIndex]);
  }
};

window.clearMovementNodes = function(sceneIndex) {
  state.scenes[sceneIndex].nodes = [];
  renderScenes();
  if (state.currentSceneIndex === sceneIndex) {
    drawMovementScenePreview(state.scenes[sceneIndex]);
  }
};

drawScene();
