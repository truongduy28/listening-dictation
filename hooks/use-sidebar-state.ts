"use client";

import { useState, useCallback, useEffect } from "react";
import { getStoredSettings, saveStoredSettings } from "@/lib/storage";

export function useSidebarState() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) return true;
      return getStoredSettings().sidebarCollapsed;
    }
    return false;
  });

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      saveStoredSettings({ sidebarCollapsed: next });
      return next;
    });
  }, []);

  const openSidebar = useCallback(() => {
    setSidebarCollapsed(false);
    saveStoredSettings({ sidebarCollapsed: false });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarCollapsed(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    sidebarCollapsed,
    handleToggleSidebar,
    openSidebar,
  };
}
