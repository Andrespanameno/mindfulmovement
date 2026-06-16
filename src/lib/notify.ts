import { toast, type ExternalToast } from "sonner";
import { getProfileSnapshot } from "@/lib/useProfile";

/**
 * Optional in-app notifications. Honors the per-user
 * `in_app_notifications` profile preference. Use this for non-essential
 * confirmations (hydration logged, XP awarded, goal completed, etc.).
 * Critical errors and required system messages should keep using `toast`
 * directly from `sonner`.
 */
function inAppEnabled(): boolean {
  const p = getProfileSnapshot();
  // Default to enabled when the profile hasn't loaded yet.
  return p?.in_app_notifications !== false;
}

type Message = string;

export const notify = Object.assign(
  (message: Message, data?: ExternalToast) => {
    if (!inAppEnabled()) return;
    return toast(message, data);
  },
  {
    success: (message: Message, data?: ExternalToast) => {
      if (!inAppEnabled()) return;
      return toast.success(message, data);
    },
    message: (message: Message, data?: ExternalToast) => {
      if (!inAppEnabled()) return;
      return toast.message(message, data);
    },
    info: (message: Message, data?: ExternalToast) => {
      if (!inAppEnabled()) return;
      return toast.info(message, data);
    },
  },
);