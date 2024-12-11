# react-image-diff

Zero-dependency React component providing different modes for diffing or comparing images. The image format is the same as that generated by `jest-image-snapshot`, a three part image with the order old-diff-new. All styles are inline for maximum portability.

## Four image comparison modes

### `split`

Drag a handle to view a split of old vs new

![split](images/split.webp)

### `blend`

Using a native `input` slider, fade the new image over the old

![blend](images/blend.webp)

### `pixel-diff`

Show the diff image directly

![pixel diff](images/pixel-diff.webp)

### `side-by-size`

Display both image side-by-size

![side-by-side](images/side-by-side.webp)

## Configuration

### `showOverlay`

Generate a magenta overlay to highlight small changes.

![overlay](images/overlay.webp)

### `showFullSize`

By default the component will responsively fit the image into the container size. Set `showFullSize` to `true` to display the image at its full size.

![full size](images/full-size.webp)

### `showDivider`

Defaults to true. Shows an orange divider line between the old and new images in `split` mode. Set to `false` to hide.

![no divider](images/no-divider.webp)

### `hasPadding`

Defaults to false. Adds padding around the images with a standard checkerboard pattern. Makes it easier to see the edges of the images.

![padding](images/padding.webp)

## Building

```sh
npm run build
```

## Demo

Since `ImageDiff` does not include any configuration controls, the demo is a simple showcase of the modes and options.

```sh
npm run demo:watch
# another terminal
npm run demo:serve
# open http://localhost:3000
```
