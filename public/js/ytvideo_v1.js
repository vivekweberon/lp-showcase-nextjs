let player;
let player2;
let vhfRemoved = false;
let pausedByCode = false;
let pausedByUser = false;
let playedByCode = false;
let playedByUser = false;
let pausedByForm = false;
let bgVideoStart = 0;

function loadYoutubeIframeAPI() {
  console.log("loadYoutubeIframeAPI");
    var tag = document.createElement('script');
    tag.id = 'iframe-yt';
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.onerror = function() {
      logResourceLoadError(this);
    };
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  } 

  function onYouTubeIframeAPIReady () {
    if (isVisible('home')) {
      console.log("isVisible('home')");
      player = new YT.Player('video1', {
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
          'onError': onPlayerError
        }
      });
    }
    if (isVisible('video')) { 
      player2 = new YT.Player('video2', {
        events: {
          'onStateChange': onPlayer2StateChange,
          'onError': onPlayerError
        }
      });
    }
    window.onscroll = playVisibleVideos;
  }

  const handlePlaySoundButtonClick = (e) => {
    console.log("Clicked")
    console.log("player",player)
        if (player.isMuted()) {
          playBGVideoFromBeginning();
        }
        else {
          let playerAction = document.getElementById("playSound").innerHTML;
          if(playerAction == 'Play Video'){
            let state = player.getPlayerState();
            if(state == 0){
              playBGVideoFromBeginning();
            }else{
              resumeBGVideo();
            }
          } else if(playerAction == 'Pause Video'){
            player.pauseVideo();
            document.getElementById("playSound").innerHTML = "Play Video";
          } 
        }  
}

function onPlayerError(event){
  let errMsg = "yt_video_load_error: " + event.data;
  if (sessionStorage.getItem(errMsg) != 'yes') {
    sessionStorage.setItem(errMsg, 'yes');
    logError("Youtube Player Error: "+ event.data);
    location.reload();
  } 
}

function onPlayer2StateChange(event) {
  let playerStatus = event.data;
  if ((playerStatus == 2)&&(!pausedByCode)) {
    setVideoStateVariables(false, true, false, false);
  }
  else if ((playerStatus == 1)&&(!playedByCode)) {
    setVideoStateVariables(true, false, false, false);
  }
}

function setVideoStateVariables(userPlay, userPause, codePlay, codePause) {
  pausedByCode = codePause;
  pausedByUser = userPause;
  playedByCode = codePlay;
  playedByUser = userPlay;
}

function checkPlayerStateToRemoveHeaderAndFooter() {
  let state;
  let interval = setInterval( function(){
    state = player.getPlayerState();
    if (state == 1) {
      removeVideoHeaderAndFooter();
      clearInterval(interval);
    }
  }, 500);
}
    
function onPlayerReady(event) {
  if((!controlVideos)||((controlVideos)&&(isEndOfForm()))){
    player.playVideo();
  }else{
    player.pauseVideo();
  }
  //checkPlayerStateToRemoveHeaderAndFooter();
}

function onPlayerStateChange(event) {
  let playerStatus = event.data;
  if (playerStatus == -1) {
    console.log("unstarted");
    //setVideoHeaderAndFooter();
    let label = document.getElementById("playSound").innerHTML;
    if(label == "Mute Sound"){
      sessionStorage.setItem("bgvv", "yes");  
    }
  } else if (playerStatus == 0) {
    console.log("ended");
    //setVideoHeaderAndFooter();
    player.seekTo(bgVideoStart);
    player.pauseVideo();
    document.getElementById("playSound").innerHTML = "Play Video";
  } else if (playerStatus == 1) {
    console.log("playing");
    //removeVideoHeaderAndFooter();
  } else if (playerStatus == 2) {
    console.log("paused");
  } else if (playerStatus == 3) {
    console.log("buffering");
  } else if (playerStatus == 5) {
    console.log("video cued");
  }
}

function removeVideoHeaderAndFooter() {
  if (!vhfRemoved) {
    vhfRemoved = true;
    let vHeader = document.getElementById('vHeader');
    let vFooter = document.getElementById('vFooter');
    let timer;
    timer = setInterval(function() {
      clearInterval(timer);
      vHeader.style.height = '0px';
      vFooter.style.height = '0px';
    }, 4000);
  } 
}

function setVideoHeaderAndFooter() {
  vhfRemoved = false;
  document.getElementById('vHeader').style.height = '70px';
  document.getElementById('vFooter').style.height = '70px';
}

function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  let contentHeight = document.documentElement.clientHeight;
  let top = rect.top;
  let bottom = rect.bottom;
  let topVisible = (top >= 50) && (top < contentHeight);
  let bottomVisible = (bottom < contentHeight) && (bottom > 55);
  return topVisible || bottomVisible;
}

function playVideo(iframePlayer) {
  let state = iframePlayer.getPlayerState();
  if(state == 2){
    iframePlayer.playVideo();
  }
}

function pauseVideo(iframePlayer) {
  let state = iframePlayer.getPlayerState();
  if (state != 2) {
    iframePlayer.pauseVideo();
  }
}

function isVisible(sectionID) {
  let ret = false;
  let element = document.getElementById(sectionID);
  console.log("element", sectionID, element);
  if(element){
    let display = element.style.display;
    if (display != 'none') {
      ret = true;
    }
  }
  console.log("isVisible", sectionID, ret);
  return ret;
}

function playVisibleVideos() {
  if (isVisible('home')) { 
    if (isInViewport(document.getElementById("video1"))) {
      let action = document.getElementById("playSound").innerHTML;
      if (action != "Play Video"){
        playVideo(player); 
      }
    }
    else {
      pauseVideo(player);
    }
  }
  if (isVisible('video')) { 
    if (isInViewport(document.getElementById("video2"))) {
      if (pausedByCode) {
        setVideoStateVariables(false, false, true, false);
        playVideo(player2);
      }
    }
    else {
      if ((playedByCode)||(playedByUser)) {
        setVideoStateVariables(false, false, false, true);
        pauseVideo(player2);
      }
    }
  }
}

function playBGVideoFromBeginning(){
  player.seekTo(bgVideoStart);  
  player.unMute();
  document.getElementById("playSound").innerHTML = "Pause Video";
  let state = player.getPlayerState();
  if(state == 2){
    player.playVideo(); 
  }
} 

function resumeBGVideo(){
  player.playVideo();
  document.getElementById("playSound").innerHTML = "Pause Video";
}

function playVideosIfPaused(){
  if ((player)&&(isInViewport(document.getElementById("video1")))) {
    playVideo(player);
  }
  if ((player2)&&(isInViewport(document.getElementById("video2")))&&(pausedByForm)) {
    playVideo(player2);
    pausedByForm = false;
  }
}

function pauseVideosIfPlaying(){
  if ((player)&&(isInViewport(document.getElementById("video1")))) {
    pauseVideo(player);
  }
  if ((player2)&&(isInViewport(document.getElementById("video2")))) {
    let state = player2.getPlayerState();
    if (state != 2) {
      player2.pauseVideo();
      pausedByForm = true;
    } 
  }
}