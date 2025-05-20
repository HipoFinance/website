import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        fontFamily: {
            heebo: ['Heebo', ...fontFamily.sans],
            eczar: ['Eczar'],
            poppins: ['Poppins'],
        },
        extend: {
            colors: {
                black: '#03010d',
                white: '#ffffff',
                purple1: '#6d1eb3',
                purple2: '#461472',
                purple3: '#dfbcfe',
                purple4: '#d8d8f6',
                purple5: '#4411d8',
                purple6: '#7e22ce',
                purple7: '#471fb7',
                purple8: '#8753ff',
                purple9: '#cc60fe',

                pink1: '#e622c2',
                darkblue1: '#170c55',
                darkblue2: '#03010d',
                darkblue3: '#0B0826',
                darkblue4: '#1d1356',
                darkblue5: '#3e337d',
                gray1: '#dedbe4',
                background: '#02031e',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                brush: 'url(/brush.svg)',
            },
            rotate: {
                '30': '30deg',
                '-30': '-30deg',
            },
            width: {
                '1/7': '14.28571429%',
                '2/7': '28.57142857%',
                '3/7': '42.85714286%',
                '4/7': '57.14285714%',
                '5/7': '71.42857143%',
                '6/7': '85.71428571%',
                '7/7': '100%',
            },
        },
    },
    plugins: [],
} satisfies Config
