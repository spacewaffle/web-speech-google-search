var results = [];
var result;
var is_recording = false;
var should_restart = true;
var action;
var recognition;
var search_url = "http://www.google.com/search?q=";
var wiki_url = "http://wikipedia.org/w/index.php?search=";

console.log('loading voice search js');
// try {
//     recognition = new webkitSpeechRecognition();
// } catch(e) {
//   console.log("recognition wasn't set properly");
//   recognition = Object;
// }

// console.log("recognition is...");
// console.log(recognition);
function startRecognition(){
  console.log('starting recognition');
  console.log("is_recording " + is_recording + " to true");
  is_recording = true;
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.start();
  console.log("recognition is...");
  console.log(recognition);

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
          case "goto":
            window.location = search_url+result+"&btnI";
            break;
          case "wiki":
            window.location = wiki_url+result;
            break;
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
  recognition.stop();
  recognition = false;
  console.log("recognition is...");
  console.log(recognition);
}

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log('RECEIVED ' + request.greeting);

    //if request is start, spin up recognition and set onend to loop
    if (request.greeting == "start"){
      // recognition.onend = function() {
      //   console.log('speech service disconnected (will restart)');
      //   startRecognition();
      // };
      if(is_recording === false){
        startRecognition();
      }
      console.log("should_restart " + should_restart + " to true");
      should_restart = true;
    }
    //if request is stop, unloop onend and stop the connection
    else if(request.greeting == "stop"){
      // recognition.onend = function() {
      //   console.log('speech service disconnected (stop)');
      // };
      //recognition.stop();
      if(is_recording === true){
        stopRecognition();
      }
      console.log("should_restart " + should_restart + " to false");
      should_restart = false;
    }
});
// console.log('kickoff voice recognition');
// startRecognition();