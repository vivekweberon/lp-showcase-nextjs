console.log("showcase.js loaded");
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
  console.log("Rewriting URLs and tracking page view");
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
  console.log("Setting area code regex");
  let areaCodes = "js/areacodes.json";
  let path = window.location.pathname;
  path = decodeURIComponent(path);
  areaCodes = ((path.endsWith("/"))||(path.endsWith("index.html"))) ? areaCodes : (path + "/" + areaCodes);
  $.getJSON(areaCodes)
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