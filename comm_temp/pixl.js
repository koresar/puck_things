var lastTemp = 0;
var lastBat = 0;
var lastUpdatedAt = Date.now();

function secToStr(sec) {
  sec = Math.round(sec);
  var str = sec + " sec";
  if (sec > 60) {
    const min = Math.round(sec / 60);
    str = min + " min";
    if (min > 60) {
      const hour = Math.round(min / 60);
      str = hour + " hour";
      if (hour > 24) {
        const day = Math.round(hour / 24);
        str = day + " day";
      }
    }
  }
  return str;
}
function draw(temp, bat) {
  const now = Date.now();

  g.clear();

  // Use the small font for a title
  g.setFontBitmap();

  drawArrow3();
  drawArrow4();

  if (temp && bat) {
    g.drawString(`Sensor Battery: ${bat || lastBat}`);

    lastTemp = temp;
    lastBat = bat;
    lastUpdatedAt = now;
  } else {
    g.drawString("LAST UPDATED: " + secToStr((now-lastUpdatedAt)/1000) + " ago");
  }

  // Get the temperature as a string
  var t = lastTemp.toFixed(2);
  // Use a large font for the value itself
  g.setFontVector(40);
  var x = (g.getWidth() - g.stringWidth(t)) / 2;
  g.drawString(t, x, 10);

  // Update the screen
  g.flip();
}

function drawArrow4() {
  g.drawString("Light", 7, 58);
  g.drawLine(0,60,5,60);
  g.drawLine(0,60,3,57);
  g.drawLine(0,60,3,63);
}
function drawArrow3() {
  const s = "Rescan";
  const x = g.getWidth() - g.stringWidth(s) - 6;
  g.drawString(s, x, 58);
  g.drawLine(127,60,122,60);
  g.drawLine(127,60,124,57);
  g.drawLine(127,60,124,63);
}

function scanForDevices() {
  NRF.findDevices(function(devs) {
    var dev = devs.filter(d => d.manufacturer===0x590)[0];

    if (!dev) return draw();
    var d = new DataView(dev.manufacturerData);

    const isItLight = d.getUint8(0);
    if (isItLight) LED.reset();
    else LED.set();

    const bat = d.getUint8(1);
    const n = d.getInt8(2);
    const f = d.getInt8(3)/100.0;
    const temp = n + f;
    //console.log(n, f);
    draw(temp, bat);
  }, 1000); // scan for 1 sec
}

setWatch(function() {
  LED.toggle();
}, BTN4, {edge:"rising", debounce:50, repeat:true});

setWatch(scanForDevices, BTN3, {edge:"rising", debounce:50, repeat:true});

setInterval(scanForDevices, 6000);
scanForDevices();
