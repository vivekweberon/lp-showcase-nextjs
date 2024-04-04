import { Html, Head, Main, NextScript } from "next/document";
import React from "react";
const MyDocument = () => (
  <Html>
    <Head>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
        crossOrigin="anonymous"
      />
      <script src="/lp-showcase/js/areacodes.json"></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/rb-config.js"
        //onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/logger.js"
        //onError="logResourceLoadError(this)"
      ></script>
      <script
        src="/lp-showcase/js/jquery-3.5.1.min.js"
        //onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/jwt-decode.js"
        //onError="logResourceLoadError(this)"
      ></script>

      <script
        type="text/javascript"
        src="/lp-showcase/js/tracker-config.js"
        //onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/showcase.js"
        //onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/tracker-util.js"
        //onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/tracker.js"
        //onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/showdown-1.9.1.min.js"
        //onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/inline-script.js"
        //onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="https://accounts.google.com/gsi/client"
        //onError="logResourceLoadError(this)"
      ></script>
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default MyDocument;
