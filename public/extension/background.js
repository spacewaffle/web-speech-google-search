//setup event listeners for tab switching
console.log('running background.js');
//on current tab switch, do the following
chrome.tabs.onActivated.addListener(function(info) {
  console.log('a tab has been activated');
  //set recognition abort for all other tabs
  //loop through all tabs and send an abort message

  chrome.tabs.query({windowId: info.windowId}, function(tabs){
    console.log('starting query');
    for (var i = tabs.length - 1; i >= 0; i--) {
      
      console.log('sending abort to ' + tabs[i].title + " id: " + tabs[i].id);
      //eventually should check if tab is the activated tab before aborting
      chrome.tabs.sendMessage(tabs[i].id, {greeting: "abort"}, function(response) {
      });
    }
  });

  //set recognition start for current tab
  chrome.tabs.get(info.tabId, function(tab) {
    console.log('sending start to ' + tab.title + " id: " + tab.id);
    //console.log('tab is ' + tab);
    //send this tab a message to send a start message
    chrome.tabs.sendMessage(tab.id, {greeting: "start"}, function(response) {
    });
  });
});
