import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "data", "config", "video-systems.json");

export function readVideoSystemConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Não foi possível carregar a configuração de vídeo:", error);
    return {
      defaultSystem: "google-meet",
      options: ["google-meet", "highmesh"],
      videoQuality: "sd", // Standard Definition (480p) - optimal for video calls
      recording: {
        autoStart: false,
        storagePath: "/public/user-media/recordings/"
      },
      waitingRoom: {
        background: "/assets/waiting-room/default-background.jpg",
        ambienceAudio: "/assets/audio/default-ambience.mp3"
      }
    };
  }
}

export function writeVideoSystemConfig(nextConfig) {
  const payload = JSON.stringify(nextConfig, null, 2);
  fs.writeFileSync(CONFIG_PATH, payload, "utf-8");
  return nextConfig;
}



