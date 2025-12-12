 // --- configuration in mm ---
  const COUPLER_OFFSET_MM = 130;     // measurement starts 130 mm ahead of the drawbar
  const offset = 5
  // scale: pixels per mm (adjust if you want it bigger/smaller)
  let scaleFactor = 0.08;
  // UI elements

  let atmField;
  let drawbarLengthField;
  let drawbarWidthField;
  let trailerBodyLengthField;
  let trailerBodyWidthField;
  let trailerBodySelect;
  let numberOfAxles;
  function setup() {
    const canvasX = 20;
    const canvasY = 20;

    // canvas
    const canvas = createCanvas(900, 800);
    canvas.position(canvasX, canvasY);
    canvas.style('border', '1px solid #cccccc');

    textFont('sans-serif');

    // position for UI controls under the canvas
    const uiBaseY = canvasY + 20;
    const labelX  = canvasX + width + 50;

   toolboxCheckbox = createCheckbox('Toolbox', true);
   toolboxCheckbox.position(labelX, uiBaseY);

   atmField               = new LabeledInput('ATM (kg): ', labelX, uiBaseY + 30, '750');
   drawbarLengthField     = new LabeledInput('Drawbar length (mm):', labelX, uiBaseY + 60, '1500');
   drawbarWidthField      = new LabeledInput('Drawbar width (mm):',  labelX, uiBaseY + 90, '1500');
   trailerBodyLengthField = new LabeledInput('Length of trailer body:', labelX, uiBaseY + 120, '3000');
   trailerBodyWidthField  = new LabeledInput('Width of trailer body:',  labelX, uiBaseY + 150, '2000');

   trailerBodySelect = createSelect();
   trailerBodySelect.position(labelX + 0.165 * width, uiBaseY );
   trailerBodySelect.option('Box Trailer');
   trailerBodySelect.option('Boat Trailer');
   trailerBodySelect.option('Car Trailer');
   trailerBodySelect.option('Camper Trailer');
   trailerBodySelect.option('Horse Float');
   trailerBodySelect.selected('Box Trailer');
  }

  function draw() {
    background(255);

    //const atm = parseFloat(atmInput.value()) || 0;
    //const measuredDrawbarLengthMM = drawbarLengthInput.value(); // includes 130 mm ahead of drawbar
    //const physicalDrawbarLengthMM = Math.max(measuredDrawbarLengthMM - COUPLER_OFFSET_MM, 0);

    const atm = parseFloat(atmField.value()) || 0;
    const measuredDrawbarLengthMM = parseFloat(drawbarLengthField.value()) || 0;
    const physicalDrawbarLengthMM = Math.max(measuredDrawbarLengthMM - COUPLER_OFFSET_MM, 0);

    if(atm <= 2000) {
      numberOfAxles = 1
    } else if (atm > 2001 && atm <= 3500) {
      numberOfAxles = 2
    };
    
    // Info text
    fill(0);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(16);
    text('Light Trailer – Plan View (not to scale)', 20, 20);

    textSize(12);
    text('ATM: ' + atm.toFixed(0) + ' kg', 20, 44);
    text('Drawbar measurement: ' + measuredDrawbarLengthMM + ' mm (from 130 mm ahead of drawbar to trailer front)', 20, 60);
    text('Physical drawbar (approx.): ' + physicalDrawbarLengthMM + ' mm', 20, 76);

    // Trailer geometry origin
    const bodyFrontX = width * 0.4;   // front face of main body
    const centreY    = height * 0.3;   // trailer centreline

    drawTrailerPlan(bodyFrontX, centreY, measuredDrawbarLengthMM, atm);

  }

  /**
   * Draws the plan view trailer body + drawbar + dimensions.
   *
   * @param {number} bodyFrontX - x coordinate of the FRONT face of the main trailer body.
   * @param {number} centreY - y coordinate of the trailer centreline.
   * @param {number} measuredDrawbarLengthMM - length in mm from 130 mm ahead of drawbar
   *                                           back to the front of the body.
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
    // Measurement starts 130 mm in front of the physical drawbar, and finishes at the front of the trailer body.

    const measurementStartX = bodyFrontX - measuredDrawbarLengthMM * scaleFactor; // 130 mm ahead of drawbar
    const drawbarTipX       = measurementStartX + COUPLER_OFFSET_MM * scaleFactor; // actual drawbar tip
    const drawbarWidthPx = drawbarWidthField.value() * scaleFactor; // drawbar half-width at body front 

    // Draw drawbar as 4 lines
    line(bodyFrontX , centreY - drawbarWidthPx/2 , drawbarTipX, centreY);
    line(bodyFrontX , centreY - drawbarWidthPx/2 + offset, drawbarTipX + offset *  (measuredDrawbarLengthMM/1370) , centreY );
    line(bodyFrontX , centreY + drawbarWidthPx/2 , drawbarTipX, centreY);
    line(bodyFrontX , centreY + drawbarWidthPx/2 - offset , drawbarTipX + offset * (measuredDrawbarLengthMM/1370), centreY );
    
    // Coupler / towball point at measurement start
    const couplerX = measurementStartX;
    const couplerY = centreY;
    fill(255);
    stroke(0);
    const ballsize = 13
    const couplerLength = 2.2 * COUPLER_OFFSET_MM * scaleFactor;
    const sideCouplerLength = couplerX - ballsize + 1.5;
    rect(couplerX - 5, couplerY - 4, couplerLength, 8); // rectangular coupler
    ellipse(couplerX, couplerY, ballsize, ballsize);  // coupler symbol signifying centerpoint of towball
      
    // --- draw side view
    const centerYSideView = centreY + height * 0.35;
    const axleHeight = centerYSideView + height *0.075;
    
    rect(bodyFrontX, centerYSideView , bodyLengthPx, 50) //trailer body side view
    rect(measurementStartX, centerYSideView + 45 , measuredDrawbarLengthMM * scaleFactor, 5)//drawbar side view
    arc(couplerX - 5 , centerYSideView +42 , ballsize,  ballsize ,PI , 1.75 * PI); // Side View of Ball part of coupling
    line(sideCouplerLength, centerYSideView +42, sideCouplerLength , centerYSideView +44);
    line(sideCouplerLength + couplerLength, centerYSideView +44, sideCouplerLength + couplerLength, centerYSideView +38);
    line(sideCouplerLength, centerYSideView +44, sideCouplerLength + couplerLength, centerYSideView +44);
    line(sideCouplerLength + couplerLength, centerYSideView +38,(sideCouplerLength + couplerLength)*0.95 ,centerYSideView +38);

    // --- toolbox ---
    if(toolboxCheckbox = true){
    rect(bodyFrontX, centreY - drawbarWidthPx/2, -25, drawbarWidthPx)
    rect(bodyFrontX - 25, centerYSideView + 10, 25, 35);
    };

    // --- number of axles and placement
   
    let axleCenter = drawbarTipX + measuredDrawbarLengthMM * scaleFactor + bodyLengthPx / 2; // distance from coupler back to axle
    

    // --- wheels ---
    if(numberOfAxles===1){
      drawTyre(axleCenter,axleHeight);
    }else if(numberOfAxles===2){
      drawTyre(axleCenter - 30, axleHeight);
      drawTyre(axleCenter + 30, axleHeight);
    };

    // --- dimensions ---
    const dimYTop    = bodyTopY - 35;
    const dimYBottom = bodyBottomY + 35;

     // Centreline (dashed)
    stroke(150);
    if (drawingContext && drawingContext.setLineDash) {
      drawingContext.setLineDash([5, 5]);
    }
    line(measurementStartX - 20, centreY, bodyRearX + 20, centreY);
    //line(measurementStartX, dimYTop, measurementStartX, centreY );
    if (drawingContext && drawingContext.setLineDash) {
      drawingContext.setLineDash([]);
    }   

    // Full measurement: from 130 mm ahead of drawbar to trailer front
    drawHorizontalDimension(
      measurementStartX,
      bodyFrontX,
      dimYTop,
      measuredDrawbarLengthMM + ' mm '
    );

    // Trailer Body Length Measurement
    drawHorizontalDimension(
      bodyFrontX,
      bodyLengthPx+bodyFrontX,
      dimYTop,
      trailerBodyLengthField.value() + ' mm '
    );    

    // Trailer Body Width Measurement
    drawVerticalDimension(
      bodyLengthPx+bodyFrontX + 50,
      bodyTopY,
      bodyBottomY,
      trailerBodyWidthField.value() + ' mm '
    );

    // Drawbar Width Measurement
    drawVerticalDimension(
      bodyLengthPx + bodyFrontX + 25,
      centreY + drawbarWidthPx/2,
      centreY - drawbarWidthPx/2,
      drawbarWidthField.value() + ' mm '
    );

  }

  function drawHorizontalDimension(x1, x2, y, label) {
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

    function drawVerticalDimension(x, y1, y2, label) {
    stroke(0);
    
    // main dimension line
    line(x, y1, x, y2);

    // extension lines
    line(x - 8, y1 , x + 8, y1);
    line(x - 8, y2 , x + 8, y2);

    // label
    push();
    translate(x+8,(y1+y2) / 2);
    rotate(PI/2);
    noStroke();
    fill(0);
    textSize(11);
    textAlign(CENTER, CENTER);
    text(label, 0, 0);
    pop();
  }

function drawTyre(x,y){
    fill(0);
    circle(x, y, 50);
    fill(240);
    circle(x, y, 30);
    circle(x,y,5);
}
class LabeledInput {
  constructor(labelText, x, y, defaultValue, type = 'number') {
    this.label = createSpan(labelText);
    this.label.position(x, y);
    this.input = createInput(defaultValue, type);
    this.input.position(x + 170, y);
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
