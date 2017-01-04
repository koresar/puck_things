var colors = { RED: LED1, GREEN: LED2, BLUE: LED3 };
function turnLedsOff() {
  colors.RED.reset();
  colors.GREEN.reset();
  colors.BLUE.reset();
}

function blink(delay, LED) {
  LED = LED || colors.GREEN;
  LED.set();
  setTimeout(LED.reset.bind(LED), delay);
}

var intervalId, state = 0, isBlinking = false;
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

  state = 0;
  isBlinking = LED;
  interval = interval || 1000;
  intervalId = setInterval(intervalCallback, interval);
}
function intervalCallback() {
  if (!isBlinking) return;
  state = (state + 1) % 2;
  isBlinking.write(state);
  if (state) setTimeout(intervalCallback, 100);
}

function checkTemperature() {
  var temperature = E.getTemperature() + 2; // accuracy offset

  if (temperature <= 22) startBlinking(colors.BLUE);
  else if (temperature >= 25) startBlinking(colors.RED);
  else stopBlinking();
}
var monitoringId, isMonitoring;
function startMonitoring() {
  blink(100);
  if (isMonitoring) return;
  isMonitoring = true;
  monitoringId = setInterval(checkTemperature, 5000);
  checkTemperature();
}
function stopMonitoring() {
  clearInterval(monitoringId);
  stopBlinking();
  isMonitoring = false;
  setDeepSleep(true);
}

turnLedsOff();
startMonitoring();
setDeepSleep(true);

setWatch(function() {
  if (isMonitoring) stopMonitoring();
  else startMonitoring();
}, BTN, {edge:"rising", debounce:50, repeat:true});
