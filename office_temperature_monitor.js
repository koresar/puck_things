// Change these as needed
var VAR = {
  temperatureCheckInterval: 10000,
  thermometerOffset: 2, // accuracy offset
  temperatureRange: {
    low: 22,
    high: 25
  },
  schedule: {
    timeOfTheDay: { start: 6 *60*60*1000, end: 21 *60*60*1000 },
    dayOfWeek: { start: 1, end: 5 } // inclusive
  },
  blinkingInterval: 1000
};

// Colour utilities
var colors = { RED: LED1, GREEN: LED2, BLUE: LED3 };
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

// Temperture checking logic: startMonitoring, stopMonitoring
function checkTemperature() {
  var temperature = E.getTemperature() + VAR.thermometerOffset;

  if (temperature <= VAR.temperatureRange.low) startBlinking(colors.BLUE);
  else if (temperature >= VAR.temperatureRange.high) startBlinking(colors.RED);
  else stopBlinking();
}
var monitoringId, isMonitoring;
function startMonitoring() {
  blink(100);
  if (isMonitoring) return;
  isMonitoring = true;
  monitoringId = setInterval(checkTemperature, VAR.temperatureCheckInterval);
  checkTemperature();
}
function stopMonitoring() {
  if (!isMonitoring) return;
  clearInterval(monitoringId);
  stopBlinking();
  isMonitoring = false;
  setDeepSleep(true);
}

// schedule logic: resetScheduler
function getTimeOfTheDay() {
  var now = new Date();
  return (
    (
      (
        now.getHours()
      )*60 + now.getMinutes()
    )*60 + now.getSeconds()
  )*1000 + now.getMilliseconds();
}
var totalMsecInADay = 24*60*60*1000;
var schedule = VAR.schedule;
function resetScheduler() {
  var msecOfTheDay = getTimeOfTheDay();
  if (msecOfTheDay >= schedule.timeOfTheDay.start && msecOfTheDay < schedule.timeOfTheDay.end) {
    setTimeout(
      resetScheduler,
      schedule.timeOfTheDay.end - msecOfTheDay
    );
    var dayOfWeek = new Date().getDay(); // respect week day schedule
    if (dayOfWeek >= schedule.dayOfWeek.start && dayOfWeek <= schedule.dayOfWeek.end) {
      startMonitoring();
    }
  } else {
    setTimeout(
      resetScheduler,
      (schedule.timeOfTheDay.start - msecOfTheDay + totalMsecInADay) % totalMsecInADay
    );
    stopMonitoring();
  }
}

turnLedsOff(); // can be On from other applications/commands
resetScheduler(); // start the monitoring and schedule a next event

setWatch(function() { // setup button clicking
  if (isMonitoring) stopMonitoring();
  else startMonitoring();
}, BTN, {edge:"rising", debounce:50, repeat:true});
