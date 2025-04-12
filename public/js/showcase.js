let controlVideos = false;
let reports;
const END_OF_FORM_HEADER = "Thank you for submitting the form. We will be in touch with you shortly."

function updateEndOfFormHeader(){
  let formHeader = document.getElementById("msg");
  if(formHeader){
    formHeader.innerHTML = END_OF_FORM_HEADER;
  }
}

function getPageID(){
  let pageID = getQueryParameter("id");
  pageID = (pageID) ? pageID : currentPageName;
  return pageID;
}

function reWriteUrlsAndTrackPageView() {
  reWriteURLS();
  trackParametersOnPageLoad();
}

function getCurrentPageName(){
  var path = window.location.pathname;
  path = decodeURIComponent(path);
  var arr = path.split("/");
  var pageName = (arr[arr.length - 1] != '') ? arr[arr.length - 1] : arr[arr.length -2];
  pageName = ((pageName == 'index.html') &&  (arr[arr.length - 2] != '')) ? arr[arr.length -2] : pageName;
  pageName = pageName.split(".")[0];
  return pageName;
}

function displayForm(lpModal, duration){
  let x = (duration == undefined) ? timeInterval : duration;
  let body = document.getElementsByTagName("body")[0];
  let timer0 = setInterval(function(){
    lpModal.style.display = "block";
    body.style.overflow = "hidden";
    if(controlVideos){
      pauseVideosIfPlaying();
    }
    clearInterval(timer0);
  }, x)
}

function enablePopupForm(x, y, z, cv){
  popupForm = true;
  if((x != undefined)&&(Number.isInteger(x))&&(y != undefined)&&(Number.isInteger(y))&&(z != undefined)&&(Number.isInteger(z))){
    timeInterval = x;
    nTimes = y;
    zDuration = z;
  }
  if(cv == true){
    controlVideos = true;
  }
}

function setAreaCodeRegEx(){
  let areaCodes = "js/areacodes.json";
  let path = (window.location.pathname.split('/').length) == 3 ? areaCodes : "../" + areaCodes;
  $.getJSON(path)
  .done(function(data){
    if(data){
      data.forEach(function(val){
        areaCodeRegex += val+'|';
      })
      areaCodeRegex = areaCodeRegex.slice(0, -1);
      areaCodeRegex = new RegExp(areaCodeRegex);
    }
  })
  .fail(function(jqxhr, textStatus, error){
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
    logError("Error loading: "+"'/js/areacodes.json'");
  })
}

function setVirtualTourHeight(virtualTourID) {
    let navHeight = $('#nav').outerHeight();
    let vtHeight = $(document.getElementById(virtualTourID)).outerHeight();
    let vtVideoHeight = $('#vtVideo').outerHeight();
    let windowHeight = $(window).height();
    let vtHeaderHeight = vtHeight - vtVideoHeight - 100;
    vtVideoHeight = windowHeight - navHeight - vtHeaderHeight;
    $('#vtVideo').height(vtVideoHeight+'px');
}

function openModal(url){
  $('#modalIframe').attr('src', url);
  $('#extLinkModal').modal();
  $('#extLinkModal').css("padding-right", "0px");
  
  $('#extLinkModal').on('hidden.bs.modal', function (e){
    $('#modalIframe').attr('src', '');
    $('#modalLabel').text('');
  })
  return false;
}

function setCarouselHeight() {
  let width  = getImageWidth();
  let height = width/1.777;
  $('#photosCarousel').height(height + 'px');
  $('#photosCarousel').width(width + 'px');
  $('.carousel-item img').width(width + 'px');
  $('.carousel-item img').height(height + 'px');
}

function getImageWidth(){
  //let windowHeight = $(window).height();
  let windowHeight = window.innerHeight;
  let windowWidth = $(window).width();
  let navHeight = $('#nav').outerHeight();
  let availHeight = windowHeight - navHeight - 20;
  let width = availHeight * 1.777;
  
  if((width + 30) > windowWidth){
    width = windowWidth - 30;
  }
  return width;
}

function addVideo(youtubeVideoID) {
  if (youtubeVideoID) {
    let videoURL = "https://www.youtube.com/embed/"+youtubeVideoID+"?rel=0&controls=1&autoplay=0&cc_load_policy=1&modestbranding=1&showinfo=0&playsinline=1&enablejsapi=1";
    let origin = '&origin=' + encodeURIComponent('https://'+ window.location.hostname);
    $('#video2').attr("src", videoURL + origin);
  } 
}

function setVideoDimensions() {
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;
  const navHeight = $('#nav').outerHeight();
  const availHeight = windowHeight - navHeight - 20;
  let width = availHeight * 1.777;
  if (width + 30 > windowWidth) {
    width = windowWidth - 30;
  }
  let height = width / 1.777;
  $('#video2').width(width + 'px');
  $('#video2').height(height + 'px');
}