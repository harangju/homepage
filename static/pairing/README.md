# PNAS cover (surface.html)

Unlisted 3D point-cloud cover built from the real 5×5 human×AI personality interaction effects on ad quality. Reachable by URL, not linked from the home page, `noindex`.

## Export the print file

1. Open `surface.html`, frame the view, pick the measure (composite/text/image/click).
2. Click **Download (8.5×11 @300dpi)**. This saves `pairing_cover.png` at 2550 × 3300 px (8.5 × 11 in at 300 DPI = 21.59 × 27.94 cm), sRGB.
3. Convert to the TIFF the journal wants:

```
sips -s format tiff -s dpiWidth 300 -s dpiHeight 300 pairing_cover.png --out pairing_cover.tif
```

Result: `pairing_cover.tif`, 8.5 × 11 in, 300 DPI, RGB.

Format note: the art is a glow point cloud, so EPS (vector) would only wrap a raster and risk the blending. TIFF is the correct format here.
