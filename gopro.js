(function(){

var go_pro = document.getElementById("go_pro");
go_pro.addEventListener("click", function(){
  //open the options page in a new tab in a different window
  chrome.tabs.create({url: "https://chrome.google.com/webstore/category/extensions"});
});

})();