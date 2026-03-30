import { useEffect } from "react";

export function useChatling() {
  useEffect(() => {
    window.chtlConfig = { chatbotId: "7631258385" };
    if (document.getElementById("chtl-script")) {
      return undefined;
    }

    const script = document.createElement("script");
    script.id = "chtl-script";
    script.async = true;
    script.dataset.id = "7631258385";
    script.src = "https://chatling.ai/js/embed.js";
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);
}
