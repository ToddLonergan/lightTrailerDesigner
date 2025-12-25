 // --- URL: https://toddlonergan.github.io/lightTrailerDesigner/
 
 // --- Configuration in mm ---
  
 const COUPLER_OFFSET_MM = 130;     // measurement starts 130 mm ahead of the drawbar
  const offset = 5;
  
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
  let guardThickness;
let canvasEl;
const canvasX = 20;
const uiGapX = 50;
const inputOffsetX = 160; // set to match LabeledInput

function layoutUI() {
  const topbarH = document.querySelector(".topbar")?.offsetHeight || 0;
  const canvasY = topbarH + 20;

  // move canvas
  canvasEl.position(canvasX, canvasY);

  // align UI with canvas top
  const labelX = canvasX + width + uiGapX;
  const uiBaseY = canvasY;

  toolboxCheckbox.position(labelX, uiBaseY);

  // If your LabeledInput doesn’t support repositioning, ignore this section.
  // Better: add a setPosition(x,y) method to LabeledInput.
  atmField.setPosition(labelX, uiBaseY + 30);
  drawbarLengthField.setPosition(labelX, uiBaseY + 60);
  drawbarWidthField.setPosition(labelX, uiBaseY + 90);
  trailerBodyLengthField.setPosition(labelX, uiBaseY + 120);
  trailerBodyWidthField.setPosition(labelX, uiBaseY + 150);
  trailerGuardWidth.setPosition(labelX, uiBaseY + 180);

  trailerBodySelect.position(labelX + inputOffsetX, uiBaseY);
}

function setup() {
  canvasEl = createCanvas(900, 800);
  canvasEl.style("border", "1px solid #cccccc");
  textFont("sans-serif");

  // create UI once
  toolboxCheckbox = createCheckbox("Toolbox", false);

  atmField               = new LabeledInput("ATM (kg): ", labelX, 0, "2200");
  drawbarLengthField     = new LabeledInput("Drawbar length (mm):", labelX, 0, "1500");
  drawbarWidthField      = new LabeledInput("Drawbar width (mm):",  labelX, 0, "1500");
  trailerBodyLengthField = new LabeledInput("Length of trailer body (mm):", labelX, 0, "3000");
  trailerBodyWidthField  = new LabeledInput("Width of trailer body (mm):",  labelX, 0, "2000");
  trailerGuardWidth      = new LabeledInput("Width of Wheel Guards (mm):", labelX, 0, "250");

  trailerBodySelect = createSelect();
  trailerBodySelect.option("Box Trailer", 50);
  trailerBodySelect.option("Boat Trailer", 0);
  trailerBodySelect.option("Car Trailer", 1000);
  trailerBodySelect.option("Camper Trailer", 1500);
  trailerBodySelect.option("Horse Float", 1000);

  layoutUI();
}

function windowResized() {
  layoutUI();
}

  function draw() {
    background(255);

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

    drawTrailerPlan(bodyFrontX, centreY, measuredDrawbarLengthMM);
    
  };

   function drawTrailerPlan(bodyFrontX, centreY, measuredDrawbarLengthMM) {
    
    // Convert main dimensions to pixels
    const bodyLengthPx      = trailerBodyLengthField.value() * scaleFactor;
    const bodyLengthNum     = parseFloat(trailerBodyLengthField.value()) || 0;
    const bodyWidthPx       = trailerBodyWidthField.value() * scaleFactor;
    const bodyRearX         = bodyFrontX + bodyLengthPx;
    const bodyTopY          = centreY - bodyWidthPx / 2;
    const bodyBottomY       = centreY + bodyWidthPx / 2;
    const guardThickness    = trailerGuardWidth.value() * scaleFactor;
    const guardMm           = parseFloat(trailerGuardWidth.value()) || 0;
    const bodyMm            = parseFloat(trailerBodyWidthField.value()) || 0;
    const bodyWeightkg      = parseFloat(trailerBodySelect.value()) || 0;
    const totalWidth        = 2 * guardMm + bodyMm;
    const tyreDiameter      = 800;
    const tyreDiameterPx    = tyreDiameter * scaleFactor;
    const measurementStartX = bodyFrontX - measuredDrawbarLengthMM * scaleFactor; // 130 mm ahead of drawbar
    const drawbarTipX       = measurementStartX + COUPLER_OFFSET_MM * scaleFactor; // actual drawbar tip
    const drawbarWidthPx    = drawbarWidthField.value() * scaleFactor; // drawbar half-width at body front 
    const trailerCOG        = (measuredDrawbarLengthMM + bodyLengthNum)/2;
    const atm               = parseFloat(atmField.value()) || 0;
       
    // --- Main trailer body (rectangle) ---
    stroke(0);
    fill(245);
    rect(bodyFrontX, bodyTopY, bodyLengthPx, bodyWidthPx);
    rect(bodyFrontX + offset, bodyTopY + offset, bodyLengthPx - 2 * offset, bodyWidthPx - 2 * offset);

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
    const ballsize = 13;
    const couplerLength = 2.2 * COUPLER_OFFSET_MM * scaleFactor;
    const sideCouplerLength = couplerX - ballsize + 1.5;
    rect(couplerX - 5, couplerY - 4, couplerLength, 8); // rectangular coupler
    ellipse(couplerX, couplerY, ballsize, ballsize);  // coupler symbol signifying centerpoint of towball
      
    // --- Trailer side view
    const centerYSideView = centreY + height * 0.35;
    const axleHeight = centerYSideView + height *0.075;
    
    // --- Trailer body side view
    rect(bodyFrontX, centerYSideView , bodyLengthPx, 50) 
    rect(measurementStartX, centerYSideView + 45 , measuredDrawbarLengthMM * scaleFactor, 5)//drawbar side view
    line(bodyFrontX+5, centerYSideView,bodyFrontX+5, centerYSideView+50);
    line(bodyRearX-5, centerYSideView, bodyRearX-5, centerYSideView+50);
    line(bodyFrontX+5, centerYSideView+4, bodyRearX-5, centerYSideView+4);

    // --- Side view of ball part of coupling
    arc(couplerX - 5 , centerYSideView +42 , ballsize,  ballsize ,PI , 1.75 * PI); 
    line(sideCouplerLength, centerYSideView +42, sideCouplerLength , centerYSideView +44);
    line(sideCouplerLength + couplerLength, centerYSideView +44, sideCouplerLength + couplerLength, centerYSideView +38);
    line(sideCouplerLength, centerYSideView +44, sideCouplerLength + couplerLength, centerYSideView +44);
    line(sideCouplerLength + couplerLength, centerYSideView +38,(sideCouplerLength + couplerLength)*0.95 ,centerYSideView +38);

    // --- Toolbox ---
    if(toolboxCheckbox.checked()){
    rect(bodyFrontX, centreY - drawbarWidthPx/2, -25, drawbarWidthPx);
    rect(bodyFrontX - 25, centerYSideView + 10, 25, 35);
    line(bodyFrontX - 25, centerYSideView + 15,bodyFrontX , centerYSideView+15)
    toolBoxPos = measuredDrawbarLengthMM - 200;
    toolBoxWeight = 40;
    }else {
    toolBoxPos = 0;
    toolBoxWeight = 0;
    };
    
    // --- Axle Position 
    // I am assuming the weight of the trailer frame to be 22kg/m of length which is based on a Grade 350 150x50x3 RHS averaging 9kg per m. (https://www.southernsteel.com.au/)
    // As the drawbar is made up of 2 of these sections, I will assume 18 kg/m and add 4kg/m to be sure. Usually the chassis will be made of lighter material
    // than the the drawbar but there is more of it. Thus we can assume 22kg/m for the whole length the trailer. 
    // 22 kg/m = 0.022kg/mm
    // I will assume 150kg per axle, this will include axle, hubs, brakes, suspension and wheels. (https://www.couplemate.com.au/)
    // Braked Axle = ~90kg, Suspension = ~ 12 kg per side, wheels and tyres = 20 kg each
    // Body weight will vary for each type of trailer 
    // Assume Toolbox weight = 40 kg

    let totalTrailerFrameWeight = ((bodyLengthNum+measuredDrawbarLengthMM))*0.022 + numberOfAxles * 150 + bodyWeightkg; 
    let trailerCapacity = atm - toolBoxWeight - totalTrailerFrameWeight;
    let tongueWeight = (atm * 0.1); 
    let axlePositionUnScaled = round(((totalTrailerFrameWeight*trailerCOG)+(toolBoxPos*toolBoxWeight)+
    (trailerCapacity*(measuredDrawbarLengthMM+bodyLengthNum/2)))/(atm-tongueWeight),0);
    let axlePosition = drawbarTipX+axlePositionUnScaled*scaleFactor;
    
    // --- Wheels and wheelguards ---

    if(numberOfAxles===1){
      drawTyre(axlePosition, axleHeight, tyreDiameterPx);
      drawTyreGuard(axlePosition, axleHeight -35, numberOfAxles);
      drawTyreGuardTop(axlePosition, bodyTopY-guardThickness, numberOfAxles, guardThickness);
      drawTyreGuardTop(axlePosition, bodyBottomY, numberOfAxles, guardThickness);
    }else if(numberOfAxles===2){
      drawTyre(axlePosition - 35, axleHeight, tyreDiameterPx);
      drawTyre(axlePosition + 35, axleHeight, tyreDiameterPx);
      drawTyreGuard(axlePosition, axleHeight-35, numberOfAxles);
      drawTyreGuardTop(axlePosition, bodyTopY-guardThickness, numberOfAxles, guardThickness);
      drawTyreGuardTop(axlePosition, bodyBottomY, numberOfAxles, guardThickness);
    };

    // --- Dimensions ---
    const dimYTop    = bodyTopY - guardThickness - 50;
    const dimYTop2   = bodyTopY - guardThickness - 20;

     // Centreline (dashed)
    stroke(150);
    if (drawingContext && drawingContext.setLineDash) {
      drawingContext.setLineDash([5, 5]);
    }
    line(measurementStartX - 20, centreY, bodyRearX + 20, centreY);
    if (drawingContext && drawingContext.setLineDash) {
      drawingContext.setLineDash([]);
    };   

    // Drawbar measurement: from 130 mm ahead of drawbar to trailer front
    drawHorizontalDimension(
      measurementStartX,
      bodyFrontX,
      dimYTop,
      measuredDrawbarLengthMM 
    );

    // Trailer body length measurement
    drawHorizontalDimension(
      bodyFrontX,
      bodyLengthPx+bodyFrontX,
      dimYTop,
      trailerBodyLengthField.value()
    );
    
    // Distance from coupling to axle position
    drawHorizontalDimension(
      measurementStartX,
      axlePosition,
      dimYTop2,
      axlePositionUnScaled
    ); 

    // Trailer body width measurement
    drawVerticalDimension(
      bodyLengthPx+bodyFrontX + 50,
      bodyTopY,
      bodyBottomY,
      trailerBodyWidthField.value() 
    );

    // Drawbar width measurement
    drawVerticalDimension(
      bodyLengthPx + bodyFrontX + 25,
      centreY + drawbarWidthPx/2,
      centreY - drawbarWidthPx/2,
      drawbarWidthField.value() 
    );
    
    // Total trailer width measurement
    drawVerticalDimension(
      bodyLengthPx + bodyFrontX + 75,
      bodyTopY - guardThickness,
      bodyBottomY + guardThickness,
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

function drawTyre(x,y,d){
    fill(0);
    circle(x, y, d);
    fill(240);
    circle(x, y, d * 0.6);
    circle(x,y, d * 0.1);
}

function drawTyreGuard(x,y,num){
    beginShape();
    vertex(x, y);
    vertex(x+30*num,y)
    vertex(x+30*num+15,y+20);
    vertex(x+30*num+15,y+15);
    vertex(x+30*num,y-5);
    vertex(x-30*num,y-5);
    vertex(x-30*num-15,y+15);
    vertex(x-30*num-15,y+20);
    vertex(x-30*num,y);
    vertex(x,y);
    endShape(CLOSE);
    line(x+30*num+15,y+20,x+30*num+15,y+40)
    };

function drawTyreGuardTop(x,y,num,guardThickness){
  rect(x-30*num, y, 60*num , guardThickness);
  rect(x-30*num-15, y, 15, guardThickness);
  rect(x+30*num, y, 15, guardThickness);
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
