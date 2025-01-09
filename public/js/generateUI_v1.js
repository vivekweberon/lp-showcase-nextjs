const LISTINGS_ROOT_DIR = getRootDir();
const DATA_DIR = 'data';
const YAML_FILENAME = 'data.yaml';
const LP_HOME_DIR = 'home';
let origin = '&origin=' + encodeURIComponent('https://'+ window.location.hostname);
let ytAPIRequired = false;
let page;
let pageType = 'property';
let virtualTourID;
let photosID;

function renderUI(id) {
  let uiConfig;
  if ((id == undefined)||(id == '')) {
    id = LP_HOME_DIR;
    pageType = 'home';
  }
  $.get(LISTINGS_ROOT_DIR+'/'+DATA_DIR+'/'+id+'/'+YAML_FILENAME, function(data) {
    uiConfig = jsyaml.load(data);
    generateUI(uiConfig); 
  }).fail(function() {
    logError('Error loading: '+LISTINGS_ROOT_DIR+'/'+DATA_DIR+'/'+id+'/'+YAML_FILENAME);
    $.get(LISTINGS_ROOT_DIR+'/'+DATA_DIR+'/'+LP_HOME_DIR+'/'+YAML_FILENAME, function(data) {
      uiConfig = jsyaml.load(data);
      pageType = 'home';
      generateUI(uiConfig); 
    });
  });
}

function getRootDir() {
  let path = location.pathname;
  path = decodeURIComponent(path);
  path = path.endsWith("/index.html") ? path.replace("/index.html","") : path;
  path = path.endsWith("/") ? path.substring(0, path.length-1) : path;
  return path;
}

function getAnchor(menu) {
  let ret  = '';
  let arr = menu.toLowerCase().split(' ');
  arr.forEach(function(value, index){
    if(index == 0){
      ret += value;
    }
    else {
      ret += value.charAt(0).toUpperCase() + value.slice(1);
    }
  });
  return ret;
}

function addMenu(menu, expectedMenu, id, url) {
  if((menu != undefined)&&(menu != '')) {
    let nlHref;
    if (url != undefined) {
      nlHref = url;
    }
    else {
      let anchorName =  getAnchor(menu);
      nlHref = '#' + anchorName;
      if (menu != expectedMenu) {
        let element = document.getElementById(id);
        $(element).attr('id', anchorName);
      }
    }
    let nlText = menu;
    let hLink = $('<a class="nav-item nav-link" href="'+nlHref+'">'+nlText+'</a>');
    let fLink = $('<div class="col-6 col-sm-4 col-md-3" style="text-align: center; text-decoration: underline"><a class="nav-item nav-link" href="'+nlHref+'" style="color: #212529">'+nlText+'</a></div>');
    $("#headerMenu").append(hLink);
    $("#footerMenu").append(fLink);
    $("#nav").show();
    $("#footer").show();
  }
}

function setPageTitle(uiConfig) { 
  let pageConfig = uiConfig.page;
  if ((pageConfig)&&(pageConfig.title)&&(pageConfig.title != '')) {
    $('title').text(pageConfig.title);
  }
}

function addPushNotification(uiConfig) {
  let pn = uiConfig.pushNotification;
  if ((pn != undefined)&&(pn.url != undefined)&&(pn.url != '')) {
    $('#butterBarContainer').show();
    $('#nav').css('top', '25px');
    setFirstElementCSSTop('125px');
    let tag = document.createElement('script');
    tag.src = LISTINGS_ROOT_DIR+'/'+pn.url;
    $('body').append(tag);
  }
}

function addHome(uiConfig){
  let home = uiConfig.home;
  if ((home != undefined) && (home.youtubeVideoID != undefined) && (home.youtubeVideoID != '')) {
    let videoURL = "https://www.youtube.com/embed/"+home.youtubeVideoID+"?controls=0&showinfo=0&disablekb=1&modestbranding=1&rel=0&autoplay=1&mute=1&playsinline=1&enablejsapi=1";
    if(home.videoStart){
      videoURL += "&start="+home.videoStart;
      bgVideoStart = home.videoStart;
    }
    if(home.videoEnd){
      videoURL += "&end="+home.videoEnd;
    }
    $('#video1').attr("src", videoURL + origin);
    $('#home').show();
    addMenu(home.menu, 'Home', '#home');
    ytAPIRequired = true;
    $("#playSound").on('click', function(e){
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
    });
  }
}

function addVirtualTour(uiConfig) {
  let virtualTour = uiConfig.virtualTour;
  if (virtualTour) {
    if ((virtualTour.title != undefined)&&(virtualTour.title != '')) {
      $('#vtTitle').text(virtualTour.title);
    }
    if ((virtualTour.matterportID != undefined)&&(virtualTour.matterportID != '')) {
      let virtualTourURL = "https://my.matterport.com/show/?m=" + virtualTour.matterportID;
      $('#vtVideo').attr("data", virtualTourURL);
    }
    setSectionTitle(virtualTour.sectionTitle, 'virtualTourST');
    $('#virtualTour').show();
    addMenu(virtualTour.menu, 'Virtual Tour', 'virtualTour');
    if((virtualTour.menu != undefined)&&(virtualTour.menu != "")){
      let id =  getAnchor(virtualTour.menu);
      virtualTourID = '#' + id;
    }
    setVirtualTourHeight();
  } 
}

function addPriceAndFeatures(uiConfig) {
  let priceAndFeatures = uiConfig.priceAndFeatures;
  if (priceAndFeatures) {
    $('#pfTitle1').text(priceAndFeatures.title1);
    $('#pfTitle2').text(priceAndFeatures.title2);
    showOrHideFeature(priceAndFeatures.beds, '#pfBeds');
    showOrHideFeature(priceAndFeatures.baths, '#pfBaths');
    showOrHideFeature(priceAndFeatures.homeType, '#pfHomeType');
    showOrHideFeature(priceAndFeatures.sqft, '#pfSqft');
    showOrHideFeature(priceAndFeatures.yearBuilt, '#pfYearBuilt');
    showOrHideFeature(priceAndFeatures.price, '#pfPrice');
    document.getElementById('price&Features').style.display = 'block';
    addMenu(priceAndFeatures.menu, 'Price & Features', 'price&Features');
    //$('#price&Features').show(); 
  } 
}

function addDescription(uiConfig) {
  let description = uiConfig.description;
  if ((description) && (description.content)) {
    let converter = new showdown.Converter();
    converter.setOption('noHeaderId', true);
    let html = converter.makeHtml(description.content);
    $('#dContent').html(html);
    setSectionTitle(description.sectionTitle, 'descriptionST');
    $('#description').show();
    addMenu(description.menu, 'Description', 'description');
  }
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

function addPhotos(uiConfig) {
  let photos = uiConfig.photos;
  if ((photos) && (photos.urls)) {
    let url;
    let photo;
    let cclass;
    let indicator;
    let iclass;
    let src;
    
    for (let i=0; i < photos.urls.length; ++i) {
      url = photos.urls[i];
      cclass = "carousel-item";
      iclass = "";
      if(i==0){
        cclass += " active";
        iclass = "active";
      }
      src = LISTINGS_ROOT_DIR+'/'+url+'?width=';
      photo = '<div class="'+cclass+'">'+
      '<img'+
      ' srcset="'+src+'360 360w, '+src+'576 576w, '+
      src+'768 768w, '+src+'992 992w, '+
      src+'1200 1200w, '+src+'1400 1400w, '+
      src+'1600 1600w, '+src+'1920 1920w"'+
      ' src="'+src+'1920" class="d-block" style="margin:auto; object-fit:contain" sizes="100vw" onerror="logResourceLoadError(this)">'+
      '</div>'; 
      
      $("#photosCarouselInner").append(photo);
      indicator = '<li data-target="#photosCarousel" data-slide-to="'+i+'" class="'+iclass+'"></li>';
      $("#photosCarouselIndicators").append(indicator); 
    }
    
    setSectionTitle(photos.sectionTitle, 'photosST');
    $('#photos').show();
    addMenu(photos.menu, 'Photos', 'photos');
    
    if((photos.menu != undefined)&&(photos.menu != "")){
      let id =  getAnchor(photos.menu);
      photosID = '#' + id;
    }
    
    setCarouselHeight();
  } 
}

function addVideo(uiConfig) {
  let video = uiConfig.video;
  if ((video != undefined) && (video.youtubeVideoID != undefined) && (video.youtubeVideoID != '')) {
    let videoURL = "https://www.youtube.com/embed/"+video.youtubeVideoID+"?rel=0&controls=1&autoplay=0&cc_load_policy=1&modestbranding=1&showinfo=0&playsinline=1&enablejsapi=1";
    $('#video2').attr("src", videoURL + origin);
    setSectionTitle(video.sectionTitle, 'videoST');
    $('#video').show();
    addMenu(video.menu, 'Video', 'video'); 
    ytAPIRequired = true;
  } 
}

function addFloorPlans(uiConfig) {
  let floorPlans = uiConfig.floorPlans;
  if ((floorPlans != undefined) && (floorPlans.url != undefined) && (floorPlans.url != '')) { 
    $('#fpImage').attr("src", LISTINGS_ROOT_DIR+'/'+floorPlans.url);
    setSectionTitle(floorPlans.sectionTitle, 'floorPlansST');
    $('#floorPlans').show(); 
    addMenu(floorPlans.menu, 'Floor Plans', 'floorPlans');
  } 
}

function addShowcase(uiConfig) {
  let showcase = uiConfig.showcase;
  if ((showcase)&&(showcase.properties)&&(showcase.properties.length > 0)) {
    let property;
    let content;
    let src;
    let propertyPageURL;
    for (let i=0; i< showcase.properties.length; ++i) {
      property = showcase.properties[i];
      propertyPageURL = property.pageUrl.startsWith("index.html") ? LISTINGS_ROOT_DIR+"/?"+((property.pageUrl.split("?"))[1]) : property.pageUrl;
      src = LISTINGS_ROOT_DIR+'/'+property.url+'?width=';
      content = '<div class="col-sm-6 col-md-4 col-lg-3" style="padding:2.5px">'+
      '<div class="card">'+
      '<img'+
      ' srcset="'+src+'360 360w, '+src+'576 576w, '+
      src+'768 768w, '+src+'992 992w, '+
      src+'1200 1200w, '+src+'1400 1400w, '+
      src+'1600 1600w, '+src+'1920 1920w"'+
      ' src="'+src+'1920" class="card-img-top" style="object-fit:contain; width:100%"'+
      ' sizes="(max-width: 575px) 100vw, (max-width: 767px) 50vw, (max-width: 991px) 33.33vw, 25vw" onerror="logResourceLoadError(this)">'+
      '<div class="card-body">'+
      '<div class="card-text">'+
      '<div>'+property.addressLine1+'</div>'+
      '<div>'+property.addressLine2+'</div>'+
      '<div style="font-weight: lighter">'+property.bedsAndBaths+'</div>'+
      '<div style="font-weight: lighter">'+property.price+'</div>'+
      '<a href="'+propertyPageURL+'" style="text-decoration:underline">Learn More<a/>'+
      '</div></div></div></div>';
      $("#scGrid").append($(content));
    }
    setSectionTitle(showcase.sectionTitle, 'showcaseST');
    $('#showcase').show();
    addMenu(showcase.menu, 'Showcase', 'showcase');
  } 
}

function addContact(uiConfig) {
  let contact = uiConfig.contact;
  if (contact) {
    let mauticForm = contact.mauticForm;
    if (mauticForm) {
      // Configure Mautic form
      setMauticForms(mauticForm.formSetName);
      setEmailFormHeader(mauticForm.emailFormHeader);
      setPhoneFormHeader(mauticForm.phoneFormHeader);
      // Set page type
      page = mauticForm.pageType;
      // Load Mautic form
      let popupForm = mauticForm.popupForm;
      if ((popupForm)&&(popupForm.enable == true)) {
        enablePopupForm(popupForm.x, popupForm.y, popupForm.z, popupForm.controlVideos);
        loadForm("lpContent");
      }
      else {
        loadForm("aside");
        let formLoadCheckInterval = setInterval(function(){
          if(isFormLoaded()){
            if(!isEndOfForm()){
              setSectionTitle(contact.sectionTitle, 'contactST');
              $('#contact').show();
              addMenu(contact.menu, 'Contact', 'contact'); 
            }
            clearInterval(formLoadCheckInterval);
          }
        },200);     
      } 
    }
  } 
}

function addRealtor(uiConfig) {
  let realtor = uiConfig.realtor;
  if (realtor) {
    $('#rImage').attr('src', LISTINGS_ROOT_DIR+'/'+realtor.photo);
    $('#rName').text(realtor.name);
    $('#rCompany').text(realtor.company)
    $('#rId').text(realtor.id);
    $('#rPhone').text('Ph: '+realtor.phone);
    $('#rPhone').attr('href', 'tel:'+realtor.phone);
    $('#rLogo').attr('src', LISTINGS_ROOT_DIR+'/'+realtor.logo);
    let rFooterText = realtor.footerText;
    let rFooterLink = realtor.footerLink;
    let rFooterLinkText = realtor.footerLinkText;
    if((rFooterText)&&(rFooterText != '')){
    $('#rFooterText').prepend(rFooterText+" ");
      $('#rFooter').show();
    }
    if((rFooterLinkText)&&(rFooterLinkText != '')&&(rFooterLink)&&(rFooterLink != '')){
      $('#rFooterLink').attr('href', rFooterLink);   
      $('#rFooterLink').text(rFooterLinkText);
      $('#rFooter').show();
    }
    setSectionTitle(realtor.sectionTitle, 'realtorST');
    $('#realtor').show();
    addMenu(realtor.menu, 'Realtor', 'realtor');     
  } 
}

function addHomePageLink(uiConfig) {
  let showcase = uiConfig.showcase; 
  if ((showcase)&&(showcase.url)) {
    addMenu(showcase.menu, 'Showcase', '', LISTINGS_ROOT_DIR+'/');
  } 
}

function addFooterText(uiConfig) {
  let footertext = uiConfig.footertext;
  if (footertext) {
    $('#ftLine1').text(footertext.line1);
    $('#ftLine2').text(footertext.line2);
    $('#ftLine3').text(footertext.line3);
    $('#footer').show(); 
  } 
}

function addNavbarToggleEvent() {
  $(".navbar-nav a").click(function() { 
    $('#navbarNav').collapse('hide'); 
  }); 
}

function loadYoutubeIframeAPI() {
  console.log('ytAPIRequired:');
    var tag = document.createElement('script');
    tag.id = 'iframe-yt';
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.onerror = function() {
      logResourceLoadError(this);
    };
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }   

function addChatBot(uiConfig) {
  let chatbot = uiConfig.chatbot;
  if ((chatbot)&&(chatbot.enable == true)){
    // Add chatbot.css
    let chatbotCSS = '<link rel="stylesheet" href="'+LISTINGS_ROOT_DIR+'/css/chatbot.css" onerror="logResourceLoadError(this)">';
    $(document.head).append(chatbotCSS);
    //Add placeholder for chatbot
    $(document.body).append('<div id="chatContain"></div>');
    // Add chatbot.js
    let chatbotJS = '<script src="'+LISTINGS_ROOT_DIR+'/js/chatbot.js" onerror="logResourceLoadError(this)"></script>';
    $(document.body).append(chatbotJS);
    // Add index.js
    let indexJS = '<script src="'+LISTINGS_ROOT_DIR+'/js/index.js" onerror="logResourceLoadError(this)"></script>';
    $(document.body).append(indexJS);
  }
}

function getNthChild(index) {
  var x = document.getElementsByTagName("BODY")[0];
  return (x.children[index+1]);
}

function generateUI(uiConfig) {
  if((uiConfig == undefined)||((Object.keys(uiConfig).length == 1)&&('homePageData' in uiConfig))){
    return;
  }
  
  setPageTitle(uiConfig);
  
  let order = (pageType == 'home') ? uiConfig.homePageSectionsOrder : uiConfig.propertyPageSectionsOrder;
  if((order) && (order.length > 0)) {
    let ref;  
    order.forEach(function(val, index){
      ref = getNthChild(index);
      switch(val) {
        case "showcase":
          $(ref).after($("#showcase"));
          addShowcase(uiConfig);
          break;
        case "contact":
          $(ref).after($("#contact"));
          addContact(uiConfig);
          break;
        case "realtor":
          $(ref).after($("#realtor"));
          addRealtor(uiConfig);
          break;
        case "priceAndFeatures":
          $(ref).after($(document.getElementById("price&Features")));
          addPriceAndFeatures(uiConfig);
          break;
        case "description":
          $(ref).after($("#description"));
          addDescription(uiConfig);
          break;
        case "photos":
          $(ref).after($("#photos"));
          addPhotos(uiConfig);
          break;
        case "video":
          $(ref).after($("#video"));
          addVideo(uiConfig);
          break;
        case "virtualTour":
          $(ref).after($("#virtualTour"));
          addVirtualTour(uiConfig);
          break;
        case "home":
          $(ref).after($("#home"));
          addHome(uiConfig);
          break;
      }
    })  
  }
  else {
    addHome(uiConfig);
    addVirtualTour(uiConfig);
    addPriceAndFeatures(uiConfig);
    addDescription(uiConfig);
    addPhotos(uiConfig);
    addVideo(uiConfig);
    addFloorPlans(uiConfig);
    addShowcase(uiConfig);
    addContact(uiConfig);
    addRealtor(uiConfig); 
  }
  
  setFirstElementCSSTop('100px');
  addPushNotification(uiConfig);
  addHomePageLink(uiConfig);
  addFooterText(uiConfig);
  addChatBot(uiConfig);
  reWriteUrlsAndTrackPageView();
  addNavbarToggleEvent();
  loadYoutubeIframeAPI();
  onWindowResize();
}

function setFirstElementCSSTop(top) {
  let firstElement = getNthChild(1);
  $(firstElement).css('padding-top', top);  
}

function setSectionTitle(sectionTitle, id) {
  if ((sectionTitle != undefined)&&(sectionTitle != '')) {
    let element = document.getElementById(id);
    $(element).text(sectionTitle);
  }
}

function onWindowResize(){
  window.onresize = function() {
    setVirtualTourHeight();
    setCarouselHeight();
  };
}

function setVirtualTourHeight() {
  if ($(virtualTourID).css('display') != 'none') {
    let navHeight = $('#nav').outerHeight();
    let vtHeight = $(virtualTourID).outerHeight();
    let vtVideoHeight = $('#vtVideo').outerHeight();
    let windowHeight = $(window).height();
    let vtHeaderHeight = vtHeight - vtVideoHeight - 100;
    vtVideoHeight = windowHeight - navHeight - vtHeaderHeight;
    $('#vtVideo').height(vtVideoHeight+'px');
  }
}

function setCarouselHeight() {
  if ($(photosID).css('display') != 'none') {
    let width  = getImageWidth();
    let height = width/1.777;
    $('#photosCarousel').height(height + 'px');
    $('#photosCarousel').width(width + 'px');
    $('.carousel-item img').width(width + 'px');
    $('.carousel-item img').height(height + 'px');
  }
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

function showOrHideFeature(val, id){
  let ne = ((val)&&(val.trim() != ""));
  if(ne){
    $(id).text(val);
  }else{
    $(id+"_c").hide();
  }
}