var action;
var modifier;
var recognition;
var last_action = "",
last_modifier = "";
var started = false;
var listening = true;


//style guide
//Make sure if error commands are multiple words, that the multi-word commands go at the end.
//This is to prevent extra words from being included in the modifier that should be in the action
var commands = {
  "open": ["open"],
  "go to": ["goto", "go to"],
  "search": ["search"],
  "switch": ["switch", "switch 2", "switch to"],
  "wiki": ["wiki"],
  //"click": ["click", "clique", "quick"],

  //Commands that take modifiers should ALWAYS COME FIRST
  //This is to prevent other actions from grabbing the modifiers
  "forward": ["forward"],
  "repeat": ["repeat"],
  "stop listening": ["stop listening"],
  "start listening": ["start listening"],
  "stop": ["stock", "stop", "star"],
  "new": ["utah", "newtown", "new", "new tab"],
  "reload": ["refresh", "rephresh", "reload", "realtor", "reloj"],
  "back": ["fack", "facts", "back", "fac", "bass", "beck"],
  "close": ["post", "lowes", "contact", "clothes", "quotev", "close tab",
                "close", "first ave"],
  "previous": ["reviews", "sirius", "prius", "paris", "previous"],
  "next": ["sex", "next"],
  "scroll up": ["scroll up", "skrillex", "scrilla", "screw up", "throw up"],
  "scroll down": ["scroll down", "screw down"],
  "scroll top": ["scroll top", "scroll to top", "scrub tops", "scrolled hop", "scroll hop"],
  "scroll bottom": ["scroll bottom", "scroll to bottom"],
  //"scroll": ["screw", "scrabble", "throwdown", "troll", "scroll"],
  "pause": ["popeyes", "pies", "pods", "odds", "pause"],
  "play": ["play"]
};


function sendResponse(action, modifier, last_action, last_modifier){
  console.log('action is ' + action);
  console.log('modifier is ' + modifier);

  if(action == "repeat"){
    chrome.extension.sendMessage({greeting: "action",
                                  action: last_action,
                                  modifier: last_modifier,
                                  last_action: last_action,
                                  last_modifier: last_modifier
                                });
  }
  else{
    chrome.extension.sendMessage({greeting: "action",
                                  action: action,
                                  modifier: modifier,
                                  last_action: last_action,
                                  last_modifier: last_modifier
                                });
    last_action = action;
    last_modifier = modifier;
  }
}

    //shine the listening dialogue
 window.setInterval(function(){
  $('.effect').addClass('active');
  window.setTimeout(function(){
    $('.effect').removeClass('active');
  }, 1700);
 }, 7000);

console.log('loading voice search js');
function startRecognition(){
  console.log('starting recognition');
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.start();
  console.log("recognition is...");
  console.log(recognition);

  recognition.onstart = function(event){
    started = true;
    console.log(event);
    $('#waiting_dialogue').hide();
    $('#denied_dialogue').hide();
    $('#accepted_dialogue').slideDown();
  };

  recognition.onresult = function (event) {

    action = "";
    modifier = "";

    console.log("event is");
    var input = event.results[event.results.length-1][0].transcript;

    //get rid of leading space that appears sometimes
    if(input[0] === ' '){
        input = input.replace(" ", "");
    }

    //turn all words to lowercase
    input = input.toLowerCase();

    console.log('input is ' + input);

    //add voice input to popup
    document.getElementById("input").innerHTML = input;
    document.getElementById("previous").innerHTML = last_action + " " + last_modifier;

    //check for matches
    console.log("checking for matches");

    //this causes the break to break out of both loops instead of just one
    out:
    for (var key in commands) {
      for (var i = commands[key].length - 1; i >= 0; i--) {
        var index = input.indexOf(commands[key][i]);
        if(index >= 0){
          console.log(commands[key][i]);
          console.log('key is ' + key);
          action = key;
          input = input.substring(index);
          modifier = input.replace(commands[key][i], "");
          //get rid of leading space that appears sometimes
          if(modifier[0] === ' '){
            modifier = modifier.replace(" ", "");
          }
          break out;
        }
      }
    }

    if(listening){
      chrome.windows.getCurrent({populate: false}, function(window){
        console.log("window is ");
        console.log(window);
        if(window.focused === true){
          //focus a different window if Nat is currently focused
          chrome.windows.update(window.id, {focused: false}, function(){
            sendResponse(action, modifier, last_action, last_modifier);
          });
        }
        else{
          sendResponse(action, modifier, last_action, last_modifier);
        }
      });
    }

    if(action == "stop listening"){
      listening = false;
      $('#accepted_text').html("Paused");
      $('#accepted_dialogue').css({
                                    "background-color": "#FFF1A9",
                                    "color": "#888",
                                  });
    }
    else if(action == "start listening"){
      listening = true;
      $('#accepted_text').html("Listening");
      $('#accepted_dialogue').css({
                                    "background-color": "#37C5F1",
                                    "color": "#fff",
                                  });
    }

  };

  recognition.onend = function() {
    //check if it should be restarted
    if(started){
      startRecognition();
    }
    else{
      //let the user know that the service isn't live because they didn't accept the dialogue.
      $('#waiting_dialogue').hide();
      $('#denied_dialogue').slideDown();
      $('#accepted_dialogue').hide();
    }
  };
}

startRecognition();

//close Nat popup if all other chrome windows are closed
chrome.windows.onRemoved.addListener(function(){
  console.log("window removed");
  chrome.windows.getAll({populate: true},function(some_array){
  console.log("getting all windows");
    console.log(some_array);
    if(some_array.length == 1 && some_array[0].tabs.length == 1 && some_array[0].tabs[0].title == "Nat"){
      chrome.windows.remove(some_array[0].id);
    }
  });
});

