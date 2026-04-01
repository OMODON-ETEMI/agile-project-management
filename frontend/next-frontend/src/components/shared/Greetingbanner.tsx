"use client"

import { User } from "@/src/helpers/type";
import { motion  } from "framer-motion";
import {
  Sparkles,
  Sun,
  Sunset,
  Moon,
  Coffee,
} from "lucide-react";

function getGreeting(user?: User) {
  const hour = new Date().getHours();
  const name =
    user?.first_name ||
    user?.last_name?.split(" ")[0] ||
    user?.username ||
    "there";

  if (hour >= 5 && hour < 12) {
    return { text: `Good morning, ${name}`, Icon: Coffee, sub: "Let's build something great today." };
  } else if (hour >= 12 && hour < 17) {
    return { text: `Good afternoon, ${name}`, Icon: Sun, sub: "Hope the sprint is going well." };
  } else if (hour >= 17 && hour < 21) {
    return { text: `Good evening, ${name}`, Icon: Sunset, sub: "Wrapping up for the day?" };
  } else {
    return { text: `Working late, ${name}?`, Icon: Moon, sub: "Don't forget to rest. 🌙" };
  }
}

export default function GreetingBanner({ user }: { user?: User}) {
  const { text, Icon, sub } = getGreeting(user);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="flex items-start gap-3"
    >
      {/* Icon bubble */}
      <div className="mt-0.5 w-8 h-8 rounded-xl bg-[#0052CC]/8 border border-[#0052CC]/15
        flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-[#0052CC]" />
      </div>

      <div className="min-w-0">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight truncate">
          {text}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5 font-mono">{sub}</p>
      </div>

      {/* Sparkle — hidden on tiny screens */}
      <motion.div
        animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="hidden sm:flex ml-auto"
      >
        <Sparkles className="w-4 h-4 text-[#0052CC]/40" />
      </motion.div>
    </motion.div>
  );
}