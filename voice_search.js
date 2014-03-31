var results = [];
var result;
var is_recording = false;
var should_restart = true;
var action;
var recognition;
var last_action = "",
last_result = "";

var commands = {
  "stop": ["stock", "stop"],
  "reload": ["refresh", "rephresh", "reload"],
  "go to": ["goto", "go to"],
  "back": ["fack", "facts", "back"],
  "scroll": ["screw", "scrabble", "throwdown", "troll", "scroll"],
  "pause": ["popeyes", "pies", "pods", "odds", "pause"],
  "close tab": ["post", "lowes", "contact", "clothes", "quotev", "close tab"],
  "new tab": ["utah", "newtown", "new tab"],
  "previous": ["reviews", "sirius", "prius", "paris", "previous"],
  "next": ["sex", "x", "next"]
};


console.log('loading voice search js');
function startRecognition(){
  console.log('starting recognition');
  console.log("is_recording " + is_recording + " to true");
  is_recording = true;
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.start();
  console.log("recognition is...");
  console.log(recognition);
  console.log("should_restart " + should_restart + " to true");
  should_restart = true;

  recognition.onresult = function (event) {

    function parseResult(input){
      var splicenum = 1;
      //get rid of leading space that appears sometimes
      if(input[0] === ' '){
          input = input.replace(" ", "");
      }
      input = input.toLowerCase();
      //grab the first word
      input = input.split(" ");
      action = input[0];
      //if the first word is go
      if(action === 'go' && input[1] === 'to'){
        action = "go to";
        splicenum = 2;
      }
      input.splice(0, splicenum);
      input = input.join("+");
      return input;
    }

    if(event.isFinal){
      results.push(event);
    }
    console.log('event.results is...');
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        results.push(event.results[i]);
        console.log(event.results[i][0].transcript);
        result = event.results[i][0].transcript;
        result = parseResult(result);
        console.log('action is now ' + action);
        console.log('result is now ' + result);
        switch (action){
          case "stock":
            action = "stop";
            break;
          case "refresh":
          case "rephresh":
            action = "reload";
            break;
          case "goto":
            action = "go to";
            break;
          case "fack":
          case "facts":
            action = "back";
            break;
          case "screw":
          case "scrabble":
          case "throwdown":
          case "troll":
            action = "scroll";
            break;
          case "popeyes":
          case "pies":
          case "pods":
          case "odds":
            action = "pause";
            break;
          case "post":
          case "lowes":
          case "contact":
          case "clothes":
            action = "close";
            break;
          case "utah":
          case "newtown":
            action = "new";
            break;
          case "quotev":
          case "first":
            if(action == "quotev" || result == "ave")
            action = "close";
            break;
          case "reviews":
          case "sirius":
          case "prius":
          case "paris":
            action = "previous";
            break;
          case "sex":
          case "x":
            action = "next";
            break;
        }
        if(action == "repeat"){
          chrome.extension.sendMessage({greeting: "action",
                                      action: action,
                                      result: result,
                                      last_action: last_action,
                                      last_result: last_result
                                    });
        }
        else{
          chrome.extension.sendMessage({greeting: "action",
                                      action: action,
                                      result: result,
                                      last_action: last_action,
                                      last_result: last_result
                                    });

          last_action = action;
          last_result = result;
        }
      }
    }

  };

  recognition.onend = function() {
    console.log('speech service disconnected on its own (will not restart)');
    //check if it should be restarted

    if(should_restart){
      stopRecognition();
      startRecognition();
    }
  };
}

function stopRecognition(){
  console.log('stopping recognition');
  console.log("is_recording " + is_recording + " to false");
  is_recording = false;
  recognition.abort();
  recognition = false;
  console.log("recognition is...");
  console.log(recognition);
  console.log("should_restart " + should_restart + " to false");
  should_restart = false;
}

startRecognition();

