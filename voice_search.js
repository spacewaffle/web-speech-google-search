var action;
var modifier;
var recognition;
var last_action = "",
last_modifier = "";
var started = false;

var commands = {
  "open": ["open"],
  "go to": ["goto", "go to"],
  "search": ["search"],
  "forward": ["forward"],
  "wiki": ["wiki"],
  "repeat": ["repeat"],
  "stop": ["stock", "stop"],
  "new": ["utah", "newtown", "new tab", "new"],
  "reload": ["refresh", "rephresh", "reload", "realtor"],
  "back": ["fack", "facts", "back", "fac", "bass"],
  "scroll": ["screw", "scrabble", "throwdown", "troll", "scroll"],
  "close": ["post", "lowes", "contact", "clothes", "quotev", "close tab",
                "close", "first ave"],
  "previous": ["reviews", "sirius", "prius", "paris", "previous"],
  "next": ["sex", "next"],
  "scroll up": ["scroll up", "skrillex"],
  "scroll down": ["scroll down"],
  "scroll top": ["scroll top", "scroll to top"],
  "scroll bottom": ["scroll bottom", "scroll to bottom"],
  "pause": ["popeyes", "pies", "pods", "odds", "pause"],
  "play": ["play"],
  "switch": ["switch to", "switch", "switch 2"],
  "click": ["click", "clique", "quick"]
};

chrome.storage.sync.get('auto_start', function(items) {
  //check stored settings if we should start on launch
  if(items["auto_start"]){
    document.getElementById('auto_start').checked = true;
  }
});


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
    document.getElementById("dialogue").style.display = "none";
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
  };

  recognition.onend = function() {
    //check if it should be restarted
    if(started){
      startRecognition();
    }
    else{
      //let the user know that the service isn't live because they didn't accept the dialogue.
      alert("Whoops, it looks like you hit deny instead of allow! You'll need to go to Settings > search media, click content settings, click manage exceptions, find the chrome extension, and click the X next to the blocked entry.");
    }
  };
}

startRecognition();

//whenever the user checks or unchecks auto_start, update their settings
var el_auto_start = document.getElementById("auto_start");
el_auto_start.addEventListener("change", function(){
  chrome.storage.sync.set({'auto_start': el_auto_start.checked});
});