"use client";

import { useEffect, useState } from "react";
import { getUser, isAdminUser, onAuthChange, refreshCurrentUser } from "@/lib/strapi";

export default function useCanManage() {
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    let active = true;

    function sync() {
      if (active) {
        setCanManage(isAdminUser(getUser()));
      }
    }

    sync();
    refreshCurrentUser().then(sync).catch(sync);

    const unsubscribe = onAuthChange(sync);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return canManage;
}
