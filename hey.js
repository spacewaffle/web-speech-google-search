$(document).ready(function() {
  try {
      window.recognition = new webkitSpeechRecognition();
  } catch(e) {
      window.recognition = Object;
  }
  window.recognition.continuous = true;
  window.recognition.lang = 'en';
  var startRecognition = function() {
    console.log('starting speech recognition...');
    window.recognition.start();
  };

  window.recognition.onresult = function (event) {
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        console.log(event.results[i]);
      }
    }
    
  };
  window.recognition.onend = function() {
      console.log('speech recognition stopped!');
  };
  
});