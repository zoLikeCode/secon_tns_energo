import { create } from 'zustand';

type ActProps = {
  id: number;
  setId: (id: number) => void;
};

export const useAct = create<ActProps>((set) => ({
  id: 0,
  setId: (id) => set({ id }),
}));
