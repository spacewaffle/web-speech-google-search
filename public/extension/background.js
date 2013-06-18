//setup event listeners for tab switching
console.log('running background.js');
var is_sending;

//when switching tabs, move speech recognition to the active tab
chrome.tabs.onActivated.addListener(function(tab) {
  chrome.tabs.get(tab.tabId, function(tab){
    console.log('tab activated');
    updateTabs(tab, "activated");
  });
});


//when a tab is updated via url switch, update recognition to that tab
chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
  console.log('tab updated');
  console.log(info);
  if(info.status === "complete"){
    updateTabs(tab, "updated");
  }
});

var updateTabs = function(tab, type){
  //set recognition execute for all other tabs
  //loop through all tabs and send an execute message
  console.log(tab);
  console.log('tab url is ' + tab.url);
  if(tab.url.substring(0,15) != "chrome-devtools"){

    //set restart flag for the proper tab
    console.log('sending start to ' + tab.title + " id: " + tab.id);
    chrome.tabs.sendMessage(tab.id, {greeting: "start"});

    //execute speech recognition in all tabs
    chrome.tabs.query({}, function(tabs){
      console.log('starting query');
      for (var i = tabs.length - 1; i >= 0; i--) {
        if(tabs[i].url.substring(0,6) != "chrome"){
          //if(tabs[i].id != tab.id){
            console.log('sending execute to ' + tabs[i].title + " id: " + tabs[i].id);
            //eventually should check if tab is the activated tab before executeing
            chrome.tabs.sendMessage(tabs[i].id, {greeting: "execute"});
          //}
        }
      }

      //set recognition start for current tab
      //send this tab a message to send a start message
      //not sure if settimeout is necessary
      // window.setTimeout(function(){
      // }, 200);

    });
  }
};


//utility functions

var getTabs = function(){
  chrome.tabs.query({},function(tabs){console.log(tabs);});
};

chrome.runtime.onMessage.addListener(function(message){
  console.log('Received message ' + message);
});