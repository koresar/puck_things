var lastTemp = 0;
var lastBat = 0;
var lastUpdatedAt = Date.now();

function secToStr(sec) {
  sec = Math.round(sec);
  var str = sec + " sec";
  if (sec > 60) {
    const min = Math.round(sec / 60);
    str = sec + " min";
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
  if (temp && bat) {
    g.drawString(`Battery: ${bat || lastBat}`);

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

function scanForDevices() {
  NRF.findDevices(function(devs) {
    var dev = devs.filter(d => d.manufacturer===0x590)[0];

    if (!dev) return draw();
    var d = new DataView(dev.manufacturerData);
    const n = d.getInt8(1);
    const f = d.getInt8(2)/100.0;
    //console.log(n, f);
    draw(n + f, d.getUint8(0));
  }, 1000); // scan for 1 sec
}

setInterval(scanForDevices, 6000);
scanForDevices();
