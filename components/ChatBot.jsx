import { basePath } from '@/next.config';
import Script from 'next/script';
import React, { useEffect } from 'react';

const ChatBot = ({chatbotDFAgent}) => {

  useEffect(() => {
    setChatbotDFAgent(chatbotDFAgent);
  },[]);

  return (
  <>
    <link rel="stylesheet" href={`${basePath}/css/chatbot.css`} />
    <Script src={`${basePath}/js/chatbot.js`} strategy="beforeInteractive" />
    <Script src={`${basePath}/js/index.js`} strategy="beforeInteractive" />
    <Script src="https://kit.fontawesome.com/c3c47df7d6.js" strategy="beforeInteractive" />
    <div id="chatContain"></div>
  </>
  );
};

export default ChatBot;