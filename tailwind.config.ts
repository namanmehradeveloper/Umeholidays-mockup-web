import type {Config} from 'tailwindcss';
export default {content:['./app/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}'],theme:{extend:{colors:{ink:'#1b1917',ivory:'#f7f1e7',terracotta:'#b76b43'},fontFamily:{sans:['DM Sans','Arial'],serif:['Playfair Display','Georgia']}}},plugins:[]} satisfies Config;
