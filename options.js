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
function update_commands(){

  storage.get('custom_commands', function(items) {
    console.log(items);
    console.log('printing out existing commands');

    if(items["custom_commands"]){
      $('#custom-command-list').empty();
      var div = document.getElementById("custom-command-list");
      for (var i = 0; i < items["custom_commands"].length; i++) {
        console.log(items["custom_commands"][i]);

        var command_key = Object.keys(items['custom_commands'][i])[0];
        var command_val = items['custom_commands'][i][command_key];
        var command = " \
          <li> \
            <button class='btn btn-default remove' data-command='" + command_key + "'>x</button> \
            <strong>" + command_key + ": </strong> \
            " + command_val + " \
          </li> \
        ";
        div.innerHTML = div.innerHTML + command;
      }

      //setup click handlers for removing commands
      $('.btn.remove').click(function(){
        for (var i = items["custom_commands"].length - 1; i >= 0; i--) {
          if(Object.keys(items["custom_commands"][i])[0] == this.dataset["command"]){
            items["custom_commands"].splice(i, 1);
            storage.set({ custom_commands: items["custom_commands"]}, function(){
              update_commands();
            });
            break;
          }
        };
      });
    }
  });
}

update_commands();

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
    storage.set({'custom_commands': commands }, function(){
      update_commands();
    });
    console.log('finished setting commands');

    //resetting input fields
    document.getElementById("custom-command").value = "";
    document.getElementById("site-to-visit").value = "";

  });
});

