//setup event listeners for tab switching
console.log('running background.js');
var is_sending, tab_id;

//set the initial active tab
chrome.tabs.query({active: true}, function(response){
  for (var i = response.length - 1; i >= 0; i--) {
    console.log(response[i]);
    updateTabs(response[i]);
    break;
  }
});

//add receiver to all existing tabs
chrome.tabs.query({}, function(response){
  for (var i = response.length - 1; i >= 0; i--) {
    chrome.tabs.executeScript(response[i].id, {file: "jquery-2.1.0.min.js"});
    chrome.tabs.executeScript(response[i].id, {file: "receiver.js"});
  }
});

//when switching tabs, switch which tab is considered the active tab
chrome.tabs.onActivated.addListener(function(tab) {
  chrome.tabs.get(tab.tabId, function(tab){
    console.log('tab activated');
    updateTabs(tab);
  });
});

//update which tab is the active tab
var updateTabs = function(tab){
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

//add jquery and receiver to new tabs or refreshed tabs
chrome.tabs.onUpdated.addListener(function(tab_id, info,tab){
   console.log(info);
  if(info.status == "complete"){
    console.log('tab updated');

    updateTabs(tab);

    chrome.tabs.executeScript(tab_id, {file: "jquery-2.1.0.min.js"});
    chrome.tabs.executeScript(tab_id, {file: "receiver.js"});
  }
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