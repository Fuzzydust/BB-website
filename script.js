
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
  char1Library: [],
  char2Library: [],
  selectedChar1: null,
  selectedChar2: null,
  bgLibrary: [],
  selectedBg: null
};

function drawScene(partialText = null, speakerOverride = null, sceneBoxStyle = null) {
  const activeSpeaker = speakerOverride !== null ? speakerOverride : state.activeSpeaker;
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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
    const bobOffset = activeSpeaker === 'char1' ? Math.sin(animationTime * 0.003) * 6 : 0;
    const x = (canvas.width * state.charX / 100) - (charWidth / 2);
    const y = (canvas.height * state.charY / 100) - (charHeight / 2) + bobOffset;

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
    const bobOffset = activeSpeaker === 'char2' ? Math.sin(animationTime * 0.003) * 6 : 0;
    const x = (canvas.width * state.char2X / 100) - (charWidth / 2);
    const y = (canvas.height * state.char2Y / 100) - (charHeight / 2) + bobOffset;

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

  if (boxStyle === 'custom' && customBoxImage) {
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
  ctx.fillText(state.charName, boxX + 60, boxY + 45);

  ctx.font = `20px ${state.fontFamily}`;
  const textToDisplay = partialText !== null ? partialText : state.dialogueText;
  const lines = wrapText(textToDisplay, boxWidth - 120);
  lines.forEach((line, index) => {
    ctx.fillText(line, boxX + 60, boxY + 85 + (index * 30));
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
  drawScene();
});

document.getElementById('clearCharBtn').addEventListener('click', () => {
  state.charImage = null;
  stopAnimation();
  drawScene();
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

document.getElementById('customBoxInput').addEventListener('change', (e) => {
  if (e.target.files[0]) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        state.customBoxImage = img;
        drawScene();
      };
      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  }
});

document.getElementById('clearCustomBoxBtn').addEventListener('click', () => {
  state.customBoxImage = null;
  document.getElementById('customBoxInput').value = '';
  drawScene();
});

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
      const text = scene.dialogueText;

      const savedState = {
        charName: state.charName,
        dialogueText: state.dialogueText,
        activeSpeaker: state.activeSpeaker,
        charImage: state.charImage,
        char2Image: state.char2Image,
        bgImage: state.bgImage
      };

      state.charName = scene.charName;
      state.dialogueText = scene.dialogueText;
      state.activeSpeaker = scene.speaker;

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

    const a = document.createElement('a');
    a.href = url;
    a.download = 'rpg-dialogue.gif';
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
    char1Index: state.selectedChar1,
    char2Index: state.selectedChar2,
    bgIndex: state.selectedBg
  };
}

function calculateSceneDuration(scene) {
  const textLength = scene.dialogueText.length;
  const typingTime = textLength * state.typingSpeed;
  const holdTime = scene.duration;
  return typingTime + holdTime;
}

function formatDuration(ms) {
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
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
    sceneTitle.textContent = `Scene ${index + 1} (${formatDuration(duration)})`;
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

    const char1ImageField = document.createElement('div');
    char1ImageField.className = 'scene-field';
    const char1Options = state.char1Library.map((item, idx) =>
      `<option value="${idx}" ${scene.char1Index === idx ? 'selected' : ''}>${item.name}</option>`
    ).join('');
    char1ImageField.innerHTML = `
      <label>Character 1 Image:</label>
      <select onchange="updateScene(${index}, 'char1Index', this.value === '' ? null : parseInt(this.value))">
        <option value="" ${scene.char1Index === null || scene.char1Index === undefined ? 'selected' : ''}>None</option>
        ${char1Options}
      </select>
    `;

    const char2ImageField = document.createElement('div');
    char2ImageField.className = 'scene-field';
    const char2Options = state.char2Library.map((item, idx) =>
      `<option value="${idx}" ${scene.char2Index === idx ? 'selected' : ''}>${item.name}</option>`
    ).join('');
    char2ImageField.innerHTML = `
      <label>Character 2 Image:</label>
      <select onchange="updateScene(${index}, 'char2Index', this.value === '' ? null : parseInt(this.value))">
        <option value="" ${scene.char2Index === null || scene.char2Index === undefined ? 'selected' : ''}>None</option>
        ${char2Options}
      </select>
    `;

    const bgImageField = document.createElement('div');
    bgImageField.className = 'scene-field';
    const bgOptions = state.bgLibrary.map((item, idx) =>
      `<option value="${idx}" ${scene.bgIndex === idx ? 'selected' : ''}>${item.name}</option>`
    ).join('');
    bgImageField.innerHTML = `
      <label>Background Image:</label>
      <select onchange="updateScene(${index}, 'bgIndex', this.value === '' ? null : parseInt(this.value))">
        <option value="" ${scene.bgIndex === null || scene.bgIndex === undefined ? 'selected' : ''}>None</option>
        ${bgOptions}
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

    const durationField = document.createElement('div');
    durationField.className = 'scene-field';
    const durationValue = scene.duration || 2000;
    durationField.innerHTML = `
      <label>Hold Duration: <span>${formatDuration(durationValue)}</span></label>
      <input type="range" min="500" max="5000" step="100" value="${durationValue}"
        oninput="this.previousElementSibling.querySelector('span').textContent = formatDuration(this.value); updateScene(${index}, 'duration', parseInt(this.value))" />
    `;

    const boxStyleField = document.createElement('div');
    boxStyleField.className = 'scene-field';
    const currentBoxStyle = scene.boxStyle || 'simple';
    boxStyleField.innerHTML = `
      <label>Dialogue Box Style:</label>
      <select onchange="updateScene(${index}, 'boxStyle', this.value)">
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

    sceneDetails.appendChild(nameField);
    sceneDetails.appendChild(textField);
    sceneDetails.appendChild(bgImageField);
    sceneDetails.appendChild(char1ImageField);
    sceneDetails.appendChild(char2ImageField);
    sceneDetails.appendChild(speakerField);
    sceneDetails.appendChild(durationField);
    sceneDetails.appendChild(boxStyleField);
    sceneDetails.appendChild(ornateColorsField);
    sceneItem.appendChild(sceneDetails);

    scenesList.appendChild(sceneItem);
  });
}

function loadScene(index) {
  const scene = state.scenes[index];
  state.currentSceneIndex = index;
  state.charName = scene.charName;
  state.dialogueText = scene.dialogueText;
  state.activeSpeaker = scene.speaker;

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

  document.getElementById('charName').value = scene.charName;
  document.getElementById('dialogueText').value = scene.dialogueText;
  document.getElementById('boxColor').value = state.boxColor;
  document.getElementById('textColor').value = state.textColor;

  renderScenes();
  drawScene(null, null, scene);
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
    } else if (!['boxStyle', 'ornateBorderColor', 'ornateAccentColor', 'ornateCornerColor', 'customBoxImage'].includes(field)) {
      state[field] = value;
    }
    drawScene(null, null, state.scenes[index]);
  }
  renderScenes();
};

window.formatDuration = formatDuration;

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

      const a = document.createElement('a');
      a.href = url;
      a.download = 'rpg-dialogue.webm';
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
      const text = scene.dialogueText;

      const savedState = {
        charName: state.charName,
        dialogueText: state.dialogueText,
        activeSpeaker: state.activeSpeaker,
        charImage: state.charImage,
        char2Image: state.char2Image,
        bgImage: state.bgImage
      };

      state.charName = scene.charName;
      state.dialogueText = scene.dialogueText;
      state.activeSpeaker = scene.speaker;

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

drawScene();
