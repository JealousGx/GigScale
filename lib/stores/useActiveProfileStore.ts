import { create } from "zustand";

interface ActiveProfileStore {
  profileId: string | null;
  setProfileId: (id: string | null) => void;
}

export const useActiveProfileStore = create<ActiveProfileStore>((set) => ({
  profileId: null,
  setProfileId: (id) => set({ profileId: id }),
}));
