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

## Contributing
Pull requests are welcome!

## License
[MIT](https://choosealicense.com/licenses/mit/)
