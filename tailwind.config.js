/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    // lib too, since shared class strings live there now. Without it
    // Tailwind never sees them and emits nothing: moving the hover sweep
    // into lib/hover-underline.ts silently killed it on every page,
    // including the services menu it came from. The class was on the
    // element and the rule did not exist.
    "./lib/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1400px",
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        poppins: "var(--font-poppins)",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        platinum: "hsl(var(--platinum))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "our-programs-border": {
          DEFAULT: "hsl(var(--our-programs-border))",
        },
        "our-programs-border-2": {
          DEFAULT: "hsl(var(--our-programs-border-2))",
        },
        "our-programs-border-3": {
          DEFAULT: "hsl(var(--our-programs-border-3))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        appear: {
          from: { opacity: 0 },
          to: { opacity: 100 },
        },
        /*
          The B Corp score ring drawing itself, CH-119. Each segment is one
          circle whose dash grows from nothing to its own share, so the five
          together sweep clockwise from twelve o'clock.

          --len and --circumference are set inline per segment, because the
          lengths are data. A keyframe can read a custom property the element
          carries, which is what makes one shared animation serve five arcs of
          different sizes.
        */
        "draw-arc": {
          from: { strokeDasharray: "0 var(--circumference)" },
          to: { strokeDasharray: "var(--len) var(--circumference)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        appear: "appear 0.5s ease-in-out",
        "draw-arc": "draw-arc 0.9s cubic-bezier(0.33, 1, 0.68, 1) both",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar"),
  ],
};
