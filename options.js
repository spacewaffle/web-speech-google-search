var storage = chrome.storage.sync;

storage.get('auto_start', function(items) {
  //check stored settings if we should start on launch
  if(items["auto_start"]){
    document.getElementById('auto_start').checked = true;
  }
});

//whenever the user checks or unchecks auto_start, update their settings
var el_auto_start = document.getElementById("auto_start");
el_auto_start.addEventListener("change", function(){
  storage.set({'auto_start': el_auto_start.checked});
});

//print out the existing custom commands we have
storage.get('custom_commands', function(items) {
  console.log(items);
  console.log('printing out existing commands');

  if(items["custom_commands"]){
    for (var i = 0; i < items["custom_commands"].length; i++) {
      console.log(items["custom_commands"][i]);

      var command = " \
        <button class='btn btn-default'>x</button>

      ";
      var div = document.getElementById("custom-command-list");
      div.inner_HTML = div.innerHTML +
    }
  }
});

var submit_command = document.getElementById("submit_command");
submit_command.addEventListener("click", function(){
  var alias = document.getElementById("custom-command").value;
  var site_to_visit = document.getElementById("site-to-visit").value;

  console.log("submitted new command");
  storage.get('custom_commands', function(items){
    var commands = [];

    console.log("received all commands");
    console.log(items);
    console.log(items["custom_commands"]);
    //return the custom command array or an empty one
    if(items["custom_commands"]){
      commands = items["custom_commands"];
    }
    console.log('commands var is');
    console.log(commands);
    //appending the new command to the array

    var new_command = {};
    new_command[alias] = site_to_visit;
    commands.push(new_command);

    console.log("updated commands are ");
    console.log(commands);

    //storing the new command
    storage.set({'custom_commands': commands });
    console.log('finished setting commands');

    //resetting input fields
    document.getElementById("custom-command").value = "";
    document.getElementById("site-to-visit").value = "";



  });
});