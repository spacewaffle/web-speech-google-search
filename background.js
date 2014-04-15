//setup event listeners for tab switching
console.log('running background.js');
var is_sending, tab_id, popup_id = 0, auto_start, hide_on_start;

//function for opening a new window
function new_window(hide){
  chrome.windows.getCurrent(function(window) {
    chrome.windows.create({
        url: chrome.extension.getURL("popup.html"),
        width: 300,
        height: 600,
        left: window.left + window.width - 145,
        top: window.top,
        focused: true,
        type: "popup"
    }, function(new_window){
      console.log("created new popup");
      console.log(new_window);
      popup_id = new_window.id;
      console.log("hide is " + hide);
      if(hide){
        console.log('attempting to hide popup');
        chrome.windows.update(popup_id, {focused: false});
      }
    });
  });
}

//check stored settings if we should start on launch
chrome.storage.sync.get('auto_start', function(items) {

  console.log("auto start is " + items["auto_start"]);
  auto_start = items["auto_start"];
  chrome.storage.sync.get('hide_on_start', function(items){
    hide_on_start = items["hide_on_start"];
  });
  hide_on_start = hide_on_start || false;
  if(auto_start === true){
    new_window(hide_on_start);
  }
});

//set the initial active tab
chrome.tabs.query({active: true}, function(response){
  for (var i = response.length - 1; i >= 0; i--) {
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

//reset the popup id if it was closed
chrome.windows.onRemoved.addListener(function(id){
  console.log("window closed event");
  if(popup_id == id){
    popup_id = 0;
  }
});

//when clicking the icon, if Nat's popup exists, focus it. otherwise open it
chrome.browserAction.onClicked.addListener(function() {

  console.log("popup_id is " + popup_id);
  //open the popup when icon clicked if it isn't open already
  if(popup_id <= 0){
    new_window(false);
  }
  //otherwise focus the window
  else{
    chrome.windows.update(popup_id, {"focused": true});
  }
});

//add jquery and receiver to new tabs or refreshed tabs
chrome.tabs.onUpdated.addListener(function(tab_id, info,tab){
  if(info.status == "complete"){

    updateTabs(tab);

    chrome.tabs.executeScript(tab_id, {file: "jquery-2.1.0.min.js"});
    chrome.tabs.executeScript(tab_id, {file: "receiver.js"});
  }
});

chrome.windows.onFocusChanged.addListener(function(window_id){
  console.log("focus changed to window with id" + window_id);
});

//open Nat popup if first window opened and chrome is already running
chrome.windows.onCreated.addListener(function(){
  console.log("window added event");
  chrome.windows.getAll(function(some_array){
    console.log("checking if this is the only window open " + some_array.length );
    if(some_array.length == 1){
      new_window(hide_on_start);
    }
  });
});

chrome.extension.onMessage.addListener( function(request,sender,sendResponse){
  console.log("REQUEST RECEIVED");
  console.log(request);
  if(request.greeting === "option_updated"){
    window_vars = Object.keys(window);
    for(var i in window_vars){
      if(window_vars[i] == request.name){
        window[request.name] = request.value;
        break;
      }
    }
  }
  else if( request.greeting === "action" ){
    chrome.tabs.sendMessage(tab_id, {greeting: "do_action",
                                      action: request.action,
                                      modifier: request.modifier,
                                      last_action: request.last_action,
                                      last_modifier: request.last_modifier
                                    });
    console.log('action is ' + request.action);
    console.log('modifier is ' + request.modifier);
    console.log('last_action is ' + request.last_action);
    console.log('last_modifier is ' + request.last_modifier);
    var action = request.action;
    var modifier = request.modifier;
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
      case "switch":
        console.log('running switch');
        chrome.tabs.query({}, function(response){
          var check_url = true;
          var i;
          for (i = response.length - 1; i >= 0; i--) {
            console.log("title is" + response[i].title.toLowerCase());
            if(response[i].title.toLowerCase().indexOf(modifier) >= 0 ){
              chrome.tabs.update(response[i].id, {selected: true});
              check_url = false;
              break;
            }
          }
          if(check_url){
            var el = document.createElement("a");
            for (i = response.length - 1; i >= 0; i--) {
              el.href = response[i].url;
              console.log(el.href);
              var hostname = el.hostname.split(".");
              console.log(hostname);
              if(hostname.length-2 >= 0){
                hostname = hostname[hostname.length-2];
              }
              else{
                hostname = hostname[hostname.length-1];
              }
              console.log("hostname is " + hostname);
              if(hostname.indexOf(modifier) >= 0 ){
                chrome.tabs.update(response[i].id, {selected: true});
                break;
              }
            }
          }
        });
        break;
    }
  }
});

