let count = 0;
setWatch(function() {
  count++;
  debugger;
  count.unexist();
  console.log(count);
}, BTN, {edge:"rising", debounce:50, repeat:true});
