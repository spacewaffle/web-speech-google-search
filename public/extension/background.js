//setup event listeners for tab switching
console.log('running background.js');
//on current tab switch, do the following
console.log(chrome.tabs);
chrome.tabs.onActivated.addListener(function(info) {
  console.log('a tab has been activated');
  //set recognition abort for all other tabs
  console.log(chrome.tabs);
  //loop through all tabs and send an abort message
  chrome.tabs.query({}, function(tabs){
  console.log(chrome.tabs);
    console.log('starting query');
    for (var i = tabs.length - 1; i >= 0; i--) {
      //eventually should check if tab is the activated tab before aborting
      chrome.tabs.sendMessage(tab[i].id, {greeting: "abort"}, function(response) {
      });
    }
  });

  //set recognition start for current tab
  chrome.tabs.get(info.tabId, function(tab) {
    //send this tab a message to send a start message
    chrome.tabs.sendMessage(tab.id, {greeting: "start"}, function(response) {
    });
  });
});

//kick off recognition start when the window loads
chrome.tabs.query({'active': true, currentWindow: true}, function(tabs){
  //send this tab a message to send a start message
  chrome.tabs.sendMessage(tabs[0].id, {greeting: "start"}, function(response) {
  });
});
