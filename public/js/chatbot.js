(() => {
  var src = "http://testbot.weberon.net:3000/index?campaignSource=testJoshua";
  var title = "How can we help?";
  let chatPreviewIntervalSeconds, chatbotSrc, chatPreviewInitialFlashSeconds;
  let isGlobalVarsResolved = false;
  let isCBFrameError = false;

  let cbPreviewContent = title;
  let chatbotDFAgent = "default";

  window.setChatbotDFAgent = (campaignSource) => {
    if (campaignSource) {
      chatbotDFAgent = campaignSource;
    }
  };

  const getUrlWithCampaignSource = (chatbotUrl) => {
    var campaignSource = getCampaignSource();
    var urlWithCampaignSource = chatbotUrl;
    if (campaignSource) {
      urlWithCampaignSource = appendCampaignSource(urlWithCampaignSource, campaignSource);
    }
    return urlWithCampaignSource;
  };

  const updateParamToUrl = (url, paramName, paramValue) => {
    if (url == null) return url;
    try {
      let _url = new URL(url);
      _url.searchParams.set(paramName, paramValue);
      return _url.toString();
    } catch (error) {
      return url;
    }
  };

  const appendCampaignSource = (urlWithCampaignSource, campaignSource) => {
    return updateParamToUrl(urlWithCampaignSource, "campaignSource", campaignSource);
  };

  const getCampaignSource = () => {
    let campaignSource = null;
    try {
      const cba = getSearchParams(window.location.href)["cba"]; //cba: ChatBotAgent
      const utm_campaign = getSearchParams(window.location.href)["utm_campaign"];
      campaignSource = cba || utm_campaign || chatbotDFAgent;
    } catch (err) {}
    console.log({ campaignSource });
    return campaignSource;
  };

  const messageSent = (event) => {
    console.log("[CB] Message sent!!");
  };

  let initFlag = false;
  let cbsLiveFlag = false;

  const initializeChatIfnotInitialized = async (event) => {
    console.log("[initializeChatIfnotInitialized]", {
      "event.data": event.data,
      initFlag,
      willInitiaze: event.data == "server_connected" && initFlag === false,
    });
    if (event.data == "server_connected" && initFlag === false) {
      await showChatBottom();
      enableFlash();
      initFlag = true;
    }
  };

  const receiveMessage = (event) => {
    console.log("[CB] Message received !!", event);
    const { data } = event || {};
    if (cbClientMessageHandlers[data] == null) {
      console.log("[CB] Not Found: CB Client Message Handler for", data);
      return;
    }
    cbClientMessageHandlers[data](event);
  };

  const getSearchParams = (url_string) => {
    const params2 = {};
    try {
      const url = new URL(url_string);
      for (const p of url.searchParams) {
        params2[p[0]] = p[1];
      }
    } catch (e) {
      console.log(e);
    }
    console.log("[CB] Params : " + JSON.stringify(params2));
    return params2;
  };

  const isMonitoringRequest = () => {
    return getSearchParams(window.location.href)["hck"] == "true";
  };

  window.addEventListener("bot_uttered", receiveMessage, false);
  window.addEventListener("message", receiveMessage, false);

  const registerError = () => {
    document.getElementById("cbframe").onerror = (e) => {
      console.log("[CB] Errror occured on cbFrame", e);
      isCBFrameError = true;
    };
  };

  //----------------------- CBImprovements {op#1661} Nov-Dec23 [Start]
  let helpMessageFlag = false;

  const isNotValidElement = (e) => e == null || (!e) instanceof HTMLElement;

  const addClassToElement = (element, className) => {
    if (isNotValidElement(element)) return;
    element.classList.add(className);
  };

  const removeClassFromElement = (element, className) => {
    if (isNotValidElement(element)) return;
    element.classList.remove(className);
  };

  const isIterable = (input) => {
    return input ? typeof input[Symbol.iterator] === "function" : false;
  };

  const updateCbsConnectionStatusToView = () => {
    try {
      const element = document.getElementById("cbs-status");
      if (isNotValidElement(element)) return;
      if (cbsLiveFlag) {
        addClassToElement(element, "cbs-live");
        removeClassFromElement(element, "cbs-offline");
      } else {
        addClassToElement(element, "cbs-offline");
        removeClassFromElement(element, "cbs-live");
      }
    } catch (error) {
      console.error(`Error Occurred while updating CBS status to view; error: ${error}`);
    }
  };

  const updateCbsStatusToHeader = () => {
    const cbTitle = document.getElementById("chat-box-header-title");
    if (isNotValidElement(cbTitle)) return;
    if (cbsLiveFlag) {
      cbTitle.innerText = UI_MSGS.READY_HELP;
    } else {
      cbTitle.innerText = UI_MSGS.WILL_BE_BACK;
    }
  };

  const updateCbsStatusToView = () => {
    updateCbsConnectionStatusToView();
    updateCbsStatusToHeader();
  };

  const cbsConnected = async (event) => {
    cbsLiveFlag = true;
    await initializeChatIfnotInitialized(event);
    updateCbsStatusToView();
    startHelpMessage();
  };

  const cbsDisconnected = (event) => {
    cbsLiveFlag = false;
    updateCbsStatusToView();
    stopHelpMessage();
  };

  const messageReceived = (event) => {
    console.log("[CB] Chat Message received !!", event);
    enableFlash();
  };

  const cbClientMessageHandlers = {
    chat_incomming_message: messageReceived,
    chat_outgoing_message: messageSent,
    server_connected: cbsConnected,
    server_disconnected: cbsDisconnected,
  };

  const sleep = (sleepMs = 0) => {
    sleepMs = isNumber(sleepMs) ? sleepMs : 0;
    return new Promise((res) => {
      setTimeout(() => res(), sleepMs);
    });
  };

  const hideHelpMessage = () => {
    const cbPreview = document.getElementById("chat-help-msg");
    cbPreview.classList.add("hide");
  };

  const showHelpMessage = () => {
    const cbPreview = document.getElementById("chat-help-msg");
    cbPreview.classList.remove("hide");
  };

  const addRemoveClass = async (elem, className, sleepB4Remove = 0) => {
    if (isNotValidElement(elem)) return;
    elem.classList.add(className);
    await sleep(sleepB4Remove);
    elem.classList.remove(className);
  };

  const helpMessageAnimator =
    (exeFlag = false) =>
    async () => {
      if (exeFlag == true) return;
      exeFlag = true;
      const elem = document.getElementById("chat-help-msg");
      const fadeInRight =
        (sleepB4Remove = 0) =>
        async () => {
          await addRemoveClass(elem, "fade-in-right", sleepB4Remove);
        };

      const pulseHeartBeat =
        (sleepB4Remove = 0) =>
        async () => {
          await addRemoveClass(elem, "pulse-heartbeat", sleepB4Remove);
        };

      const fadeOutRight =
        (sleepB4Remove = 0) =>
        async () => {
          await addRemoveClass(elem, "fade-out-right", sleepB4Remove);
        };

      const idle =
        (idleTime = 0) =>
        async () =>
          await sleep(idleTime);

      const queue = [hideHelpMessage, idle(5000), showHelpMessage, fadeInRight(2000), pulseHeartBeat(3500), fadeOutRight(2000)];

      for (let pointer = queue.length; helpMessageFlag && cbsLiveFlag; pointer++) {
        pointer = pointer % queue.length;
        const cb = queue[pointer];
        if (typeof cb === "function") {
          await cb();
        }
      }

      exeFlag = false;
    };

  const triggerHelpMessageAnimation = helpMessageAnimator();

  const stopHelpMessage = () => {
    helpMessageFlag = false;
    hideHelpMessage();
  };

  const hideChatBottom = () => {
    const elem = document.getElementById("chat-bottom-container");
    if (isNotValidElement(elem)) return;
    elem.classList.add("hide");
  };

  let chatOpenFlag = false;

  const openChatBox = () => {
    const elem = document.getElementById("chat-box");
    if (isNotValidElement(elem)) return;
    elem.classList.remove("hide");
    chatOpenFlag = true;
    addRemoveClass(elem, "fade-in-bottom", 2000);
  };

  const openChat = () => {
    disableFlash();
    stopHelpMessage();
    hideChatBottom();
    openChatBox();
  };

  const startHelpMessage = () => {
    helpMessageFlag = true;
    triggerHelpMessageAnimation();
  };

  const showChatBottom = async () => {
    const elem = document.getElementById("chat-bottom-container");
    if (isNotValidElement(elem)) return;
    elem.classList.remove("hide");
    await addRemoveClass(elem, "fade-in-right", 2000);
  };

  const closeChatBox = async () => {
    const elem = document.getElementById("chat-box");
    if (isNotValidElement(elem)) return;
    chatOpenFlag = false;
    await addRemoveClass(elem, "fade-out-bottom", 2000);
    elem.classList.add("hide");
  };

  const closeChat = async () => {
    await closeChatBox();
    await showChatBottom();
    startHelpMessage();
  };

  //----------------------- CBImprovements {op#1661} Nov-Dec23 [END]

  const isNumber = (v) => /^[\d]*$/g.test(v);

  const enableFlash = () => {
    if (chatOpenFlag) return;
    let cb = document.getElementById("chat-circle");
    if (cb != null) cb.classList.add("flash");
  };

  const disableFlash = () => {
    let cb = document.getElementById("chat-circle");
    if (cb != null) cb.classList.remove("flash");
  };

  const UI_MSGS = {
    HELP: "May we help you?",
    READY_HELP: "Ready to Help!",
    SORRY: "Sorry!",
    LIVE_OPERATOR_AVLBL: "Live Operators not available",
    CHECK_BACK_LATER: "Please check back later",
    WILL_BE_BACK: "Will be back soon!",
  };

  const getRandomNumber = (min, max) => {
    // Ensure min and max are integers
    min = Math.ceil(min);
    max = Math.floor(max);

    if (min > max) {
      let _max2 = min;
      min = max;
      max = _max2;
    }

    // Generate a random number between min (inclusive) and max (inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const getRandomId = () => {
    const random1 = getRandomNumber(11111, 9999999);
    const random2 = getRandomNumber(11111, 9999999);
    return `${random1}-${new Date().getTime()}-${random2}`;
  };

  let chatCircleId = "chat-circle";
  let chatCloseId = "chat-close";

  const renderChatBot2 = (chatbotServerUrl) => {
    let e1 = document.createElement("div");

    const rid = getRandomId();
    chatCircleId = `chat-circle-${rid}`;
    chatCloseId = `chat-close-${rid}`;
    e1.id = `mycb-${rid}`;
    e1.innerHTML = `
  <div id="chat-bottom">
    <div id="chat-bottom-container" class="hide">
      <div id="chat-help-msg" class="hide">
        ${UI_MSGS.HELP}
      </div>
      <div class="chat-circle" id="${chatCircleId}">
        <span class="cbs-status-container">
          <span class="cbs-status" id="cbs-status"></span>
        </span>
        <i class="fas fa-comments"></i>
      </div>

    </div>

  </div>

  <div id="chat-box" class="hide">
    <div id="chat-box-header">
    
      <span class="chat-box-header--body">
        
        <span class="chat-box-header--title" id="chat-box-header-title">
          ${UI_MSGS.READY_HELP}
        </span>
        <span class="chat-box-close" id="${chatCloseId}">
          <i class="fas fa-times"></i>
        </span>
      </span>
    </div>
    
    <div class="chat-box-body">
      <object id="cbframe" data=${chatbotServerUrl} standby="Loading...">
        <div class="error-box">
          <h3>${UI_MSGS.SORRY} </h3>
          <span>${UI_MSGS.LIVE_OPERATOR_AVLBL}</span>
          <h5>${UI_MSGS.CHECK_BACK_LATER}</h5>
        </div>
      </object>
    </div>

    <div class="chat-box-footer"></div>
    
  </div>
  `;
    let chatContainer = document.getElementById("chatContain");
    if (chatContainer == null) return;
    chatContainer.appendChild(e1);

    const chatCircleElement = document.getElementById(chatCircleId);
    chatCircleElement.addEventListener("click", openChat);

    const chatCloseElement = document.getElementById(chatCloseId);
    chatCloseElement.addEventListener("click", closeChat);

    registerError();
  };

  const waitFor = (executorFunction, whatFor, MAXWAIT = 3000, WAIT_INTERVAL = 100) => {
    return new Promise((res, rej) => {
      let waited = 0;
      const errors = {};
      const cleaner = (timer) => {
        for (const key of Object.keys(errors)) {
          const error = errors[key];
          console.error(`[CB] ERROR while executing executorFunction waiting for ${whatFor}`, error);
        }
        clearInterval(timer);
      };
      let timer = setInterval(() => {
        if (waited >= MAXWAIT) {
          cleaner(timer);
          rej("Crossed Maximum Wait Time");
        }
        try {
          const result = executorFunction();
          if (result.isValid) {
            cleaner(timer);
            res(result);
          }
        } catch (error) {
          errors[error.message] = error;
        }

        waited += WAIT_INTERVAL;
      }, WAIT_INTERVAL);
    });
  };

  const getMauticSrc = async () => {
    const executorFunction = () => ({
      isValid: mauticSrc != null,
    });
    await waitFor(executorFunction, "mauticSrc");
    return mauticSrc;
  };

  const getUrlWithMauticSrc = async (url) => {
    try {
      const mautic_src = await getMauticSrc();
      return updateParamToUrl(url, "mauticSrc", mautic_src);
    } catch (error) {
      console.error("[CB] Couldn't fetch mauticSrc");
      return url;
    }
  };

  const getUrlWithLpHref = (url) => {
    try {
      const lphref = window.location.href;
      return updateParamToUrl(url, "lphref", lphref);
    } catch (error) {
      console.error("[CB] Updating URL with lphref");
      return url;
    }
  };

  const getMtcId = async () => {
    const executorFunction = () => ({
      isValid: window.localStorage.mtc_id != null,
    });
    await waitFor(executorFunction, "mtc_id");
    return window.localStorage.mtc_id;
  };

  const getUrlWithMtcId = async (url) => {
    try {
      const mtc_id = await getMtcId();
      return updateParamToUrl(url, "mtc_id", mtc_id);
    } catch (error) {
      console.error("[CB] Couldn't fetch mtc_id");
      return url;
    }
  };

  const waitForCustomGlobalVariables = async () => {
    const executorFunction = () => ({
      isValid: window.getCustomGlobalVariables != null,
    });
    await waitFor(executorFunction, "getCustomGlobalVariables Function");
  };

  const resolveGlobalvariablesAndUpdateLocally = async () => {
    try {
      await waitForCustomGlobalVariables();
      const { CHATBOT_SRC, CHAT_PREVIEW_FLASH_SECONDS, CHAT_PREVIEW_INITIAL_FLASH_SECONDS } = window.getCustomGlobalVariables();
      chatbotSrc = CHATBOT_SRC;
      chatPreviewIntervalSeconds = CHAT_PREVIEW_FLASH_SECONDS;
      chatPreviewInitialFlashSeconds = CHAT_PREVIEW_INITIAL_FLASH_SECONDS;
      isGlobalVarsResolved = true;
    } catch (error) {
      console.error("[CB] Couldn't fetch getCustomGlobalVariables");
    }
  };

  const onReady = async () => {
    try {
      await resolveGlobalvariablesAndUpdateLocally();
      if (isGlobalVarsResolved === false) return;
      const urlWithCampaignSource = getUrlWithCampaignSource(chatbotSrc);
      const urlWithMtcId = await getUrlWithMtcId(urlWithCampaignSource);
      const urlWithMauticSrc = await getUrlWithMauticSrc(urlWithMtcId);
      const urlWithLpUrl = getUrlWithLpHref(urlWithMauticSrc);
      renderChatBot2(urlWithLpUrl);
    } catch (error) {
      console.error(error);
    }
  };

  /*
  $(document).ready( handler ) is deprecated
  use: $( handler )
  https://api.jquery.com/ready/#ready-handler
  */
  $(function () {
    onReady();
  });
})();