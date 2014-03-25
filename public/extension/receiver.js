var search_url = "https://www.google.com/search?q=";
var wiki_url = "https://wikipedia.org/w/index.php?search=";

console.log('added receiver');

chrome.extension.onMessage.addListener( function(request,sender,sendResponse){
  if( request.greeting === "do_action" ){
    var action = request.action;
    var result = request.result;
    switch (action){
      case "search":
        window.location = search_url+result;
        break;
      case "back":
      case "fack":
        //history.back doesn't do a full reload so no js :/
        //window.location.href = document.referrer;
        history.go(-1);
        break;
      case "forward":
        history.forward();
        break;
      case "go to":
      case "goto":
        window.location = search_url+result+"&btnI";
        break;
      case "wiki":
        window.location = wiki_url+result;
        break;
      case "reload":
        window.location = window.location;
        break;
    }
  }
});