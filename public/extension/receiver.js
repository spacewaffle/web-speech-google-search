$(document).ready(function(){



var search_url = "https://www.google.com/search?q=";
var wiki_url = "https://wikipedia.org/w/index.php?search=";

console.log('added receiver');

chrome.extension.onMessage.addListener( function(request,sender,sendResponse){
  if( request.greeting === "do_action" ){
    var action = request.action;
    var result = request.result;
    var last_action = request.last_action;
    var last_result = request.last_result;
    switch (action){
      case "search":
        window.location = search_url+result;
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
        window.location = search_url+result+"&btnI";
        break;
      case "wiki":
        window.location = wiki_url+result;
        break;
      case "reload":
        window.location = window.location;
        break;
      case "scroll":
        var doc_height = $(document).height();
        if(result == "down+fast"){
          $("html, body").animate({
            scrollTop: doc_height
          }, doc_height*3, "linear");
        }
        else if(result == "up"){
          $("html, body").animate({
            scrollTop: 0
          }, doc_height*5, "linear");
        }
        else if(result == "up+fast"){
          $("html, body").animate({
            scrollTop: 0
          }, doc_height*3, "linear");
        }
        else{
          $("html, body").animate({
            scrollTop: doc_height
          }, doc_height*5, "linear");
        }
        break;
      case "stop":
        console.log("last action is " + last_action);
        console.log("last result is " + last_result);
        if(last_action == "scroll" && last_result == "down" || last_result == "down+fast"){
          $("html, body").stop().animate({
            scrollTop: $("body").scrollTop()-200
          }, 1000);
        }
        else if(last_action == "scroll" && last_result == "up" || last_result == "up+fast"){
          $("html, body").stop().animate({
            scrollTop: $("body").scrollTop()+200
          }, 1000);
        }
        else{
          $("html, body").stop().animate({
            scrollTop: $("body").scrollTop()
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

});