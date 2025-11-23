const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(process.cwd(), "data", "config", "video-systems.json");

function loadVideoConfig() {
  try {
    const file = fs.readFileSync(CONFIG_PATH, "utf-8");
    return JSON.parse(file);
  } catch (error) {
    console.warn("[videoConfig] Falha ao carregar configuração, usando padrão.", error);
    return {
      defaultSystem: "google-meet",
      options: ["google-meet", "highmesh"],
      videoQuality: "hd",
      recording: {
        autoStart: false,
        storagePath: "/public/user-media/recordings/"
      }
    };
  }
}

module.exports = {
  loadVideoConfig
};

