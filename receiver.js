var search_url = "https://www.google.com/search?q=";
var wiki_url = "https://wikipedia.org/w/index.php?search=";

console.log('added receiver');

chrome.extension.onMessage.addListener( function(request,sender,sendResponse){
  if( request.greeting === "do_action" ){
    var action = request.action;
    var modifier = request.modifier;
    var last_action = request.last_action;
    var last_modifier = request.last_modifier;
    console.log(action + " " + modifier);
    var doc_height = $(document).height();
    switch (action){
      case "click":
      case "open":
        var links = document.getElementsByTagName("a");
        for (var i = 0; i < links.length; i++) {
          if(links[i].innerHTML.toLowerCase().indexOf(modifier) >= 0){
            window.location = links[i].href;
            break;
          }
        }
        break;
      case "search":
        window.location = search_url+modifier.replace(" ", "+");
        break;
      case "back":
        //history.back doesn't do a full reload so no js :/
        history.go(-1);
        break;
      case "forward":
        history.forward();
        break;
      case "go to":
        window.location = search_url+modifier.replace(" ", "+")+"&btnI";
        break;
      case "wiki":
        window.location = wiki_url+modifier.replace(" ", "+");
        break;
      case "reload":
        window.location = window.location;
        break;
      case "scroll up":
        if(modifier.indexOf("fast") >= 0){
          $("html, body").animate({
            scrollTop: 0
          }, doc_height*3, "linear");
        }
        else{
          $("html, body").animate({
            scrollTop: 0
          }, doc_height*5, "linear");
        }
        break;
      case "scroll down":
        if(modifier.indexOf("fast") >= 0){
          $("html, body").animate({
            scrollTop: doc_height
          }, doc_height*3, "linear");
        }
        else{
          $("html, body").animate({
            scrollTop: doc_height
          }, doc_height*8, "linear");
        }
        break;
      case "scroll top":
        $("html, body").animate({
          scrollTop: 0
        }, 300, "linear");
        break;
      case "scroll bottom":
        $("html, body").animate({
          scrollTop: doc_height
        }, 1000, "linear");
        break;
      case "stop":
        if(last_action == "scroll down"){
          $("html, body").stop().animate({
            scrollTop: $("body").scrollTop()-200
          }, 1000);
        }
        else if(last_action == "scroll up"){
          $("html, body").stop().animate({
            scrollTop: $("body").scrollTop()+200
          }, 1000);
        }
        break;
      case "play":
        $('video').play();
        break;
      case "pause":
        $('video').pause();
        break;
    }
  }
});