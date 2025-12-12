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
  let trailerGuardWidth;
  let trailerBodySelect;
  let numberOfAxles;
  let toolboxCheckbox;
  let guardThickness

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

   toolboxCheckbox = createCheckbox('Toolbox', false);
   toolboxCheckbox.position(labelX, uiBaseY);

   atmField               = new LabeledInput('ATM (kg): ', labelX, uiBaseY + 30, '750');
   drawbarLengthField     = new LabeledInput('Drawbar length (mm):', labelX, uiBaseY + 60, '1500');
   drawbarWidthField      = new LabeledInput('Drawbar width (mm):',  labelX, uiBaseY + 90, '1500');
   trailerBodyLengthField = new LabeledInput('Length of trailer body (mm):', labelX, uiBaseY + 120, '3000');
   trailerBodyWidthField  = new LabeledInput('Width of trailer body (mm):',  labelX, uiBaseY + 150, '2000');
   trailerGuardWidth      = new LabeledInput('Width of Wheel Guards (mm):', labelX, uiBaseY + 180, '250')

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

    // --- number of axles
    if(atm <= 2000) {
      numberOfAxles = 1
    } else {
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
    const centreY    = height * 0.4;   // trailer centreline

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
    guardThickness = trailerGuardWidth.value() * scaleFactor;
    const guardMm = parseFloat(trailerGuardWidth.value()) || 0;
    const bodyMm  = parseFloat(trailerBodyWidthField.value()) || 0;
    const totalWidth = 2 * guardMm + bodyMm;
    
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
      
    // --- Trailer side view
    const centerYSideView = centreY + height * 0.35;
    const axleHeight = centerYSideView + height *0.075;
    // --- trailer body side view
    rect(bodyFrontX, centerYSideView , bodyLengthPx, 50) 
    rect(measurementStartX, centerYSideView + 45 , measuredDrawbarLengthMM * scaleFactor, 5)//drawbar side view
    line(bodyFrontX+5, centerYSideView,bodyFrontX+5, centerYSideView+50);
    line(bodyRearX-5, centerYSideView, bodyRearX-5, centerYSideView+50);

    // --- Side View of Ball part of coupling
    arc(couplerX - 5 , centerYSideView +42 , ballsize,  ballsize ,PI , 1.75 * PI); 
    line(sideCouplerLength, centerYSideView +42, sideCouplerLength , centerYSideView +44);
    line(sideCouplerLength + couplerLength, centerYSideView +44, sideCouplerLength + couplerLength, centerYSideView +38);
    line(sideCouplerLength, centerYSideView +44, sideCouplerLength + couplerLength, centerYSideView +44);
    line(sideCouplerLength + couplerLength, centerYSideView +38,(sideCouplerLength + couplerLength)*0.95 ,centerYSideView +38);

    // --- toolbox ---
    if(toolboxCheckbox.checked()){
    rect(bodyFrontX, centreY - drawbarWidthPx/2, -25, drawbarWidthPx);
    rect(bodyFrontX - 25, centerYSideView + 10, 25, 35);
    line(bodyFrontX - 25, centerYSideView + 15,bodyFrontX , centerYSideView+15)
    }else {};
  
    // --- Axle Position TODO
    let axleCenter = drawbarTipX + measuredDrawbarLengthMM * scaleFactor + bodyLengthPx / 2; // distance from coupler back to axle
   
    // --- wheels ---
    if(numberOfAxles===1){
      drawTyre(axleCenter,axleHeight);
      drawTyreGuard(axleCenter - 30, axleHeight -30, numberOfAxles);
      drawTyreGuardTop(axleCenter-30, bodyTopY, numberOfAxles);
      drawTyreGuardTop(axleCenter-30, bodyBottomY+guardThickness, numberOfAxles);
    }else if(numberOfAxles===2){
      drawTyre(axleCenter - 30, axleHeight);
      drawTyre(axleCenter + 30, axleHeight);
      drawTyreGuard(axleCenter - 50, axleHeight-30, numberOfAxles);
      drawTyreGuardTop(axleCenter - 50, bodyTopY, numberOfAxles);
      drawTyreGuardTop(axleCenter - 50, bodyBottomY+guardThickness, numberOfAxles);
    };

    // --- dimensions ---
    const dimYTop    = bodyTopY - 50;

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
      measuredDrawbarLengthMM 
    );

    // Trailer Body Length Measurement
    drawHorizontalDimension(
      bodyFrontX,
      bodyLengthPx+bodyFrontX,
      dimYTop,
      trailerBodyLengthField.value()
    );    

    // Trailer Body Width Measurement
    drawVerticalDimension(
      bodyLengthPx+bodyFrontX + 50,
      bodyTopY,
      bodyBottomY,
      trailerBodyWidthField.value() 
    );

    // Drawbar Width Measurement
    drawVerticalDimension(
      bodyLengthPx + bodyFrontX + 25,
      centreY + drawbarWidthPx/2,
      centreY - drawbarWidthPx/2,
      drawbarWidthField.value() 
    );
    
    drawVerticalDimension(
      bodyLengthPx + bodyFrontX + 75,
      bodyTopY - 25,
      bodyBottomY + 25,
      totalWidth
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

function drawTyreGuard(x,y,num){
    beginShape();
    vertex(x, y);
    vertex(x+45*num+10,y)
    vertex(x+45*num+25,y+20);
    vertex(x+45*num+25,y+15);
    vertex(x+45*num+10,y-5);
    vertex(x,y-5);
    vertex(x-15,y+15);
    vertex(x-15,y+20);
    vertex(x,y);
    endShape();
    line(x+45*num+25,y+20,x+45*num+25,y+35) // mud flap
  };

function drawTyreGuardTop(x,y,num){
  rect(x-15, y,45*num+25, -guardThickness);
  rect(x+45*num+10, y, 15, -guardThickness);
  rect(x-15, y, 15, -guardThickness);
 };
class LabeledInput {
  constructor(labelText, x, y, defaultValue, type = 'number') {
    this.label = createSpan(labelText);
    this.label.position(x, y);
    this.input = createInput(defaultValue, type);
    this.input.position(x + 200, y);
    this.input.size(50);
    this.input.attribute('min', '0');
  }

  value() {
    return this.input.value();
  }

  setValue(v) {
    this.input.value(v);
  }
}
