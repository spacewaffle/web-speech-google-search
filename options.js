
chrome.storage.sync.get('auto_start', function(items) {
  //check stored settings if we should start on launch
  if(items["auto_start"]){
    document.getElementById('auto_start').checked = true;
  }
});

//whenever the user checks or unchecks auto_start, update their settings
var el_auto_start = document.getElementById("auto_start");
el_auto_start.addEventListener("change", function(){
  chrome.storage.sync.set({'auto_start': el_auto_start.checked});
});