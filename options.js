(function(){
var storage = chrome.storage.sync;

var pro_license = false;
storage.get("pro_license", function(items){
  if(items["pro_license"]){
    pro_license = true;
  }
});

storage.get('auto_start', function(items) {
  //check stored settings if we should start on launch
  if(items["auto_start"] !== undefined){
    if(items["auto_start"]){
      document.getElementById('auto_start').checked = true;
    }
  }
  else{
    //auto_start hasn't been defined
    document.getElementById('auto_start').checked = true;
    storage.set({'auto_start': el_auto_start.checked});
    //send a message to background to update the variable
    updateOptions("auto_start", el_auto_start.checked);
  }
});

storage.get('hide_on_start', function(items) {
  //check stored settings if we should hide the window on start
  if(items["auto_start"] !== undefined){
    if(items["hide_on_start"]){
      document.getElementById('hide_on_start').checked = true;
    }
  }
  else{
    //hide_on_start hasn't been defined
    storage.set({'hide_on_start': false});
    //send a message to background to update the variable
    updateOptions("hide_on_start", false);

  }
});

function updateOptions(name, value){
  chrome.extension.sendMessage({
    greeting: "option_updated",
    name: name,
    value: value
  });
}

//whenever the user checks or unchecks hide_on_start, update their settings
var el_hide_on_start= document.getElementById("hide_on_start");
el_hide_on_start.addEventListener("change", function(){
  storage.set({'hide_on_start': el_hide_on_start.checked});
  //send a message to background to update the variable
  updateOptions("hide_on_start", el_hide_on_start.checked);
});

//whenever the user checks or unchecks auto_start, update their settings
var el_auto_start = document.getElementById("auto_start");
el_auto_start.addEventListener("change", function(){
  storage.set({'auto_start': el_auto_start.checked});
  //send a message to background to update the variable
  updateOptions("auto_start", el_auto_start.checked);
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
    else{
      //commands haven't been set yet
      storage.set({ custom_commands: []});
    }
  });
}

update_commands();

var submit_command = document.getElementById("submit_command");
submit_command.addEventListener("click", function(){
  if(pro_license){
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
  }
  else{
    //user doesn't have pro and doesn't have access to custom commands
    $('.pro_locked').fadeIn().delay(2000).fadeOut();

    //resetting input fields
    document.getElementById("custom-command").value = "";
    document.getElementById("site-to-visit").value = "";
  }
});

})();