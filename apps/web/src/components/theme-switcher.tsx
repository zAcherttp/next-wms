"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";

import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import { Label } from "./ui/label";

export function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant={"secondary"}
        size="icon"
        className="group/toggle extend-touch-target size-8 relative overflow-hidden"
        title="Toggle theme"
      ></Button>
    );
  }

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <Button
      variant={"outline"}
      size="icon"
      className="group/toggle extend-touch-target size-8 relative overflow-hidden"
      onClick={toggleTheme}
      title="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <motion.span
          key="moon"
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1.05,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute h-4 w-4"
          style={{ position: "absolute" }}
        >
          <Moon />
        </motion.span>
      ) : (
        <motion.span
          key="sun"
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1.05,
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="absolute h-4 w-4"
          style={{ position: "absolute" }}
        >
          <Sun />
        </motion.span>
      )}
      <Label className="sr-only">Toggle theme</Label>
    </Button>
  );
}
