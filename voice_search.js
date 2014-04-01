var action;
var modifier;
var recognition;
var last_action = "",
last_modifier = "";

var commands = {
  "stop": ["stock", "stop"],
  "reload": ["refresh", "rephresh", "reload", "realtor"],
  "go to": ["goto", "go to"],
  "back": ["fack", "facts", "back"],
  "scroll": ["screw", "scrabble", "throwdown", "troll", "scroll"],
  "close": ["post", "lowes", "contact", "clothes", "quotev", "close tab",
                "close", "first ave"],
  "new": ["utah", "newtown", "new tab", "new"],
  "previous": ["reviews", "sirius", "prius", "paris", "previous"],
  "next": ["sex", "next"],
  "search": ["search"],
  "forward": ["forward"],
  "wiki": ["wiki"],
  "scroll up": ["scroll up"],
  "scroll down": ["scroll down"],
  "scroll top": ["scroll top", "scroll to top"],
  "scroll bottom": ["scroll bottom", "scroll to bottom"],
  "pause": ["popeyes", "pies", "pods", "odds", "pause"],
  "play": ["play"],
  "switch": ["switch to", "switch", "switch 2"],
  "repeat": ["repeat"]
};


console.log('loading voice search js');
function startRecognition(){
  console.log('starting recognition');
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.start();
  console.log("recognition is...");
  console.log(recognition);

  recognition.onresult = function (event) {

    console.log("event is");
    console.log(event);
    var input = event.results[event.results.length-1][0].transcript;

    //get rid of leading space that appears sometimes
    if(input[0] === ' '){
        input = input.replace(" ", "");
    }

    //turn all words to lowercase
    input = input.toLowerCase();

    console.log('input is ' + input);
    //check for matches
    console.log("checking for matches");
    for (var key in commands) {
      for (var i = commands[key].length - 1; i >= 0; i--) {
        var index = input.indexOf(commands[key][i]);
        if(index >= 0){
          console.log(input);
          console.log(commands[key][i]);
          console.log('key is' + key);
          action = key;
          input = input.substring(index);
          modifier = input.replace(commands[key][i], "");
          //get rid of leading space that appears sometimes
          if(modifier[0] === ' '){
            modifier = modifier.replace(" ", "");
          }
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
    console.log('restaring speech service');
    //check if it should be restarted
    startRecognition();
  };
}

startRecognition();

