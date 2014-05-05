(function(){

var action;
var modifier;
var recognition;
var last_action = "";
var last_modifier = "";
var started = false;
var listening = true;
var pro_license = false;

//send a message to background to check for pro license
chrome.storage.sync.get("pro_license", function(items){
  if(items["pro_license"] == true){
    pro_license = true;
    $('#chevron').fadeIn();
    $('#pro_controls').fadeOut();
  }
});
//style guide
//Make sure if error commands are multiple words, that the multi-word commands go at the end.
//This is to prevent extra words from being included in the modifier that should be in the action
var commands = {
  "open": ["open"],
  "go to": ["goto", "go to"],
  "search": ["search"],
  "switch": ["switch", "switch 2", "switch to"],
  "wiki": ["wiki"],
  "youtube": ["youtube"],
  //"click": ["click", "clique", "quick"],

  //Commands that take modifiers should ALWAYS COME FIRST
  //This is to prevent other actions from grabbing the modifiers
  "rewind": ["rewind"],
  "fast forward": ["fast for", "fast forward", "fast forwards"],
  "forward": ["forward"],
  "repeat": ["repeat"],
  "stop listening": ["stop listening"],
  "start listening": ["start listening"],
  "stop": ["stock", "stop", "star"],
  "new email": ["new email"],
  "new": ["utah", "newtown", "new", "new tab"],
  "reload": ["refresh", "rephresh", "reload", "realtor", "reloj"],
  "back": ["fack", "facts", "back", "bass", "beck"],
  "close": ["post", "lowes", "contact", "clothes", "quotev", "close tab",
                "close", "first ave"],
  // "previous": ["reviews", "sirius", "prius", "paris", "previous"],
  // "next": ["sex", "next"],
  "scroll up": ["scroll up", "skrillex", "scrilla", "screw up", "throw up", "roll up", "scrub top"],
  "scroll down": ["scroll down", "screw down", "throwdown"],
  "scroll top": ["scroll top", "scroll to top", "scrub tops", "scrolled hop", "scroll hop"],
  "scroll bottom": ["scroll bottom", "scroll to bottom"],
  //"scroll": ["screw", "scrabble", "throwdown", "troll", "scroll"],
  "pause": ["popeyes", "pies", "pods", "odds", "pause", "pos"],
  "play": ["play"],

};

function getVersion() {
  var details = chrome.app.getDetails();
  console.log("getting version");
  return details.version;
}

function sendResponse(action, modifier, input, last_act, last_mod){
  console.log('action is ' + action);
  console.log('modifier is ' + modifier);
  console.log('last action is ' + last_act);
  console.log('last modifier is ' + last_mod);

  if(action == "repeat"){
    chrome.extension.sendMessage({greeting: "action",
                                  action: last_act,
                                  modifier: last_mod,
                                  input: input,
                                  last_action: last_act,
                                  last_modifier: last_mod
                                });
  }
  else if(action == ""){
    chrome.extension.sendMessage({greeting: "action",
                              action: action,
                              modifier: modifier,
                              input: input,
                              last_action: last_action,
                              last_modifier: last_modifier
                            });
  }
  else{
    chrome.extension.sendMessage({greeting: "action",
                                  action: action,
                                  modifier: modifier,
                                  input: input,
                                  last_action: last_act,
                                  last_modifier: last_mod
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
  if(started){
    $('#content').show();
  }

  recognition.onstart = function(event){
    console.log('recognition started');
    if(!started){
      $('#content').fadeIn();

      //Notify the user to keep the window open only when the extension is installed or updated
      var currVersion = getVersion();
      var prevVersion = localStorage['version'];
      console.log('current version is' + currVersion);
      console.log('previous version is' + prevVersion);

      if (currVersion != prevVersion) {
        // Check if we just installed or updated this extension.
        console.log('showing the leave open message');
        $('.leave_open_msg').show();
        window.setTimeout(function(){
          $('.leave_open_msg').fadeOut();
        }, 3000);
        localStorage['version'] = currVersion;
      }
    }
    started = true;

    console.log(event);
    $('#waiting_dialogue').hide();
    $('#waiting_message').hide();
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
            sendResponse(action, modifier, input, last_action, last_modifier);
          });
        }
        else{
          sendResponse(action, modifier, input, last_action, last_modifier);
        }
      });
    }

    if(action == "stop listening" && pro_license){
      listening = false;
      $('#accepted_text').html("Paused");
      $('#accepted_dialogue').css({
                                    "background-color": "#FFF1A9",
                                    "color": "#888",
                                  });
    }
    else if(action == "start listening" && pro_license){
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
      $('#waiting_message').hide();
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

$(".options_link").on("click", function(){
  //open the options page in a new tab in a different window
  chrome.tabs.create({url: chrome.extension.getURL("options.html"),});
});


//javascript for accordion functionality
$('body').on('click.collapse-next.data-api', '[data-toggle=collapse-next]', function(e) {
    var $target = $(this).next();
    $target.collapse('toggle');
});

//whenever the user checks or unchecks show_indicator, update their settings
$('#activate_pro').on('click', function(){
  //send a message to background to check for pro license
  chrome.extension.sendMessage({greeting: "check_license"});
  $("html, body").animate({
    scrollTop: 0
  }, 100, "linear");
});

chrome.extension.onMessage.addListener( function(request,sender,sendResponse){
  if(request.greeting === "upgrade"){
    if(request.pro){
      pro_license = request.pro;
      $('#chevron').fadeIn();
      $('#pro_controls').fadeOut();
    }
  }
});

})();