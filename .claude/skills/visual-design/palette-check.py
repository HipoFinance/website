#!/usr/bin/env python3
"""Check a set of colours against a surface: WCAG contrast of each, and the CIELAB distance of
every pair as seen with normal vision and under deuteranopia, protanopia and tritanopia (Machado
2009, severity 1). No dependencies.

  python3 palette-check.py --surface '#2b2423' community=#ff7e73 liquidity=#6fc7b2 ...
  python3 palette-check.py --surface '#ffffff' --min-contrast 3 --min-de 15 name=#hex ...

A pair under --min-de (default 15) in any vision is flagged; a colour under --min-contrast
(default 3, the WCAG floor for graphics) is flagged. Exit code 1 when anything is flagged.
"""
import argparse, itertools, math, sys

def hex2rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))

def lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def gam(c):
    return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055

def lum(rgb):
    r, g, b = map(lin, rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)

def to_lab(rgb):
    r, g, b = map(lin, rgb)
    x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    y = 0.2126 * r + 0.7152 * g + 0.0722 * b
    z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    fx, fy, fz = f(x), f(y), f(z)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))

def de(a, b):
    return math.dist(to_lab(a), to_lab(b))

MATRICES = {
    'deutan': [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
    'protan': [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
    'tritan': [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
}

def simulate(rgb, kind):
    l = list(map(lin, rgb))
    m = MATRICES[kind]
    return tuple(gam(min(1, max(0, sum(m[i][j] * l[j] for j in range(3))))) for i in range(3))

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--surface', required=True)
    p.add_argument('--min-contrast', type=float, default=3.0)
    p.add_argument('--min-de', type=float, default=15.0)
    p.add_argument('colors', nargs='+', help='name=#hex')
    a = p.parse_args()
    surface = hex2rgb(a.surface)
    cols = {}
    for item in a.colors:
        name, h = item.split('=', 1)
        cols[name] = hex2rgb(h)
    flagged = False
    print('contrast against', a.surface)
    for n, c in cols.items():
        r = contrast(c, surface)
        flag = '  <-- below %.1f' % a.min_contrast if r < a.min_contrast else ''
        flagged |= bool(flag)
        print('  %-12s %.2f%s' % (n, r, flag))
    print('pair distance: normal / deutan / protan / tritan')
    for x, y in itertools.combinations(cols, 2):
        vals = [de(cols[x], cols[y])] + [de(simulate(cols[x], k), simulate(cols[y], k)) for k in MATRICES]
        flag = '  <-- below %.0f' % a.min_de if min(vals) < a.min_de else ''
        flagged |= bool(flag)
        print('  %-12s %-12s %5.1f %5.1f %5.1f %5.1f%s' % (x, y, *vals, flag))
    sys.exit(1 if flagged else 0)

if __name__ == '__main__':
    main()
