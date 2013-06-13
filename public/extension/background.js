//setup event listeners for tab switching
console.log('running background.js');

//when switching tabs, move speech recognition to the active tab
chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
  console.log('a tab has been activated');
  //set recognition stop for all other tabs
  //loop through all tabs and send an stop message
  console.log('tab url is ' + tab.url);
  if(tab.url.substring(0,15) != "chrome-devtools"){
    //stop speech recognition in all tabs
    chrome.tabs.query({}, function(tabs){
      console.log('starting query');
      for (var i = tabs.length - 1; i >= 0; i--) {
        if(tabs[i].url.substring(0,6) != "chrome"){
          if(tabs[i].id != tabId){
            console.log('sending stop to ' + tabs[i].title + " id: " + tabs[i].id);
            //eventually should check if tab is the activated tab before stoping
            chrome.tabs.sendMessage(tabs[i].id, {greeting: "stop"}, function(response) {
            });
          }
        }
      }

      //set recognition start for current tab
      console.log('sending start to ' + tab.title + " id: " + tab.id);
      //console.log('tab is ' + tab);
      //send this tab a message to send a start message
      // if(tab.id){
        chrome.tabs.sendMessage(tabId, {greeting: "start"}, function(response) {
        });
      // }
    });
  }
});


//when a tab is updated,


//utility functions

getTabs = function(){
  chrome.tabs.query({},function(tabs){console.log(tabs);});
};

chrome.runtime.onMessage.addListener(function(message){
  console.log('Received message ' + message);
});