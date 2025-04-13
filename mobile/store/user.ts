import { create } from 'zustand';

type UserProps = {
  sur_name: string;
  key_join: string;
  setSurName: (sur_name: string) => void;
  setKeyJoin: (key_join: string) => void;
};

export const useUserStore = create<UserProps>((set) => ({
  sur_name: '',
  key_join: '',
  setSurName: (sur_name) => set({ sur_name }),
  setKeyJoin: (key_join) => set({ key_join }),
}));
