//setup event listeners for tab switching

//on current tab switch, do the following
chrome.tabs.onActivated.addListener(function(info) {
  //set recognition abort for all other tabs
  //loop through all tabs and send an abort message
  chrome.tabs.query({'windowId': windowID}, function(tab){
    chrome.tabs.sendMessage(tab.id, {greeting: "abort"}, function(response) {
      console.log(response.farewell);
    });
  });

  //set recognition start for current tab
  chrome.tabs.get(info.tabId, function(tab) {
    //send this tab a message to send a start message
    chrome.tabs.sendMessage(tab.id, {greeting: "start"}, function(response) {
      console.log(response.farewell);
    });
  });
});
