import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media',
  theme: {
    colors: {
      // === PALETTE 1: MODERN DARK-TO-CYAN ===
      black: {
        DEFAULT: '#000505',
        100: '#000101',
        200: '#000202',
        300: '#000303',
        400: '#000404',
        500: '#000505',
        600: '#006a6a',
        700: '#00cfcf',
        800: '#35ffff',
        900: '#9affff',
      },
      space_indigo: {
        DEFAULT: '#3b3355',
        100: '#0c0a11',
        200: '#181522',
        300: '#241f34',
        400: '#302945',
        500: '#3b3355',
        600: '#5c5085',
        700: '#8073ab',
        800: '#aba2c7',
        900: '#d5d0e3',
      },
      dusty_grape: {
        DEFAULT: '#5d5d81',
        100: '#13131a',
        200: '#262634',
        300: '#39394e',
        400: '#4b4b68',
        500: '#5d5d81',
        600: '#7a7a9f',
        700: '#9c9cb7',
        800: '#bdbdcf',
        900: '#dedee7',
      },
      pale_sky_1: {
        DEFAULT: '#bfcde0',
        100: '#1b2738',
        200: '#364e70',
        300: '#5175a7',
        400: '#86a0c5',
        500: '#bfcde0',
        600: '#cbd6e6',
        700: '#d8e0ec',
        800: '#e5eaf2',
        900: '#f2f5f9',
      },
      white_1: {
        DEFAULT: '#fefcfd',
        100: '#4c1932',
        200: '#973265',
        300: '#cb6497',
        400: '#e4afca',
        500: '#fefcfd',
        600: '#fefcfd',
        700: '#fefdfd',
        800: '#fefdfe',
        900: '#fffefe',
      },

      // === PALETTE 2: BLUE-GREY ===
      ink_black: {
        DEFAULT: '#04080f',
        100: '#010203',
        200: '#020306',
        300: '#03050a',
        400: '#03070d',
        500: '#04080f',
        600: '#19325d',
        700: '#2d5bab',
        800: '#648ed6',
        900: '#b2c6ea',
      },
      glaucous: {
        DEFAULT: '#507dbc',
        100: '#0f1927',
        200: '#1e324e',
        300: '#2d4b76',
        400: '#3b649d',
        500: '#507dbc',
        600: '#7498ca',
        700: '#97b2d7',
        800: '#b9cbe5',
        900: '#dce5f2',
      },
      powder_blue: {
        DEFAULT: '#a1c6ea',
        100: '#0f2740',
        200: '#1d4f80',
        300: '#2c76c0',
        400: '#5f9ddb',
        500: '#a1c6ea',
        600: '#b3d0ee',
        700: '#c6dcf2',
        800: '#d9e8f6',
        900: '#ecf3fb',
      },
      pale_sky_2: {
        DEFAULT: '#bbd1ea',
        100: '#142941',
        200: '#285282',
        300: '#3c7bc2',
        400: '#7ca6d7',
        500: '#bbd1ea',
        600: '#cadbef',
        700: '#d7e4f3',
        800: '#e4edf7',
        900: '#f2f6fb',
      },
      alabaster_grey: {
        DEFAULT: '#dae3e5',
        100: '#253235',
        200: '#4b6369',
        300: '#72949b',
        400: '#a7bcc0',
        500: '#dae3e5',
        600: '#e2e9eb',
        700: '#eaeff0',
        800: '#f1f4f5',
        900: '#f8fafa',
      },

      // === SEMANTIC COLORS (Light Theme) ===
      background: '#fefcfd',      // white_1
      foreground: '#04080f',      // ink_black
      primary: '#3b3355',         // space_indigo
      secondary: '#507dbc',       // glaucous
      accent: '#35ffff',          // black.800 (cyan)
      muted: '#bfcde0',           // pale_sky_1
      'muted-foreground': '#5d5d81', // dusty_grape
      border: '#dae3e5',          // alabaster_grey
      'input-bg': '#f2f5f9',      // pale_sky_1.900
      'card-bg': '#fefcfd',       // white_1
      error: '#cb6497',           // white_1.300 (pinkish)
      success: '#00cfcf',         // black.700 (cyan)
      warning: '#e4afca',         // white_1.400

      // === UTILITY COLORS ===
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      white: '#ffffff',
      black: '#000000',
    },
    extend: {
      fontFamily: {
        chillax: ['Chillax', 'system-ui', 'sans-serif'],
      },
      backgroundColor: {
        primary: '#fefcfd',         // Light background
        secondary: '#f2f5f9',       // Light gray background
        tertiary: '#e5eaf2',        // Lighter gray background
        accent: '#35ffff',          // Cyan accent
        dark: '#04080f',            // Dark text background
      },
      textColor: {
        primary: '#04080f',         // Main text (ink_black)
        secondary: '#3b3355',       // Secondary text (space_indigo)
        tertiary: '#5d5d81',        // Tertiary text (dusty_grape)
        muted: '#bfcde0',           // Muted text (pale_sky_1)
        accent: '#35ffff',          // Accent text (cyan)
      },
      borderColor: {
        primary: '#dae3e5',         // Main border (alabaster_grey)
        secondary: '#cbd6e6',       // Secondary border (pale_sky_1.600)
        accent: '#35ffff',          // Accent border (cyan)
      },
      boxShadow: {
        'sm-light': '0 1px 2px rgba(4, 8, 15, 0.05)',
        'md-light': '0 4px 6px rgba(4, 8, 15, 0.1)',
        'lg-light': '0 10px 15px rgba(4, 8, 15, 0.12)',
        'xl-light': '0 20px 25px rgba(4, 8, 15, 0.15)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3b3355 0%, #507dbc 50%, #a1c6ea 100%)',
        'gradient-accent': 'linear-gradient(135deg, #35ffff 0%, #00cfcf 50%, #006a6a 100%)',
        'gradient-light': 'linear-gradient(135deg, #f2f5f9 0%, #fefcfd 100%)',
      },
    },
  },
  plugins: [],
}
export default config
