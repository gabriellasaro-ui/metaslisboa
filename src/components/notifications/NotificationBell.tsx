import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationsPopover } from "./NotificationsPopover";

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <NotificationsPopover open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" className="relative h-10 w-10">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 flex items-center justify-center">
            <span className="relative flex h-5 w-5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex items-center justify-center rounded-full h-5 min-w-5 px-1 bg-destructive text-destructive-foreground text-[10px] font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          </div>
        )}
      </Button>
    </NotificationsPopover>
  );
}
