// --- configuration in mm ---
const COUPLER_OFFSET_MM = 130;     // measurement starts 130 mm ahead of the drawbar
const offset = 5;

// scale: pixels per mm (adjust if you want it bigger/smaller)
let scaleFactor = 0.08;

// New class-based fields
let atmField;
let drawbarLengthField;
let drawbarWidthField;
let trailerBodyLengthField;
let trailerBodyWidthField;

function setup() {
  const canvasX = 20;
  const canvasY = 20;

  const canvas = createCanvas(900, 900);
  canvas.position(canvasX, canvasY);
  canvas.style('border', '1px solid #cccccc');

  textFont('sans-serif');

  const uiBaseY = canvasY + 20;
  const labelX  = canvasX + width + 50;

  atmField               = new LabeledInput('ATM (kg): ', labelX, uiBaseY, '750');
  drawbarLengthField     = new LabeledInput('Drawbar length (mm):', labelX, uiBaseY + 30, '1500');
  drawbarWidthField      = new LabeledInput('Drawbar width (mm):',  labelX, uiBaseY + 60, '2500');
  trailerBodyLengthField = new LabeledInput('Length of trailer body:', labelX, uiBaseY + 90, '3000');
  trailerBodyWidthField  = new LabeledInput('Width of trailer body:',  labelX, uiBaseY + 120, '2500');
}

function draw() {
  background(255);
  
  const atm = parseFloat(atmField.value()) || 0;
  const measuredDrawbarLengthMM = parseFloat(drawbarLengthField.value()) || 0;
  const physicalDrawbarLengthMM = Math.max(measuredDrawbarLengthMM - COUPLER_OFFSET_MM, 0);
  const halfWidthMM = (parseFloat(drawbarWidthField.value()) || 0) / 2;
  const memberAngle = atan(halfWidthMM / physicalDrawbarLengthMM); // in degrees now
  const memberLengthMM = round(physicalDrawbarLengthMM / cos(memberAngle),2);

  // Info text
  fill(0);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(16);
  text('Light Trailer – Plan View (not to scale)', 20, 20);

  textSize(12);
  text('ATM: ' + atm.toFixed(0) + ' kg', 20, 44);
  text('Ballsocket to Trailer Chassis: ' + measuredDrawbarLengthMM + ' mm (from 130 mm ahead of drawbar to trailer front)',20,60);
  text('Physical drawbar (approx.): ' + physicalDrawbarLengthMM + ' mm', 20, 76);
  text('Drawbar Main Member Length: ' + memberLengthMM + ' mm ',20, 92);

  // Trailer geometry origin
  const bodyFrontX = width * 0.45;   // front face of main body
  const centreY    = height * 0.3;   // trailer centreline

  drawTrailerPlan(bodyFrontX, centreY, measuredDrawbarLengthMM);
}

/**
 * Draws the plan view trailer body + drawbar + dimensions.
 */
function drawTrailerPlan(bodyFrontX, centreY, measuredDrawbarLengthMM) {
  // Convert main dimensions to pixels
  const bodyLengthPx = trailerBodyLengthField.value() * scaleFactor;
  const bodyWidthPx  = trailerBodyWidthField.value() * scaleFactor;
  
  const bodyRearX   = bodyFrontX + bodyLengthPx;
  const bodyTopY    = centreY - bodyWidthPx / 2;
  const bodyBottomY = centreY + bodyWidthPx / 2;
  // --- main trailer body (rectangle) ---
  stroke(0);
  fill(245);
  rect(bodyFrontX, bodyTopY, bodyLengthPx, bodyWidthPx);
  rect(bodyFrontX + offset, bodyTopY + offset, bodyLengthPx - 2 * offset, bodyWidthPx - 2 * offset);

  // --- drawbar geometry ---
  const measurementStartX = bodyFrontX - measuredDrawbarLengthMM * scaleFactor; // 130 mm ahead of drawbar
  const drawbarTipX       = measurementStartX + COUPLER_OFFSET_MM * scaleFactor; // actual drawbar tip

  // define endpoints as vectors
  let topStart = createVector(bodyFrontX, bodyTopY);
  let topEnd   = createVector(drawbarTipX, centreY);


  let botStart = createVector(bodyFrontX, bodyBottomY);
  let botEnd   = createVector(drawbarTipX, centreY);

  // draw the original A-frame members
  stroke(0);
  line(topStart.x, topStart.y, topEnd.x, topEnd.y);
  line(botStart.x, botStart.y, botEnd.x, botEnd.y);
  line(topStart.x, topStart.y+offset, topEnd.x+offset, topEnd.y);
  line(botStart.x, botStart.y-offset, botEnd.x+offset, botEnd.y);


  // Coupler / towball point at measurement start
  const couplerX = measurementStartX;
  const couplerY = centreY;

  fill(255);
  stroke(0);
  const r = 6;
  rect(couplerX - 5, couplerY - 4, 2 * COUPLER_OFFSET_MM * scaleFactor, 8);
  ellipse(couplerX, couplerY, r * 1, r * 1);

  // --- dimensions ---
  const dimYTop    = bodyTopY - 35;
  const dimYBottom = bodyBottomY + 35;

  // Centreline (dashed)
  stroke(150);
  if (drawingContext && drawingContext.setLineDash) {
    drawingContext.setLineDash([5, 5]);
  }
  line(measurementStartX - 20, centreY, bodyRearX + 20, centreY);
  line(measurementStartX, dimYTop, measurementStartX, centreY);
  if (drawingContext && drawingContext.setLineDash) {
    drawingContext.setLineDash([]);
  }

  // Full measurement: from 130 mm ahead of drawbar to trailer front
  drawDimension(
    measurementStartX,
    bodyFrontX,
    dimYTop,
    measuredDrawbarLengthMM + ' mm '
  );

  drawDimension(
    bodyFrontX,
    bodyLengthPx + bodyFrontX,
    dimYTop,
    trailerBodyLengthField.value() + ' mm '
  );
}

/**
 * Draws a horizontal dimension line a text label.
 */
function drawDimension(x1, x2, y, label) {
  stroke(0);

  // main dimension line
  line(x1, y, x2, y);

  // extension lines
  line(x1, y - 8, x1, y + 8);
  line(x2, y - 8, x2, y + 8);

  // label
  noStroke();
  fill(0);
  textSize(11);
  textAlign(CENTER, BOTTOM);
  text(label, (x1 + x2) / 2, y - 4);
}

function angleBetweenLines(x1, y1, x2, y2, x3, y3, x4, y4) {
  let angle1 = atan2(y2 - y1, x2 - x1);
  let angle2 = atan2(y4 - y3, x4 - x3);
  let diff = abs(angle1 - angle2);
  if (diff > PI) {
    diff = TWO_PI - diff;
  }
  return diff;
}

class LabeledInput {
  constructor(labelText, x, y, defaultValue, type = 'number', inputOffsetX = 170) {
    this.label = createSpan(labelText);
    this.label.position(x, y);

    this.input = createInput(defaultValue, type);
    this.input.position(x + inputOffsetX, y);
    this.input.size(80);
    this.input.attribute('min', '0');
  }

  value() {
    return this.input.value();
  }

  setValue(v) {
    this.input.value(v);
  }
}
