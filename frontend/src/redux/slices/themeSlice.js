import { createSlice } from '@reduxjs/toolkit';

const storedTheme = localStorage.getItem('simplystore_theme');
const initialDarkMode = storedTheme === 'dark';

if (initialDarkMode) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    darkMode: initialDarkMode,
  },
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('simplystore_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('simplystore_theme', 'light');
      }
    },
  },
});

export const { toggleDarkMode } = themeSlice.actions;
export default themeSlice.reducer;
