import { Platform, Alert as RNAlert } from "react-native";

/**
 * Platform-agnostic alert utility
 * Uses native Alert on mobile and window.alert/confirm on web
 */

interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

const alert = {
  alert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: any
  ): void {
    if (Platform.OS === "web") {
      // Web implementation using window.alert and window.confirm
      if (!buttons || buttons.length === 0) {
        window.alert(`${title}\n${message || ""}`);
        return;
      }

      if (buttons.length === 1) {
        window.alert(`${title}\n${message || ""}`);
        buttons[0].onPress?.();
        return;
      }

      // For multiple buttons, use confirm
      const confirmed = window.confirm(`${title}\n${message || ""}`);

      if (confirmed) {
        // Find the first non-cancel button and call it
        const confirmButton = buttons.find(b => b.style !== "cancel");
        confirmButton?.onPress?.();
      } else {
        // Find the cancel button and call it
        const cancelButton = buttons.find(b => b.style === "cancel");
        cancelButton?.onPress?.();
      }
    } else {
      // Native implementation
      RNAlert.alert(title, message, buttons, options);
    }
  },
};

export default alert;
