//setup event listeners for tab switching
chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "commands");
  console.log('received connection');
  port.postMessage({initiate: "start"});

  //port.postMessage({initiate: "start"});
  //on current tab switch, do the following
  chrome.tabs.onActivated.addListener(function(info) {

    console.log('a tab has been activated');
    //set recognition abort for all other tabs
    //loop through all tabs and send an abort message
    chrome.tabs.query({}, function(tabs){
      for (var i = tabs.length - 1; i >= 0; i--) {
        port.postMessage({initiate: "abort"});
      }
    });

    //set recognition start for current tab
    chrome.tabs.get(info.tabId, function(tab) {
      //send this tab a message to send a start message
      port.postMessage({initiate: "start"});
    });
  });
});
