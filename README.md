# react-image-diff

Zero-dependency React component providing different modes for diffing or comparing images. The image format is the same as that generated by `jest-image-snapshot`, a three part image with the order old-diff-new.

## Features

### Four image comparison modes

- `split` - drag a handle to view a split of old vs new
- `blend` - using a native `input` slider, fade the new image over the old
- `pixel-diff` - show the diff image directly
- `side-by-size` - display both image side-by-size

### Overlay

Generate a magenta overlay to highlight small changes.

### Responsive

Fit the image diff to its container, or optionally display it full size.

### Styling

All styles are inline for maximum portability.