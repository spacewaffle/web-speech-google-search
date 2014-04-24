//this content script doesn't have access to the page's javscript since it's isolated by chrome
//instead, we'll inject a different script into the page and bind event listeners to it to
//communicate with the javascript of the chrome extension

var s = document.createElement('script');
// TODO: add "script.js" to web_accessible_resources in manifest.json
s.src = chrome.extension.getURL('yt_setup.js');
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(s);