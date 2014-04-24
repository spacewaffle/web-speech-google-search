(function(){
var search_url = "https://www.google.com/search?q=";
var wiki_url = "https://wikipedia.org/w/index.php?search=";
var show_indicator = true;

console.log('added receiver');

//store an indicator to be displayed after the page loads
function setIndicator(input, callback){
  chrome.storage.sync.set({"indicator": input}, function(){
    if(callback){
      callback.call();
    }
  });
}

function showIndicator(input, callback){
  var div = " \
    <div style='position: fixed; \
      display: none; \
      bottom: 0px; \
      right: 0px; \
      max-width: 300px; \
      max-height: 85px; \
      background: rgba(55, 197, 241, 1); \
      border-top-left-radius: 15px; \
      z-index: 10000; \
      padding: 15px; \
      color: #333; \
      font-size: 14px; \
      overflow: hidden; \
      font-weight: bold;'>" + input + "</div> \
  ";

  $(div).appendTo("body").fadeIn().delay(2000).fadeOut(500, function(){
    //this.remove();
    if(callback){
      callback.call();
    }
  });
}

chrome.storage.sync.get("show_indicator", function(items){
  show_indicator = items["show_indicator"] || false;
  console.log("show indicator is " + show_indicator);
  if(show_indicator === true){
    chrome.storage.sync.get("indicator", function(items){
      if(items["indicator"] !== undefined && items["indicator"] !== null){
        showIndicator(items["indicator"], function(){
          chrome.storage.sync.set({"indicator": null});
        });
      }
    });
  }
});

chrome.extension.onMessage.addListener( function(request,sender,sendResponse){
  if( request.greeting === "do_action" ){
    var action = request.action;
    var modifier = request.modifier;
    var last_action = request.last_action;
    var last_modifier = request.last_modifier;
    var input = request.input;
    show_indicator = request.show_indicator;
    console.log("show indicator is " + show_indicator);

    console.log(action + " " + modifier);

    if(show_indicator){
      showIndicator(input);
    }

    console.log(input);

    var doc_height = $(document).height();
    switch (action){
      case "click":
      case "open":
        var links = document.getElementsByTagName("a");
        for (var i = 0; i < links.length; i++) {
          var text = links[i].textContent || links[i].innerText || "";
          if(text.toLowerCase().indexOf(modifier) >= 0){
            setIndicator(input, function(){
              links[i].click();
            });
            break;
          }
        }
        break;
      case "search":
        setIndicator(input, function(){
          window.location = search_url+modifier.replace(" ", "+");
        });
        break;
      case "back":
        //history.back doesn't do a full reload so no js :/
        setIndicator(input, function(){
          history.go(-1);
        });
        break;
      case "forward":
        setIndicator(input, function(){
          history.forward();
        });
        break;
      case "go to":

        //swap modifiers if there is a custom command
        chrome.storage.sync.get('custom_commands', function(items){
          if(items["custom_commands"] !== undefined){
            for (var i = items["custom_commands"].length - 1; i >= 0; i--) {
              var key = Object.keys(items["custom_commands"][i])[0];
              if( modifier == key ){
                modifier = items["custom_commands"][i][key];
                break;
              }
            }
          }
          setIndicator(input, function(){
                var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
                  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
                  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
                  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
                  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
                  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
              if(!pattern.test(modifier)) {
                window.location = search_url+modifier.replace(" ", "+")+"&btnI";
              }
              else {
                window.location = modifier;
              }
          });
        });
        break;
      case "wiki":
        setIndicator(input, function(){
          window.location = wiki_url+modifier.replace(" ", "+");
        });
        break;
      case "reload":
        setIndicator(input, function(){
          window.location = window.location;
        });
        break;
      case "scroll up":
        if(modifier.indexOf("fast") >= 0){
          $("html, body").stop().animate({
            scrollTop: 0
          }, doc_height*3, "linear");
        }
        else{
          $("html, body").stop().animate({
            scrollTop: 0
          }, doc_height*5, "linear");
        }
        break;
      case "scroll down":
        if(modifier.indexOf("fast") >= 0){
          $("html, body").stop().animate({
            scrollTop: doc_height
          }, doc_height*3, "linear");
        }
        else{
          $("html, body").stop().animate({
            scrollTop: doc_height
          }, doc_height*10, "linear");
        }
        break;
      case "scroll top":
        $("html, body").stop().animate({
          scrollTop: 0
        }, 300, "linear");
        break;
      case "scroll bottom":
        $("html, body").stop().animate({
          scrollTop: doc_height
        }, 1000, "linear");
        break;
      case "stop":
       if(last_action == "scroll up"){
          $("html, body").stop().animate({
            scrollTop: $("body").scrollTop()+200
          }, 1000);
        }
        else if(last_action == "scroll down"){
          $("html, body").stop().animate({
            scrollTop: $("body").scrollTop()-200
          }, 1000);
        }
        else{
          $("html, body").stop();
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

})();