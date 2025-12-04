import { create } from "zustand";

const useConversation = create((set) => ({
  selectedReceverId: null,
  setSelectedReceverId: (selectedReceverId) => set({ selectedReceverId }),

  // Conversation state
  conversation: null,
  setConversation: (conversation) => set({ conversation }),

  // Messages state
  messages: [],
  setMessage: (updater) =>
    set((state) => ({
      messages: typeof updater === "function" ? updater(state.messages) : updater,
    })),

  // Images state
  images: [],
  setImage: (images) => set({ images }),
}));

export default useConversation;
