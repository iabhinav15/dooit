import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.dooit.app",
  appName: "Dooit",
  webDir: "out",
  server: {
    url: "https://dooitapp.netlify.app",
    cleartext: true,
  },
};

export default config;
