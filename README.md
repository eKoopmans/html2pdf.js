# html2pdf

html2pdf converts any webpage or element into a printable PDF entirely client-side using [html2canvas](https://github.com/niklasvh/html2canvas) and [jsPDF](https://github.com/MrRio/jsPDF).

## Getting started

#### HTML

The simplest way to use html2pdf is to download `dist/html2pdf.bundle.min.js` to your project folder and include it in your HTML with:

```html
<script src="html2pdf.bundle.min.js"></script>
```

*Note: [Click here](#dependencies) for more information about using the unbundled version `dist/html2canvas.min.js`.*

#### NPM

Install html2pdf and its dependencies using NPM with `npm install --save html2pdf.js` (make sure to include `.js` in the package name).

*Note: You can use NPM to create your project, but html2pdf **will not run in Node.js**, it must be run in a browser.*

#### Bower

Install html2pdf and its dependencies using Bower with `bower install --save html2pdf.js` (make sure to include `.js` in the package name).

## Usage

Once installed, html2pdf is ready to use. The following command will generate a PDF of `#element-to-print` and prompt the user to save the result:

```js
var element = document.getElementById('element-to-print');
html2pdf(element);
```

## Options

html2pdf can be configured using an optional `opt` parameter:

```js
var element = document.getElementById('element-to-print');
html2pdf(element, {
  margin:       1,
  filename:     'myfile.pdf',
  image:        { type: 'jpeg', quality: 0.98 },
  html2canvas:  { dpi: 192, letterRendering: true },
  jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
});
```

The `opt` parameter has the following optional fields:

|Name        |Type            |Default                       |Description                                                                                                 |
|------------|----------------|------------------------------|------------------------------------------------------------------------------------------------------------|
|margin      |number or array |0                             |PDF margin (in jsPDF units). Can be a single number, `[vMargin, hMargin]`, or `[top, left, bottom, right]`. |
|filename    |string          |'file.pdf'                    |The default filename of the exported PDF.                                                                   |
|image       |object          |{type: 'jpeg', quality: 0.95} |The image type and quality used to generate the PDF. See the Extra Features section below.                  |
|enableLinks |boolean         |true                          |If enabled, PDF hyperlinks are automatically added ontop of all anchor tags.                                |
|html2canvas |object          |{ }                           |Configuration options sent directly to `html2canvas` ([see here](https://html2canvas.hertzen.com/configuration) for usage).|
|jsPDF       |object          |{ }                           |Configuration options sent directly to `jsPDF` ([see here](http://rawgit.com/MrRio/jsPDF/master/docs/jsPDF.html) for usage).|

### Page-breaks

You may add `html2pdf`-specific page-breaks to your document by adding the CSS class `html2pdf__page-break` to any element (normally an empty `div`). For React elements, use `className=html2pdf__page-break`. During PDF creation, these elements will be given a height calculated to fill the remainder of the PDF page that they are on. Example usage:

```html
<div id="element-to-print">
  <span>I'm on page 1!</span>
  <div class="html2pdf__page-break"></div>
  <span>I'm on page 2!</span>
</div>
```

### Image type and quality

You may customize the image type and quality exported from the canvas by setting the `image` option. This must be an object with the following fields:

|Name        |Type            |Default                       |Description                                                                                  |
|------------|----------------|------------------------------|---------------------------------------------------------------------------------------------|
|type        |string          |'jpeg'                        |The image type. HTMLCanvasElement only supports 'png', 'jpeg', and 'webp' (on Chrome).       |
|quality     |number          |0.95                          |The image quality, from 0 to 1. This setting is only used for jpeg/webp (not png).           |

These options are limited to the available settings for [HTMLCanvasElement.toDataURL()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL), which ignores quality settings for 'png' images. To enable png image compression, try using the [canvas-png-compression shim](https://github.com/ShyykoSerhiy/canvas-png-compression), which should be an in-place solution to enable png compression via the `quality` option.

## Dependencies

html2pdf depends on the external packages [html2canvas](https://github.com/niklasvh/html2canvas), [jsPDF](https://github.com/MrRio/jsPDF), and [es6-promise](https://github.com/stefanpenner/es6-promise). These dependencies are automatically loaded when using NPM or the bundled package.

If using the unbundled `dist/html2pdf.min.js` (or its un-minified version), you must also include each dependency. Order is important, otherwise html2canvas will be overridden by jsPDF's own internal implementation:

```html
<script src="es6-promise.auto.min.js"></script>
<script src="jspdf.min.js"></script>
<script src="html2canvas.min.js"></script>
<script src="html2pdf.min.js"></script>
```

html2pdf currently uses [this fork](https://github.com/eKoopmans/html2canvas/tree/develop) of html2canvas to resolve a few bugs and add support for box-shadows and custom resolutions (via the `dpi`/`scale` options).

## Contributing

### Issues

When submitting an issue, please provide reproducible code that highlights the issue, preferably by creating a fork of [this template jsFiddle](https://jsfiddle.net/u6o6ne41/) (which has html2pdf already loaded). Remember that html2pdf uses [html2canvas](https://github.com/niklasvh/html2canvas) and [jsPDF](https://github.com/MrRio/jsPDF) as dependencies, so it's a good idea to check each of those repositories' issue trackers to see if your problem has already been addressed.

### Pull requests

If you want to create a new feature or bugfix, please feel free to fork and submit a pull request! Use the [`develop`](/eKoopmans/html2pdf/tree/develop) branch, which features the latest development, and make changes to `/src/` rather than directly to `/dist/`. You can test your changes by rebuilding with `npm run build`.

## Credits

[Erik Koopmans](https://github.com/eKoopmans)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2017 Erik Koopmans <[http://www.erik-koopmans.com/](http://www.erik-koopmans.com/)>
