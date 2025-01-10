let CHATBOT_SRC = 'https://chat-' + window.location.hostname + ':2053/index?campaignSource=default';
const CHAT_PREVIEW_FLASH_SECONDS = -1;
const CHAT_PREVIEW_INITIAL_FLASH_SECONDS = CHAT_PREVIEW_FLASH_SECONDS;

window.getCustomGlobalVariables = () => ({
  CHATBOT_SRC,
  CHAT_PREVIEW_FLASH_SECONDS,
  CHAT_PREVIEW_INITIAL_FLASH_SECONDS
})