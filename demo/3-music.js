var controls = require("ble_hid_controls");
NRF.setServices(undefined, { hid : controls.report });

setWatch(function(e) {
  var len = e.time - e.lastTime;
  if (len > 0.3) {
    controls.next();
    digitalPulse(LED1,1,100);
  } else {
    controls.playpause();
    digitalPulse(LED2,1,100);
  }
}, BTN, { edge:"falling",repeat:true,debounce:50});
