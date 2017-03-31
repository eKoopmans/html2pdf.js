# html2pdf

html2pdf converts any webpage or element into a printable PDF entirely client-side using [html2canvas](https://github.com/niklasvh/html2canvas) and [jsPDF](https://github.com/MrRio/jsPDF).

## Install

1. Copy `html2pdf.js` to your project directory.
2. Fetch the dependencies `html2canvas` and `jsPDF`, which can be found in the `vendor` folder.
3. Include the files in your HTML document (**order is important**, otherwise `jsPDF` will override `html2canvas` with its own internal implementation):

```js
<script src="jspdf.min.js"></script>
<script src="html2canvas.min.js"></script>
<script src="html2pdf.js"></script>
```

**Note:** For best results, use the custom builds of `html2canvas` and `jsPDF` found in the `vendor` folder, which contain added features and hotfixes.

## Usage

### Basic usage

Including html2pdf exposes the `html2pdf` function. Calling it will create a PDF and prompt the user to save the file:

```js
var element = document.getElementById('element-to-print');
html2pdf(element);
```

The PDF can be configured using an optional `opt` parameter:

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

|Name        |Type            |Default                       |Description                                                                                  |
|------------|----------------|------------------------------|---------------------------------------------------------------------------------------------|
|margin      |number or array |1                             |PDF margin. Array can be either [vMargin, hMargin] or [top, left, bottom, right].            |
|filename    |string          |'file.pdf'                    |The default filename of the exported PDF.                                                    |
|image       |object          |{type: 'jpeg', quality: 0.95} |The image type used to generate the PDF. It must have two fields: 'type', the image type ('jpeg'/'png'); and 'quality', the image quality (0-1). See [here](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL) for more info (do not include 'image/' in the 'type' field).|
|enableLinks |boolean         |true                          |If enabled, PDF hyperlinks are automatically added ontop of all anchor tags.                 |
|html2canvas |object          |{ }                           |Configuration options sent directly to `html2canvas` ([see here](https://github.com/niklasvh/html2canvas) for usage).|
|jsPDF       |object          |{ }                           |Configuration options sent directly to `jsPDF` ([see here](https://github.com/MrRio/jsPDF) for usage.                |

## Dependencies

html2pdf depends on the external packages [`html2canvas`](https://github.com/niklasvh/html2canvas) and [`jsPDF`](https://github.com/MrRio/jsPDF).

For best results, use [this custom build](https://github.com/eKoopmans/html2canvas/tree/develop) of `html2canvas`, which adds support for box-shadows and custom resolutions (via the `dpi`/`scale` options), and [this build](https://github.com/eKoopmans/html2pdf/blob/master/vendor/jspdf.min.js) of jsPDF, which contains a hotfix for hyperlinks.

## Credits

[Erik Koopmans](https://github.com/eKoopmans)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2017 Erik Koopmans <[http://www.erik-koopmans.com/](http://www.erik-koopmans.com/)>
