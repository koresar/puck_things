// Change these as needed
var VAR = {
  temperatureCheckInterval: 600000, // 10 min
  accumulate: 100, // check 100 times in 10 min and get avg
  thermometerOffset: 0, // accuracy offset
  temperatureRange: {
    low: 16,
    high: 25
  },
  blinkingInterval: 1000
};

// Colour utilities
var colors = { RED: LED1, GREEN: LED1, BLUE: LED1 };
function turnLedsOff() {
  colors.RED.reset();
  colors.GREEN.reset();
  colors.BLUE.reset();
}

// Will blink once immediatelly
function blink(delay, LED) {
  LED = LED || colors.GREEN;
  LED.set();
  setTimeout(turnLedsOff, delay);
}

// Blinking logic: startBlinking, stopBlinking
var intervalId, isBlinking = false;
function stopBlinking(LED) {
  if (!isBlinking) return;

  isBlinking = false;
  clearInterval(intervalId);
  turnLedsOff();
}
function startBlinking(LED, interval) {
  LED = LED || colors.RED;
  if (isBlinking === LED) return;

  stopBlinking();

  isBlinking = LED;
  interval = interval || VAR.blinkingInterval;
  intervalId = setInterval(intervalCallback, interval);
}
function intervalCallback() {
  blink(100, isBlinking);
}

class Temperatures {
  constructor(opts) {
    this.accumulate = opts.accumulate || 100;
    this.accumulated = [];
    this.temps = [];
    this.maxT = -100;
    this.minT = 100;
  }
  
  push(t) {
    this.accumulated.push(t);
    if (this.accumulated.length >= this.accumulate) {
      const avg = (this.accumulated.reduce((sum, t) => sum + t, 0) / this.accumulated.length).toFixed(2);
      this.accumulated = [];
      t = avg;
    } else {
      return false;
    }
    
    this.temps.push(t);
    if (t > this.maxT) this.maxT = t;
    if (t < this.minT) this.minT = t;
    if (this.temps.length > 128) {
      const removedT = this.temps.shift();
      if (removedT > this.maxT) this.maxT = this.temps.reduce((max, t) => t > max ? t : max, this.temps[0]);
      if (removedT < this.minT) this.minT = this.temps.reduce((min, t) => t < min ? t : min, this.temps[0]);
    }
    
    return t;
  }
}

function getCurrentTemp() {
  return E.getTemperature() + VAR.thermometerOffset;
}
var lastTemps = new Temperatures({accumulate: VAR.accumulate});
lastTemps.temps.push(getCurrentTemp());

function drawAllTemps(lastTemp) {
  console.log('current=', lastTemp);
  
  // Draw a pattern with lines
  g.clear();
  const temps = lastTemps.temps;
  for (var i=0; i < temps.length; i += 1) {
    g.drawLine(i, 64 - temps[i], i, 64 - temps[i]);
  }
  g.setFontVector(8);
  g.drawString("t " + lastTemp, 0, 54);
  // Update the display when done
  g.flip();
  
}

// Temperture checking logic: startMonitoring, stopMonitoring
function checkTemperature() {
  var temperature = getCurrentTemp();
  const lastTemp = lastTemps.push(temperature);
  if (lastTemp === false) return;

  drawAllTemps(lastTemp);

  if (lastTemp <= VAR.temperatureRange.low) startBlinking(colors.BLUE);
  else if (lastTemp >= VAR.temperatureRange.high) startBlinking(colors.RED);
  else stopBlinking();
}
var monitoringId, isMonitoring;
function startMonitoring() {
  blink(100);
  if (isMonitoring) return;
  isMonitoring = true;
  console.log('monitoring temperature', 'Low=', VAR.temperatureRange.low, 'HIGH=', VAR.temperatureRange.high);
  monitoringId = setInterval(checkTemperature, VAR.temperatureCheckInterval / VAR.accumulate);
  checkTemperature();
}
function stopMonitoring() {
  if (!isMonitoring) return;
  clearInterval(monitoringId);
  stopBlinking();
  console.log('stopped monitoring');
  isMonitoring = false;
}

turnLedsOff(); // can be On from other applications/commands
startMonitoring();
checkTemperature();
drawAllTemps(getCurrentTemp());

setWatch(function() { // setup button clicking
  if (isMonitoring) stopMonitoring();
  else startMonitoring();
}, BTN, {edge:"rising", debounce:50, repeat:true});
