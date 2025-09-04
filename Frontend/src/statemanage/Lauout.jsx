import { create } from "zustand";

const useLauout = create((set) => ({
  activeTab: "/chat-page",
  selectedContact:null,
  SetSelectedContact: (selectedContact) =>
    set({ selectedContact }),
  SetactiveTab:(activeTab)=>
    set({activeTab})
  

}));
export default useLauout;