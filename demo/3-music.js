var controls = require("ble_hid_controls");
NRF.setServices(undefined, { hid: controls.report });

setWatch(function (e) {
  var len = e.time - e.lastTime;
  if (len > 1) {
    controls.mute();
    digitalPulse(LED3, 1, 100);
    setTimeout(function () {
      controls.mute();
      digitalPulse(LED3, 1, 100);
    }, 25000);
  } else if (len > 0.3) {
    controls.next();
    digitalPulse(LED1, 1, 100);
  } else {
    controls.playpause();
    digitalPulse(LED2, 1, 100);
  }
}, BTN, { edge: "falling", repeat: true, debounce: 50 });
