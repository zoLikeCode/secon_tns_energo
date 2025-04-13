import { create } from 'zustand';

type usePhotoProps = {
  nowPhoto: number;
  photoOne: string | null;
  photoTwo: string | null;
  photoThree: string | null;
  setNowPhoto: (value: number) => void;
  setPhoto: (index: 1 | 2 | 3, value: string) => void;
  resetPhoto: (index: 1 | 2 | 3) => void;
  countPhotos: () => number;
  count_photo: number; // Добавляем сюда count_photo
};

export const usePhoto = create<usePhotoProps>((set, get) => ({
  nowPhoto: 1,

  photoOne: null,
  photoTwo: null,
  photoThree: null,

  setNowPhoto: (value) => set({ nowPhoto: value }),

  setPhoto: (index, value) => {
    switch (index) {
      case 1:
        set({ photoOne: value });
        break;
      case 2:
        set({ photoTwo: value });
        break;
      case 3:
        set({ photoThree: value });
        break;
    }
    set({ count_photo: get().countPhotos() });
  },

  resetPhoto: (index) => {
    switch (index) {
      case 1:
        set({ photoOne: null });
        break;
      case 2:
        set({ photoTwo: null });
        break;
      case 3:
        set({ photoThree: null });
        break;
    }
    set({ count_photo: get().countPhotos() });
  },

  countPhotos: () => {
    let count = 0;
    if (get().photoOne) count++;
    if (get().photoTwo) count++;
    if (get().photoThree) count++;
    return count;
  },

  count_photo: 0,
}));
