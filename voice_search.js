var action;
var modifier;
var recognition;
var last_action = "",
last_modifier = "";

var commands = {
  "stop": ["stock", "stop"],
  "reload": ["refresh", "rephresh", "reload"],
  "go to": ["goto", "go to"],
  "back": ["fack", "facts", "back"],
  "scroll": ["screw", "scrabble", "throwdown", "troll", "scroll"],
  "close": ["post", "lowes", "contact", "clothes", "quotev", "close tab",
                "close", "first ave"],
  "new": ["utah", "newtown", "new tab", "new"],
  "previous": ["reviews", "sirius", "prius", "paris", "previous"],
  "next": ["sex", "x", "next"],
  "search": ["search"],
  "forward": ["forward"],
  "wiki": ["wiki"],
  "scroll up": ["scroll up"],
  "scroll down": ["scroll down"],
  "pause": ["popeyes", "pies", "pods", "odds", "pause"],
  "play": ["play"],
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

  recognition.onmodifier = function (event) {

    var input = event.modifier.transcript;
    console.log('event.modifiers is...');
    console.log(input);

    //get rid of leading space that appears sometimes
    if(input[0] === ' '){
        input = input.replace(" ", "");
    }

    //turn all words to lowercase
    input = input.toLowerCase();

    //check for matches
    for (var key in commands) {
      for (var i = commands[key].length - 1; i >= 0; i--) {
        var index = input.indexOf(commands[key][i]);
        if(index >= 0){
          action = key;
          input = input.substring(index);
          modifier = input.replace(commands[key][i], "");
        }
      }
    }

    if(action == "repeat"){
      chrome.extension.sendMessage({greeting: "action",
                                    action: action,
                                    modifier: modifier,
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

