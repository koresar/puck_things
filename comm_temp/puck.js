class Temperatures {
  constructor(max) {
    this.max = max || 10;
    this.temps = [];
    this._pos = 0;
    this._sum = 0;
  }
  
  push(t) {
    if (this.temps.length < this.max) {
      this.temps.push(t);
      this._sum += t;
    } else {
      this._sum -= this.temps[this._pos];
      this._sum += t;
      this.temps[this._pos] = t;
      this._pos = (this._pos+1) % this.max;
    }
    
    return this._sum / this.temps.length;
  }
}

const OFFSET = 3.5;
function readTemp() {
    return E.getTemperature() + OFFSET;
}

var lastTemps = new Temperatures();
function updateBT() {
  const t = lastTemps.push(readTemp());
  const n = Math.floor(t);
  const f = Math.round((t - n) * 100);
  //console.log(t, n, f);
  NRF.setAdvertising({}, {
    manufacturer: 0x590,
    manufacturerData: [Puck.getBatteryPercentage(), n, f]
  });
}

setInterval(updateBT, 3000);
updateBT();
