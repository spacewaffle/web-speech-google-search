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
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        console.log("result is " + event.results[i]);
      }
    }
  };
  recognition.onend = function() {
      console.log('speech recognition stopped!');
  };
  
});