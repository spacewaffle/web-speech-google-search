//inject dependencies into all existing open tabs
chrome.tabs.query({}, function(response){
  for (var i = response.length - 1; i >= 0; i--) {
    chrome.tabs.executeScript(response[i].id, {file: "jquery-2.1.0.min.js"});
    chrome.tabs.executeScript(response[i].id, {file: "voice_search.js"});
  }
});

//setup event listeners for tab switching
console.log('running background.js');
var is_sending, tab_id;

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
  if(tab.url.substring(0,15) != "chrome-devtools"){
    //set the tab_id of the current tab
    tab_id = tab.id;
  }
};


//event listeners

chrome.browserAction.onClicked.addListener(function() {
  chrome.windows.getCurrent(function(window) {
    chrome.windows.create({
        url: chrome.extension.getURL("popup.html"),
        width: 300,
        height: 200,
        left: window.left + window.width - 145,
        top: window.top,
        focused: true,
        type: "popup"
    });
  });
});

chrome.extension.onMessage.addListener( function(request,sender,sendResponse){
  if( request.greeting === "action" ){
    chrome.tabs.sendMessage(tab_id, {greeting: "do_action",
                                      action: request.action,
                                      result: request.result,
                                      last_action: request.last_action,
                                      last_result: request.last_result
                                    });
    console.log('last_action is ' + request.last_action);
    console.log('last_result is ' + request.last_result);
    var action = request.action;
    var result = request.result;
    switch(action){
      case "new":
        chrome.tabs.create({url: "https://google.com"});
        break;
      case "close":
        chrome.tabs.remove(tab_id);
        break;
      case "next":
        chrome.tabs.query({}, function(response){
          for (var i = response.length - 1; i >= 0; i--) {
            if(response[i].id == tab_id){
              chrome.tabs.update(response[i+1].id, {selected: true});
              break;
            }
          }
        });
      break;
      case "previous":
        chrome.tabs.query({}, function(response){
          for (var i = response.length - 1; i >= 0; i--) {
            if(response[i].id == tab_id){
              chrome.tabs.update(response[i-1].id, {selected: true});
              break;
            }
          }
        });
        break;
    }
  }
});