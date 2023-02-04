/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // backgroundImage: {
      //   hero: "url('../public/images/background.png)",
      // },
      keyframes: {
        bouncer: {
          "0%": { transform: "scale(1,1)      translateY(0)" },
          "0%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-2px)" },
          "50%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        bouncing: "bouncer 1s cubic-bezier(0.280, 0.840, 0.420, 1) infinite",
      },
      colors: {
        primary: "#b91c1c",
        secondary: "#ef4444",
        grad: "#F2B705",
        bg1: "#262626",
        bg2: "#0c0c0c",
      },
    },
    // colors: {
    //   // 'blue': '#1fb6ff',
    //   // 'pink': '#ff49db',
    //   // 'orange': '#ff7849',
    //   // 'green': '#13ce66',
    //   // 'gray-dark': '#273444',
    //   // 'gray': '#8492a6',
    //   // 'gray-light': '#d3dce6'
    //   // 'primary':'#008bff'

    // },
  },
  plugins: [],
};
