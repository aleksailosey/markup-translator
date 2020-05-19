# markup-translator
Translate markup with Google's Translate API.

## Installation
Use [npm](https://npmjs.org) to install markup-translator.

```bash
npm install markup-translator
```

## Prerequisites


## Basic Usage
```javascript
const MarkupTranslator = require('markup-translator');

async function test () {
  var translator = new MarkupTranslator('GOOGLE_CLOUD_API_KEY');
  var translatedMarkup = await translator.translateFromText('<span>Hello world!</span>', 'es');
  console.log(translatedMarkup);
}

test();

// Outputs <span>¡Hola Mundo!</span>

```

## Options
As a default, Google's Translate API only translates text between two tags. This behavior can be especially frustrating and deleterious if you wish to translate certain element attributes (such as the `placeholder` or `title` attributes) or if you are using a template engine like [Handlebars](https://handlebarsjs.com/).

### Illustration of potential issues

To combat these deficiencies, the `MarkupTranslator` class constructor has an optional `options` argument.

## Contributing
Pull requests are welcome!

## License
[MIT](https://choosealicense.com/licenses/mit/)
