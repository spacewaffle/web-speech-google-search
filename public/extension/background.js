//setup event listeners for tab switching
console.log('running background.js');
//on current tab switch, do the following
chrome.tabs.onActivated.addListener(function(info) {
  console.log('a tab has been activated');
  //set recognition abort for all other tabs
  //loop through all tabs and send an abort message
  console.log("activated window's id is" + info.windowId);
  chrome.tabs.query({windowId: info.windowId}, function(tabs){
    console.log('starting query');
    for (var i = tabs.length - 1; i >= 0; i--) {
      
      console.log('sending abort');
      //eventually should check if tab is the activated tab before aborting
      //chrome.tabs.sendMessage(tabs[i].id, {greeting: "abort"}, function(response) {
      //});
    }
  });

  //set recognition start for current tab
  chrome.tabs.get(info.tabId, function(tab) {
    console.log('sending start');
    //console.log('tab is ' + tab);
    //send this tab a message to send a start message
    chrome.tabs.sendMessage(tab.id, {greeting: "start"}, function(response) {
    });
  });
});
