var results = [];
var result;
var action;
var search_url = "http://www.google.com/search?q=";
var wiki_url = "http://wikipedia.org/w/index.php?search=";

console.log('loading recognition js');
try {
    recognition = new webkitSpeechRecognition();
} catch(e) {
    recognition = Object;
}
recognition.continuous = true;

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

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

    //if request is start, spin up recognition and set onend to loop
    if (request.greeting == "start"){
      recognition.onend = function() {
        console.log('speech service disconnected (will restart)');
        recognition.start();
      };
      console.log('starting speech navigation');
      recognition.start();
      sendResponse({farewell: "executed start"});
    }
    //if request is abort, unloop onend and abort the connection
    else if(request.greeting == "abort"){
      recognition.onend = function() {
        console.log('speech service disconnected');
      };
      recognition.abort();
    }
});