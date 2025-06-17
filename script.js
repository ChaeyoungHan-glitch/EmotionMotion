const canvas = document.getElementById("emotionCanvas");
const ctx = canvas.getContext("2d");

const gestureCanvas = document.getElementById("gestureCanvas");
const gestureCtx = gestureCanvas.getContext("2d");

const superpositionText = document.getElementById("firstIntroText");

let collection = false;
let records = false;
let menu = false;
let retry = false;
let share = false;
let learn = false;
let exit = false;
let collapse = false;

let tutorialDone = false;
let tutorialTextDone = false;

let isTextInvisible = false;

let emotionShapes = [];
let userPath = [];
let isDrawing = false;
let showSpiral = false;
let spiralStep = 0;
let spiralPoints = [];

let curiosityTextShown = false;
let curiosityShapeShown = false;
let discoveryDone = false;
let shapesReset = false;
let currentEmotion = null;
let currentIntro = 1;

let clickTimes = [];
const clickWindow = 1000;
const clickThreshold = 5;
let angerIntensity = 0;

let curiosityProgress = 0;
let progress = {
  anger: 0,
  sadness: 0,
  happiness: 0,
  calm: 0,
  fear: 0
};

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const imgCollection = document.getElementById("collectionImage");
const imgRecords = document.getElementById("recordsImage");
const imgClock = document.getElementById("clockImage");
const imgMenu = document.getElementById("menuImage");
const imgLearn = document.getElementById("learnImage");
const imgRetry = document.getElementById("retryImage");
const imgShare = document.getElementById("shareImage");

const imgShareScreen = document.getElementById("shareScreen");
const imgCollectionScreen = document.getElementById("collectionScreen");
const imgLearnScreen = document.getElementById("learnScreen");
const imgRecordScreen = document.getElementById("recordScreen");
const imgCollapseScreen = document.getElementById("collapseScreen");
const imgExit = document.getElementById("exitImage");
const imgButton = document.getElementById("collapseButton");


imgCollection.addEventListener("click", () => {
  collection = true;
});
imgRecords.addEventListener("click", () => {
  records = true;
});
imgMenu.addEventListener("click", () => {
  menu = true;
});
imgRetry.addEventListener("click", () => {
  retry = true;
});
imgShare.addEventListener("click", () => {
  share = true;
});
imgLearn.addEventListener("click", () => {
  learn = true;
});
imgExit.addEventListener("click", () => {
  exit = true;
});
imgButton.addEventListener("click", () => {
  collapse = true;
});

let isDrawing = false;
let userPath = [];
let calmStartTime = 0;

gestureCanvas.addEventListener("mousedown", () => {
  isDrawing = true;
  userPath = [];

  if (!discoveryDone) {
    return;
  }

  const now = Date.now();
  clickTimes.push(now);

  clickTimes = clickTimes.filter(t => now - t < clickWindow);

  if (!tutorialTextDone || tutorialDone) {
    const rawIntensity = clickTimes.length / clickThreshold;
    angerIntensity = Math.min(1, rawIntensity);
    progress.anger = Math.min(1.5, progress.anger + rawIntensity * 0.3);
    progress.happiness = Math.min(1.5, progress.anger + rawIntensity * 0.3);
    progress.fear = Math.min(1.5, progress.anger + rawIntensity * 0.3);
    progress.calm = Math.min(1.5, progress.anger + rawIntensity * 0.3);
    progress.sadness = Math.min(1.5, progress.anger + rawIntensity * 0.3);
  }
});

gestureCanvas.addEventListener("mouseup", () => {
  isDrawing = false;

  if (menu) {
    menu = false;
  }

  if (tutorialTextDone && !tutorialDone) {
    const clicktostart = document.getElementById("clicktostart");
    clicktostart?.remove();
    tutorialDone = true;
  }

  if (discoveryDone && userPath.length > 10) {
    const curiosityScore = detectCuriosity(userPath);
    const happinessScore = detectHappiness(userPath);
    const sadnessScore = detectSadness(userPath);
    const fearScore = detectFear(userPath);
    const calmScore = detectCalm(userPath);

    if (curiosityScore > 0.2) {
    } else if (happinessScore > 0.2) {
    } else if (sadnessScore > 0.2) {
    } else if (calmScore > 0.2) {
    } else if (fearScore > 0.2) {
    }
    userPath = [];
  }

  if (currentEmotion === "anger") {
    angerIntensity = 0;
    clickTimes = [];
  }
});

gestureCanvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;

  const rect = gestureCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  userPath.push({ x, y });

  if (!tutorialTextDone || tutorialDone) {
    curiosityProgress = Math.min(1.5, detectCuriosity(userPath));
    progress.happiness = Math.min(1.5, detectHappiness(userPath));
    progress.sadness = Math.min(1.5, detectSadness(userPath));
    progress.calm = Math.min(1.5, detectCalm(userPath));
    progress.fear = Math.min(1.5, detectFear(userPath));
  }

  if (userPath.length > 200) userPath.shift();
});


function delay(ms) {
  return new Promise((resolve) => setTimeout(() => { resolve() }, ms));
}

function triggerEmotionShape(emotion) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  switch (emotion) {
    case "anger":
      drawAnger(ctx, centerX, centerY, 1.4 * 70);
      break;
    case "curiosity":
      drawCuriosity();
      break;
    case "happiness":
      drawHappiness(ctx, centerX, centerY, 70);
      break;
    case "sadness":
      drawSadness(ctx, centerX, centerY - 60, 1.6 * 70);
      break;
    case "fear":
      drawFear(ctx, centerX, centerY, 2 * 70);
      break;
    case "calm":
      drawCalm(ctx, centerX, centerY - 50, 2.6 * 70);
      break;
    default:
      console.log("Unknown emotion:", emotion);
  }
}

function triggerEmotionText(emotion) {
  const emotionText = document.getElementById("emotionText");
  emotionText.classList.add("visible");
  switch (emotion) {
    case "anger":
      emotionText.textContent = 'ANGER';
      break;
    case "curiosity":
      emotionText.textContent = 'CURIOSITY';
      break;
    case "happiness":
      emotionText.textContent = 'HAPPINESS';
      break;
    case "sadness":
      emotionText.textContent = 'SADNESS';
      break;
    case "fear":
      emotionText.textContent = 'FEAR';
      break;
    case "calm":
      emotionText.textContent = 'CALM';
      break;
    default:
      emotionText.textContent = '';
  }
}

function detectHappiness(path) {
  if (path.length < 10) return 0;

  let totalDy = 0;
  let zigzagCount = 0;

  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    totalDy += dy;

    if (i > 2) {
      const prevDx = path[i - 1].x - path[i - 2].x;
      if ((dx > 0 && prevDx < 0) || (dx < 0 && prevDx > 0)) zigzagCount++;
    }
  }

  // Check for strong upward movement and low zigzag count
  if (totalDy < -10 && zigzagCount < 3) {
    return Math.min(1.5, Math.abs(totalDy) / 10); // scale and limit happiness value
  }

  return 0;
}

function detectSadness(path) {
  if (path.length < 10) return 0;

  let totalDy = 0;
  let zigzagCount = 0;

  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    totalDy += dy;

    if (i > 2) {
      const prevDx = path[i - 1].x - path[i - 2].x;
      if ((dx > 0 && prevDx < 0) || (dx < 0 && prevDx > 0)) zigzagCount++;
    }
  }

  // Just check if downward movement is enough and zigzag is low
  if (totalDy > 10 && zigzagCount < 3) {
    return Math.min(1.5, totalDy / 10); // Normalize totalDy for a reasonable range
  }

  return 0;
}

function detectFear(path) {
  if (path.length < 15) return 0;

  let zigzagCountX = 0;
  let zigzagCountY = 0;

  for (let i = 2; i < path.length; i++) {
    const dx1 = path[i - 1].x - path[i - 2].x;
    const dx2 = path[i].x - path[i - 1].x;
    const dy1 = path[i - 1].y - path[i - 2].y;
    const dy2 = path[i].y - path[i - 1].y;

    if ((dx1 > 0 && dx2 < 0) || (dx1 < 0 && dx2 > 0)) zigzagCountX++;
    if ((dy1 > 0 && dy2 < 0) || (dy1 < 0 && dy2 > 0)) zigzagCountY++;
  }

  const totalZigzags = zigzagCountX + zigzagCountY;

  if (totalZigzags > 10) {  // many direction changes in both axes
    return Math.min(2, totalZigzags / 20);
  }

  return 0;
}

function detectCalm(path) {
  if (path.length < 20) return 0;

  // Calculate total horizontal and vertical displacement
  let totalDx = 0;
  let totalDy = 0;

  for (let i = 1; i < path.length; i++) {
    totalDx += Math.abs(path[i].x - path[i - 1].x);
    totalDy += Math.abs(path[i].y - path[i - 1].y);
  }

  // If horizontal movement is much larger than vertical, and total horizontal displacement is large enough
  if (totalDx > 150 && totalDx > totalDy * 3) {
    return Math.min(3, totalDx / 100); // scale disgust intensity by horizontal swipe length
  }

  return 0;
}

function detectCuriosity(path) {
  if (path.length < 10) return 0;

  const centerX = gestureCanvas.width / 2;
  const centerY = gestureCanvas.height / 2;

  let totalAngleChange = 0;
  let prevAngle = null;

  for (let i = 0; i < path.length; i++) {
    const dx = path[i].x - centerX;
    const dy = path[i].y - centerY;
    const angle = Math.atan2(dy, dx);

    if (prevAngle !== null) {
      let delta = angle - prevAngle;

      if (delta > Math.PI) delta -= 2 * Math.PI;
      if (delta < -Math.PI) delta += 2 * Math.PI;

      totalAngleChange += delta;
    }

    prevAngle = angle;
  }

  return (Math.abs(totalAngleChange) / (2 * Math.PI)) / 3;
}

function drawHappiness(ctx, x, y, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y - 60, 1.4 * radius, 0, Math.PI * 2);
  ctx.fillStyle = "#EBE491";
  ctx.fill();
  ctx.restore();
}

function drawSadness(ctx, x, y, radius) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();

  // Create a teardrop shape
  ctx.moveTo(0, -radius); // top point
  ctx.bezierCurveTo(radius, -radius * 0.5, radius, radius * 0.8, 0, radius); // right curve
  ctx.bezierCurveTo(-radius, radius * 0.8, -radius, -radius * 0.5, 0, -radius); // left curve

  ctx.closePath();
  ctx.fillStyle = "#91B0DC";
  ctx.fill();
  ctx.restore();
}

function drawFear(ctx, x, y, radius, cornerRadius = 10) {
  ctx.save();
  ctx.translate(x, y);

  const sides = 3;
  const angleStep = (2 * Math.PI) / sides;
  const points = [];

  // Calculate triangle vertices
  for (let i = 0; i < sides; i++) {
    const angle = -Math.PI / 2 + i * angleStep; // start at top vertex
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }

  ctx.beginPath();

  for (let i = 0; i < sides; i++) {
    const current = points[i];
    const next = points[(i + 1) % sides];
    const prev = points[(i + sides - 1) % sides];

    // Vector from current to prev and current to next
    const vPrev = { x: current.x - prev.x, y: current.y - prev.y };
    const vNext = { x: next.x - current.x, y: next.y - current.y };

    // Normalize vectors
    const lenPrev = Math.hypot(vPrev.x, vPrev.y);
    const lenNext = Math.hypot(vNext.x, vNext.y);
    const nPrev = { x: vPrev.x / lenPrev, y: vPrev.y / lenPrev };
    const nNext = { x: vNext.x / lenNext, y: vNext.y / lenNext };

    // Points for arc start and end (offset from corner by cornerRadius)
    const startX = current.x - nPrev.x * cornerRadius;
    const startY = current.y - nPrev.y * cornerRadius;

    const endX = current.x + nNext.x * cornerRadius;
    const endY = current.y + nNext.y * cornerRadius;

    if (i === 0) {
      ctx.moveTo(startX, startY);
    } else {
      ctx.lineTo(startX, startY);
    }

    // Draw rounded corner arc
    ctx.quadraticCurveTo(current.x, current.y, endX, endY);
  }

  ctx.closePath();

  ctx.fillStyle = "#D0B3E7"; // orange-ish for fear
  ctx.fill();

  ctx.restore();
}

function drawCalm(ctx, x, y, radius) {
  ctx.save();
  ctx.fillStyle = "#AEC58C";
  ctx.fillRect(x - radius / 2, y - radius / 2, radius, radius); // simple square
  ctx.restore();
}

function drawAnger(ctx, x, y, radius) {
  const spikes = 8;
  const innerRadius = 1.4 * radius * 0.4;
  const outerRadius = 1.4 * radius;

  ctx.save();
  ctx.translate(x, y - 60);
  ctx.beginPath();

  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / spikes;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = "#DA756E";
  ctx.fill();
  ctx.restore();
}

function drawCuriosity() {
  ctx.save();
  ctx.translate(centerX, centerY - 60);

  ctx.fillStyle = "#6EDABF";
  ctx.lineWidth = 4;

  const spikes = 7;
  const outerRadius = 140;
  const innerRadius = 70;

  ctx.beginPath();

  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / spikes;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function showFirstIntroText() {
  if (currentIntro !== 1) {
    return;
  }
  currentIntro++;

  const firstIntroText = document.getElementById("firstIntroText");

  delay(2000).then(() => {
    firstIntroText.classList.add("visible");
    return delay(3000);
  })
    .then(() => {
      firstIntroText.innerHTML = `<br />We call it superposition.`
      return delay(2000);
    })
    .then(() => {
      firstIntroText.innerHTML = `<br />So can your feelings.`
      return delay(2000);
    })
    .then(() => {
      firstIntroText.classList.remove("visible");
      showSpiral = true;
      prepareSpiralPath();
    })
}

function showSecondIntroText() {
  if (currentIntro !== 2) {
    return;
  }
  currentIntro++;

  const secondIntroText = document.getElementById("secondIntroText");
  secondIntroText.classList.add("visible");

  delay(3000).then(() => {
    secondIntroText.innerHTML = `<br />Was it already there,<br />or did you just create it?`
    return delay(2000);
  })
    .then(() => {
      secondIntroText.classList.remove("visible");
      discoveryDone = true;
    })
}

function showThirdIntroText() {
  if (currentIntro !== 3) {
    return;
  }
  currentIntro++;

  const thirdIntroText = document.getElementById("thirdIntroText");

  delay(1000).then(() => {
    thirdIntroText.classList.add("visible");
    return delay(2500);
  })
    .then(() => {
      thirdIntroText.innerHTML = `<br />Feel free to move!<br />Emotions react to your gestures`
      return delay(3000);
    })
    .then(() => {
      thirdIntroText.classList.remove("visible");
      discoveryDone = true;
    })
}

function showTutorialText() {
  const tutorialText = document.getElementById("tutorialText");
  tutorialText.classList.add("visible");

  delay(3000).then(() => {
    tutorialText.innerHTML = "Now, this app will<br />track your emotions<br />in real time.";
    return delay(3000);
  })
    .then(() => {
      tutorialText.innerHTML = "Just like quantum world,<br />your feelings exist in<br />many states at once,<br />waiting to be discovered";
      return delay(4500);
    })
    .then(() => {
      tutorialText.innerHTML = "<br />Small gestures can<br />reveal big emotions.";
      return delay(2200);
    })
    .then(() => {
      tutorialText.innerHTML = "So, keep moving,<br />exploring, and uncover<br />your emotions in motion.";
      return delay(3000);
    })
    .then(() => {
      tutorialText.classList.remove("visible");
      const clicktostart = document.getElementById("clicktostart");
      clicktostart.classList.add("visible");

      emotionShapes = [];
      createEmotionShapes();
      curiosityProgress = 0;
      Object.keys(progress).forEach(p => progress[p] = 0);
      tutorialTextDone = true;
      currentEmotion = null;
    })
}

function shapesCenter(threshold = 30) {
  return emotionShapes.every(shape => {
    const dx = shape.x - centerX;
    const dy = shape.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < threshold;
  });
}

function createEmotionShapes() {
  emotionShapes = [];

  const colors = ["#f55", "#5f5", "#55f", "#ff5", "#f5f", "#5ff"];
  for (let i = 0; i < 10; i++) {
    emotionShapes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 20 + Math.random() * 15,
      color: colors[i % colors.length],
      dx: (Math.random() - 0.5) * 1,
      dy: (Math.random() - 0.5) * 1,
      alpha: 0.5
    });
  }
}

function drawEmotionShapes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  emotionShapes.forEach(shape => {
    ctx.beginPath();
    ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
    ctx.fillStyle = shape.color;

    let effectiveEmotionProgress = Math.max(curiosityProgress, progress.anger, progress.happiness, progress.sadness, progress.fear, progress.calm);

    if (effectiveEmotionProgress > 0) {
      shape.x += (centerX - shape.x) * 0.02 * effectiveEmotionProgress;
      shape.y += (centerY - shape.y) * 0.02 * effectiveEmotionProgress;
      shape.alpha *= (1 - 0.01 * effectiveEmotionProgress);
      ctx.globalAlpha = shape.alpha;
    } else {
      shape.x += shape.dx;
      shape.y += shape.dy;

      if (shape.x < 0 || shape.x > canvas.width) shape.dx *= -1;
      if (shape.y < 0 || shape.y > canvas.height) shape.dy *= -1;

      ctx.globalAlpha = shape.alpha;
    }

    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function prepareSpiralPath() {
  spiralPoints = [];
  const centerX = gestureCanvas.width / 2;
  const centerY = gestureCanvas.height / 2;

  const numLoops = 1.9;
  const step = 0.1;
  const maxAngle = numLoops * 2 * Math.PI;
  const radiusGrowth = 15;

  for (let angle = 0; angle < maxAngle; angle += step) {
    const radius = radiusGrowth * angle;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    spiralPoints.push({ x, y });
  }
}

function drawSpiralGuide() {
  if (!showSpiral) return;

  gestureCtx.clearRect(0, 0, gestureCanvas.width, gestureCanvas.height);
  gestureCtx.strokeStyle = "rgba(200, 200, 200, 0.2)";
  gestureCtx.lineWidth = 20;
  gestureCtx.beginPath();

  for (let i = 0; i < spiralStep; i++) {
    const p = spiralPoints[i];
    if (i === 0) gestureCtx.moveTo(p.x, p.y);
    else gestureCtx.lineTo(p.x, p.y);
  }

  gestureCtx.stroke();

  if (spiralStep < spiralPoints.length) {
    spiralStep++;
  } else {
    spiralStep = 0;
  }
}

let triggeredTutorialText = false;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (shapesCenter() && discoveryDone) {
    console.log("Happiness:", progress.happiness.toFixed(2));
    console.log("Sadness:", progress.sadness.toFixed(2));
    console.log("Calm:", progress.calm.toFixed(2));
    console.log("Fear:", progress.fear.toFixed(2));
    console.log("Anger:", progress.anger.toFixed(2));
    console.log("Curiosity:", curiosityProgress.toFixed(2));

    if (progress.anger > 0.8) {
      currentEmotion = "anger";
    } else if (curiosityProgress > 0.8) {
      currentEmotion = "curiosity";
    } else if (progress.calm > 0.8) {
      currentEmotion = "calm";
    } else if (progress.fear > 0.8) {
      currentEmotion = "fear";
    } else if (progress.sadness > 0.8) {
      currentEmotion = "sadness";
    } else if (progress.happiness > 0.8) {
      currentEmotion = "happiness";
    }

    Object.keys(progress).forEach(p => progress[p] = 0);
    curiosityProgress = 0;
  }

  if (shapesCenter() && !curiosityTextShown) {
    gestureCtx.clearRect(0, 0, gestureCanvas.width, gestureCanvas.height);
    showSecondIntroText();
    curiosityTextShown = true;
    curiosityShapeShown = true;
  }

  if (!tutorialDone) {
    if (discoveryDone) {
      if (!shapesReset) {
        emotionShapes = [];
        createEmotionShapes();
        curiosityProgress = 0;
        shapesReset = true;
        showThirdIntroText();
      }
      drawEmotionShapes();
    } else if (curiosityShapeShown) {
      drawCuriosity();
    } else {
      showFirstIntroText();
      drawEmotionShapes();
      if (showSpiral) drawSpiralGuide();
    }
  }

  if (currentEmotion && !isTextInvisible && !tutorialDone) {
    triggerEmotionShape(currentEmotion);
    triggerEmotionText(currentEmotion);
    setTimeout(() => {
      isTextInvisible = true;
    }, 3000);
  }

  if (currentEmotion && isTextInvisible) {
    if (!triggeredTutorialText) {
      delay(1200).then(() => showTutorialText());
      triggeredTutorialText = true;
    }
    triggerEmotionShape(currentEmotion);

    const emotionText = document.getElementById("emotionText");
    if (emotionText.classList.contains("visible")) {
      emotionText.classList.remove("visible");
    }
  }

  if (retry) {
    shapesReset = false;
    if (!shapesReset) {
      emotionShapes = [];
      createEmotionShapes();
      shapesReset = true;
      showThirdIntroText();
      curiosityProgress = 0;
      Object.keys(progress).forEach(p => progress[p] = 0);
      currentEmotion = null;
    }
    retry = false;
  } else if (discoveryDone && tutorialDone) {
    if (menu) {
      drawEmotionShapes();
      imgCollapseScreen.style.display = "none";
      imgCollectionScreen.style.display = "none";
      imgRecordScreen.style.display = "none";
      imgLearnScreen.style.display = "none";
      imgShareScreen.style.display = "none";
      imgMenu.style.display = "none";
      imgShare.style.display = "block";
      imgRetry.style.display = "block";
      imgLearn.style.display = "block";
    } else {
      drawEmotionShapes();
      imgCollapseScreen.style.display = "none";
      imgCollectionScreen.style.display = "none";
      imgRecordScreen.style.display = "none";
      imgLearnScreen.style.display = "none";
      imgShareScreen.style.display = "none";
      imgShare.style.display = "none";
      imgRetry.style.display = "none";
      imgLearn.style.display = "none";
      imgMenu.style.display = "block";
      imgClock.style.display = "block";
      imgCollection.style.display = "block";
      imgRecords.style.display = "block";
    }
  }

  if (currentEmotion && tutorialDone) {
    triggerEmotionShape(currentEmotion);
    triggerEmotionText(currentEmotion);
    setTimeout(() => {
      isTextInvisible = true;
    }, 3000);
  }

  if (collection) {
    imgCollectionScreen.style.display = "block";
    imgExit.style.display = "block";
  } else if (records) {
    imgRecordScreen.style.display = "block";
    imgExit.style.display = "block";
  } else if (learn) {
    imgLearnScreen.style.display = "block";
    imgExit.style.display = "block";
  } else if (share) {
    imgShareScreen.style.display = "block";
    imgButton.style.display = "block";
    imgExit.style.display = "block";
  }

  if (collapse) {
    imgButton.style.display = "none";
    share = false;
    imgCollapseScreen.style.display = "block";
    imgExit.style.display = "block";
  }

  if (exit) {
    imgExit.style.display = "none";
    collection = false;
    records = false;
    learn = false;
    share = false;
    collapse = false;

    exit = false;
  }

  curiosityProgress *= 0.98;
  progress.happiness *= 0.98;
  progress.sadness *= 0.98;
  progress.fear *= 0.98;
  progress.calm *= 0.5;
  progress.anger *= 0.98;

  requestAnimationFrame(draw);
}

createEmotionShapes();
draw();

