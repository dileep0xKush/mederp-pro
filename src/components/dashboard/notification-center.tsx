"use client";

import { useState } from "react";
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, Check, Inbox } from "lucide-react";
import useStore from "@/store";
import { Button } from "../ui/button";

export function NotificationCenter() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-rose-500" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      default:
        return <Info className="h-4 w-4 text-sky-500" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Overlay to close */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 p-4 z-40 animate-in fade-in-50 slide-in-from-top-1">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-2">
              <span className="font-semibold text-sm">Alerts & Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Check className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center flex flex-col items-center justify-center text-zinc-400">
                  <Inbox className="h-8 w-8 mb-2 stroke-[1.5]" />
                  <p className="text-xs">All caught up! No notifications.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className={`flex items-start gap-3 p-2 rounded-lg transition-colors cursor-pointer ${
                      notif.read
                        ? "bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                        : "bg-emerald-500/5 hover:bg-emerald-500/10 border-l-2 border-emerald-500 dark:bg-emerald-400/5"
                    }`}
                  >
                    <div className="mt-0.5">{getIcon(notif.type)}</div>
                    <div className="flex-1 space-y-0.5">
                      <p className={`text-xs font-semibold ${notif.read ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-950 dark:text-zinc-50"}`}>
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                        {notif.message}
                      </p>
                      <span className="text-[9px] text-zinc-400 block pt-0.5">
                        {notif.timestamp}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
