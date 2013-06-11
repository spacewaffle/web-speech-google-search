var results = [];
var result;
var url = "http://www.google.com/search?q=";
$(document).ready(function() {

  try {
      recognition = new webkitSpeechRecognition();
  } catch(e) {
      recognition = Object;
  }
  recognition.continuous = true;
  recognition.lang = 'en';
  var startRecognition = function() {
    console.log('starting speech recognition...');
    recognition.start();
  };

  recognition.onresult = function (event) {

    function fmtResult(result){
      for (var i = result.length - 1; i >= 0; i--) {
        if(result[i] == " "){
          result[i] = "+";
        }
      }
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
        if(result[0] === ' '){
          result = result.replace(" ", "");
        }
        console.log('substring is ' + result.substring(0,6));
        if (result.substring(0, 6) === "search"){
          result = result.substring(7);
          console.log("result after substring is "+ result);
          result = result.replace(/ /g, "+");
          console.log("result is now "+ result);
          var win=window.open(url+result, '_blank');
          win.focus();
        }
      }
    }

  };
  recognition.onend = function() {
      console.log('speech recognition stopped!');
  };
  var speech_int = setIntereval(recognition.start(), 60000);
});