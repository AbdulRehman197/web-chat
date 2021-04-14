import XMPP from "stanza.io";
import configureClient from "../../xmpp";

function setupClient() {
  const client = XMPP.createClient({
    sasl: ["scram-sha-1", "cram-md5", "digest-md5"],
    ...window.config.xmpp
    // capsNode: "https://web.xabber.com"
  });

  window.client = client;
  console.log("window", window)
  configureClient(client);

  client.on("session:started", () => {
    client.sendPresence();
  });

  // client.on("raw:incoming", console.log);
  // client.on("raw:outgoing", console.log);

  return client;
}

export default setupClient;
