import { Project, Task } from "@/src/helpers/type";
import {create } from "zustand"

type LoadIframe = {
    isOpen : boolean;
    onOpen : (card: Project | Task) => void;
    onClose : () => void;
    selectedcard : null | Project | Task
}

export const IframeHook = create<LoadIframe>((set) => ({
    selectedcard: null,
    isOpen: false,
    onOpen: (card) => {
        console.log("onOpen card was called")
        set({ selectedcard: card, isOpen: true,})},
    onClose: () => set({ selectedcard: null, isOpen : false})
}));