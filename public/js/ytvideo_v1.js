let player;
let player2;
let vhfRemoved = false;
let pausedByCode = false;
let pausedByUser = false;
let playedByCode = false;
let playedByUser = false;

function onYouTubeIframeAPIReady() {
  if (isVisible("home")) {
    player = new YT.Player("ytVideo", {
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  }
  if (isVisible("video")) {
    player2 = new YT.Player("homeVideo", {
      events: {
        onStateChange: onPlayer2StateChange,
      },
    });
  }
  window.onscroll = playVisibleVideos;
}

function onPlayer2StateChange(event) {
  let playerStatus = event.data;
  if (playerStatus == 2 && !pausedByCode) {
    setVideoStateVariables(false, true, false, false);
  } else if (playerStatus == 1 && !playedByCode) {
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
  let interval = setInterval(function () {
    state = player.getPlayerState();
    if (state == 1) {
      removeVideoHeaderAndFooter();
      clearInterval(interval);
    }
  }, 500);
}

function onPlayerReady(event) {
  player.playVideo();
  checkPlayerStateToRemoveHeaderAndFooter();
}

function onPlayerStateChange(event) {
  let playerStatus = event.data;
  if (playerStatus == -1) {
    console.log("unstarted");
    let label = document.getElementById("playSound").innerHTML;
    if (label == "Mute Sound") {
      sessionStorage.setItem("bgvv", "yes");
    }
  } else if (playerStatus == 0) {
    console.log("ended");
    setVideoHeaderAndFooter();
  } else if (playerStatus == 1) {
    console.log("playing");
    removeVideoHeaderAndFooter();
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
    let vHeader = document.getElementById("vHeader");
    let vFooter = document.getElementById("vFooter");
    let timer;
    timer = setInterval(function () {
      clearInterval(timer);
      vHeader.style.height = "0px";
      vFooter.style.height = "0px";
    }, 4000);
  }
}

function setVideoHeaderAndFooter() {
  vhfRemoved = false;
  document.getElementById("vHeader").style.height = "70px";
  document.getElementById("vFooter").style.height = "70px";
}

function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  let contentHeight = document.documentElement.clientHeight;
  let top = rect.top;
  let bottom = rect.bottom;
  let topVisible = top >= 50 && top < contentHeight;
  let bottomVisible = bottom < contentHeight && bottom > 55;
  return topVisible || bottomVisible;
}

function playVideo(iframePlayer) {
  let state = iframePlayer.getPlayerState();
  if (state == 2) {
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
  let elem = document.getElementById(sectionID);
  if (elem) {
    if (elem.style.display != "none") {
      ret = true;
    }
  }
  return ret;
}

function playVisibleVideos() {
  if (isVisible("home")) {
    if (isInViewport(document.getElementById("ytVideo"))) {
      playVideo(player);
    } else {
      pauseVideo(player);
    }
  }
  if (isVisible("video")) {
    if (isInViewport(document.getElementById("homeVideo"))) {
      if (pausedByCode) {
        setVideoStateVariables(false, false, true, false);
        playVideo(player2);
      }
    } else {
      if (playedByCode || playedByUser) {
        setVideoStateVariables(false, false, false, true);
        pauseVideo(player2);
      }
    }
  }
}
