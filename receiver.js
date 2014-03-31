var search_url = "https://www.google.com/search?q=";
var wiki_url = "https://wikipedia.org/w/index.php?search=";

console.log('added receiver');

chrome.extension.onMessage.addListener( function(request,sender,sendResponse){
  if( request.greeting === "do_action" ){
    var action = request.action;
    var modifier = request.modifier;
    var last_action = request.last_action;
    var last_modifier = request.last_modifier;
    console.log(action + modifier);
    switch (action){
      case "search":
        window.location = search_url+modifier.replace(" ", "+");
        break;
      case "back":
        //history.back doesn't do a full reload so no js :/
        //window.location.href = document.referrer;
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
      case "scroll":
        var doc_height = $(document).height();
        if(modifier == "down+fast"){
          $("html, body").animate({
            scrollTop: doc_height
          }, doc_height*3, "linear");
        }
        else if(modifier == "up"){
          $("html, body").animate({
            scrollTop: 0
          }, doc_height*5, "linear");
        }
        else if(modifier == "up fast"){
          $("html, body").animate({
            scrollTop: 0
          }, doc_height*3, "linear");
        }
        else if(modifier.indexOf("top") >=0 || modifier.indexOf("to top") >=0){
          $("html, body").animate({
            scrollTop: 0
          }, 1000, "linear");
        }
        else{
          $("html, body").animate({
            scrollTop: doc_height
          }, doc_height*5, "linear");
        }
        break;
      case "stop":
        console.log("last action is " + last_action);
        console.log("last modifier is " + last_modifier);
        if(last_action == "scroll" && last_modifier == "down" || last_modifier == "down+fast"){
          $("html, body").stop().animate({
            scrollTop: $("body").scrollTop()-200
          }, 1000);
        }
        else if(last_action == "scroll" && last_modifier == "up" || last_modifier == "up+fast"){
          $("html, body").stop().animate({
            scrollTop: $("body").scrollTop()+200
          }, 1000);
        }
        else{
          $("html, body").stop().animate({
            scrollTop: $("body").scrollTop()-200
          }, 0);
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