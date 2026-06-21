import toast, { ToastOptions } from "react-hot-toast";

/**
 * Copies a string to the system clipboard and displays a success toast.
 *
 * @param text - The content to copy
 * @param successMessage - Optional custom toast notification text
 * @param options - Optional react-hot-toast options (e.g. icons)
 */
export function copyToClipboard(
  text: string,
  successMessage = "Copied to clipboard!",
  options?: ToastOptions
): void {
  if (!text) return;

  if (!navigator.clipboard) {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) {
        toast.success(successMessage, options);
      } else {
        toast.error("Failed to copy link");
      }
    } catch (err) {
      console.error("Legacy copy fallback failed:", err);
      toast.error("Failed to copy link");
    }
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => {
      toast.success(successMessage, options);
    })
    .catch((err) => {
      console.error("Clipboard copy failed:", err);
      toast.error("Failed to copy link");
    });
}
