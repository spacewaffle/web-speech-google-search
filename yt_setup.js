
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