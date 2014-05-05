(function(){


//setup event listeners for tab switching
console.log('running background.js');
var is_sending, tab_id, popup_id = 0, popup_tab_id = 0, pro_license = false;

//function for opening a new window
function new_window(hide){
  chrome.windows.getCurrent(function(window) {
    chrome.windows.create({
        url: chrome.extension.getURL("popup.html"),
        width: 475,
        height: 750,
        left: window.left + window.width - 475,
        top: window.top + 100,
        focused: true,
        type: "popup"
    }, function(new_window){
      console.log("created new popup");
      console.log(new_window);
      popup_id = new_window.id;
      popup_tab_id = new_window.tabs[0].id;
      console.log("hide is " + hide);
      chrome.tabs.sendMessage(popup_tab_id, {greeting: "upgrade",
                                             pro: pro_license});
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
    hide_on_start = hide_on_start || false;
    if(auto_start === true){
      console.log("relaunching as hidden");
      new_window(hide_on_start);
    }
  });
});

//check stored settings if we should show indicator
chrome.storage.sync.get('show_indicator', function(items) {
  console.log("show_indicator is " + items["show_indicator"]);
  if(items["show_indicator"] !== undefined){
    show_indicator = items["show_indicator"];
  }
  else{
    show_indicator = true;
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
    if(tab){
      updateTabs(tab);
    }
  });
});

//update which tab is the active tab
var updateTabs = function(tab){
  var tab_url = tab.url.substring(0,15);
  if( tab_url != "chrome-devtools" && tab.id != popup_tab_id){
    //set the tab_id of the current tab
    tab_id = tab.id;
    console.log("tab_id is " + tab_id);
  }
  // if a dev tools window or Nat popup is selected
  // switch the tab id to a different window
  else{
    console.log('finding an alternate tab');
    chrome.windows.getAll({populate: true}, function(window_array){
      out:
      for (var i = 0; i < window_array.length; i++) {
        for (var j = 0; j < window_array[i].tabs.length; j++) {
          console.log("tab is " + window_array[i].tabs[j].id + " " + window_array[i].tabs[j].title);

          if(window_array[i].tabs[j].active == true &&
             //check if this is the active tab in the window
             window_array[i].tabs[j].id != popup_tab_id &&
             //check if this tab is the Nat popup
             window_array[i].tabs[j].url.substring(0,15) != "chrome-devtools" ){
             //check if this tab is a developer tools window
            tab_id = window_array[i].tabs[j].id;
            console.log('switched tab id is ' + tab_id);
            break out;
          }
        }
      }
    });
  }
};


//event listeners

//reset the popup id if it was closed
chrome.windows.onRemoved.addListener(function(id){
  console.log("window closed event");
  if(popup_id == id){
    popup_id = 0;
    popup_tab_id = 0;
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

//check when the window focus changes and update the current tab
chrome.windows.onFocusChanged.addListener(function(window_id){
  //console.log("focus changed to window with id " + window_id);
  chrome.windows.get(window_id, {populate: true}, function (window){
    if(window){
      for (var i = 0; i < window.tabs.length; i++) {
        if(window.tabs[i]["active"] === true){
          updateTabs(window.tabs[i]);
          //console.log("focused tab id is " + window.tabs[i]["id"]);
        }
      }
    }
  });
});

//open Nat popup if first window opened and chrome is already running
chrome.windows.onCreated.addListener(function(){
  //console.log("window added event");
  chrome.windows.getAll(function(some_array){
    //console.log("checking if this is the only window open " + some_array.length );
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
    console.log("window vars are ");
    console.log(window_vars);
    for(var i in window_vars){
      if(window_vars[i] == request.name){
        window[request.name] = request.value;
        break;
      }
    }
  }
  else if(request.greeting === "check_license"){
    getLicense();
  }
  else if( request.greeting === "action" ){

    console.log('input is ' + request.input);
    console.log('action is ' + request.action);
    console.log('modifier is ' + request.modifier);
    console.log('last_action is ' + request.last_action);
    console.log('last_modifier is ' + request.last_modifier);

    var action = request.action;
    var modifier = request.modifier;
    switch(action){
      default:
        chrome.tabs.sendMessage(tab_id, {greeting: "do_action",
                                    action: request.action,
                                    modifier: request.modifier,
                                    input: request.input,
                                    show_indicator: show_indicator,
                                    last_action: request.last_action,
                                    last_modifier: request.last_modifier
                                  });
        break;
      case "new":
        chrome.storage.sync.set({"indicator": request.input}, function(){
          chrome.tabs.create({url: "https://google.com"});
        });
        break;
      case "new email":
        chrome.storage.sync.set({"indicator": request.input}, function(){
          chrome.tabs.create({url: "mailto:?body=%0A%0ASent%20from%20Nat%20Voice%20Commands%20%0Ahttps://chrome.google.com/webstore/detail/nat-voice-commands/mnkjdemkpmiamhjdbbiihomainhabeob"});
        });
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
              chrome.windows.update(response[i]["windowId"], {focused: true});
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
                chrome.windows.update(response[i]["windowId"], {focused: true});
                break;
              }
            }
          }
        });
        break;
      // Only execute pro features if the user has a pro license
      case "wiki":
      case "youtube":
        if(pro_license){
          chrome.tabs.sendMessage(tab_id, {greeting: "do_action",
                            action: request.action,
                            modifier: request.modifier,
                            input: request.input,
                            show_indicator: show_indicator,
                            last_action: request.last_action,
                            last_modifier: request.last_modifier
                          });
        }
        break;
    }
  }
});


/****************************************************************************************
*                                                                                       *
*  This is Google's implementation of one-time-payments in apps and extensions          *
*                                                                                       *
*  Kudos to the great example here:                                                     *
*  https://github.com/GoogleChrome/chrome-app-samples/tree/master/one-time-payment      *
*                                                                                       *
*                                                                                       *
*****************************************************************************************/

var CWS_LICENSE_API_URL = 'https://www.googleapis.com/chromewebstore/v1.1/userlicenses/';

function init() {
  console.log('running init');
  chrome.storage.sync.get("license_last_checked", function(items){

    //if the license check is more than two days old, check it again
    var d = new Date();
    d.setDate(d.getDate()-2);
    console.log('checking for license');
    if(items["license_last_checked"] === undefined || new Date(items["license_last_checked"]) < d){
      console.log('asking google for the license');
      getLicense();
    }
    else{
      console.log('just use the local license we got');
      chrome.storage.sync.get("pro_license", function(items){
        if(items["pro_license"]){
          pro_license = true;
        }
      });
    }
  });
}

/*****************************************************************************
* Call to license server to request the license
*****************************************************************************/

function getLicense() {
  xhrWithAuth('GET', CWS_LICENSE_API_URL + chrome.runtime.id, true, onLicenseFetched);
}

function onLicenseFetched(error, status, response) {
  console.log(error, status, response);
  response = JSON.parse(response);
  if (status === 200) {
    parseLicense(response);
  } else {
    console.log("error reading server");
  }
}

/*****************************************************************************
* Parse the license and determine if the user should get a free trial
*  - if license.accessLevel == "FULL", they've paid for the app
*  - if license.accessLevel == "FREE_TRIAL" they haven't paid
*    - If they've used the app for less than TRIAL_PERIOD_DAYS days, free trial
*    - Otherwise, the free trial has expired
*****************************************************************************/

function parseLicense(license) {
  var d = new Date();
  chrome.storage.sync.set({"license_last_checked": d.toJSON()});
  if (license.result && license.accessLevel == "FULL") {
    console.log("Fully paid & properly licensed.");
    chrome.storage.sync.set({"pro_license": true});

    //send the pro message to the popup
    chrome.tabs.sendMessage(popup_tab_id, {greeting: "upgrade",
                                           pro: true});
    pro_license = true;
  }
  else {
    console.log("Free trial, still within trial period");
    chrome.tabs.sendMessage(popup_tab_id, {greeting: "upgrade",
                                           pro: false});
    chrome.storage.sync.set({"pro_license": false});
    pro_license = false;
  }
}

/*****************************************************************************
* Helper method for making authenticated requests
*****************************************************************************/

// Helper Util for making authenticated XHRs
function xhrWithAuth(method, url, interactive, callback) {
  var retry = true;
  getToken();

  function getToken(){
    console.log("Calling chrome.identity.getAuthToken", interactive);
    chrome.identity.getAuthToken({ interactive: interactive }, function(token) {
      if (chrome.runtime.lastError) {
        callback(chrome.runtime.lastError);
        return;
      }
      console.log("chrome.identity.getAuthToken returned a token", token);
      access_token = token;
      requestStart();
    });
  }

  function requestStart() {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.onload = requestComplete;
    xhr.send();
  }

  function requestComplete() {
    if (this.status == 401 && retry) {
      retry = false;
      chrome.identity.removeCachedAuthToken({ token: access_token },
                                            getToken);
    } else {
      callback(null, this.status, this.response);
    }
  }
}


init();

})();