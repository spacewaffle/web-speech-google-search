
console.log('running yt setup');

document.addEventListener('playEvent', function (e)
{
  console.log("running play event");
  movie_player.playVideo();
});

document.addEventListener('pauseEvent', function (e)
{
  console.log("running pause event");
  movie_player.pauseVideo();
});


document.addEventListener('scrollEvent', function (e)
{
  console.log("running scroll event");
  var current_time = movie_player.getCurrentTime();
  console.log("received event is");
  console.log(e);
  var seconds = parseInt(e.detail.seconds);
  console.log("seconds are");
  console.log(seconds);

  if(isNaN(seconds)){
    seconds = 30;
  }
  if(e.detail.forward === true){
    console.log('fast forwarding');
    movie_player.seekTo(current_time + seconds, true);
  }
  else{
    console.log('rewinding');
    movie_player.seekTo(current_time - seconds, true);
  }
});