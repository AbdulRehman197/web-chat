(function () {
  // var loginDomain = "http://ec2-3-141-65-53.us-east-2.compute.amazonaws.com/http-bind";
  var wsURL = "wss://ws.xabber.com:9443/websocket";

  window.config = {
    xmpp: {
      transport: "websocket",
      wsURL: wsURL,
    }
    // xmppDomain: loginDomain,
  };
})();
