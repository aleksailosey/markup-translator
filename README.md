# markup-translator
Translate markup with Google's Translate API.

## Installation
Use [npm](https://npmjs.org) to install markup-translator.

```bash
npm install markup-translator
```

## Prerequisites
1. Create a Google Cloud project
2. Enable the Google Translate API
3. Create an API key

Information on how to achieve these three steps can be found [here](https://cloud.google.com/deployment-manager/docs/step-by-step-guide/installation-and-setup).

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

### Example of undesired behavior concerning HTML element attributes
Suppose we use Google's Translate API on the HTML code below:
```html
<input type='password' placeholder='Password' title='Please enter a strong password'></input>  
```
None of the three attributes above will be translated into the provided target language. While this is desirable behavior for the `type` attribute, it is not so for both the `placeholder` and `title` attributes.

### Example of undesired behavior when using a template engine
Suppose we use the [Handlebars](https://handlebarsjs.com/) template engine in the code below:
```handlebars
<body>
  {{> partial}}
  <h3>Hello, {{name}}</h3>
</body>
```
If we were to translate this markup into Spanish, for example, `{{> partial}}` and `{{name}}` would become `{{> parcial}}` and `{{nombre}}`, respectively. This is an issue.


To combat these deficiencies, the `MarkupTranslator` class constructor has an optional `options` argument.

### Options

```javascript
...
const options = {
  includeAttributes: ['placeholder', 'title'],
  excludeDelimiters: [
    {
      start: '{{',
      end: '}}'
    }
  ]
};
const translator = new MarkupTranslator('GOOGLE_CLOUD_API_KEY', options);
...
```
The options argument has two fields: `includeAttributes` and `excludeDelimiters`. You may wish include one, the other, or both.

#### `includeAttributes`
The `includeAttributes` field is a list of all attribute names you wish to have translated in your markup. All content between either single or double quotes of the attribute declaration will be translated in the specified target language.

For the best results, only include attributes with simple text values rather than ones with inlined styles or scripts.

#### `excludeDelimiters`
The `excludeDelimiters` field prevents translation of content between all specified delimiters. A delimiter object must include exactly two fields named `start` and `end` specifying the start and end delimiter, respectively.

Start and end delimiters may not include the following characters: ', ", \`

If you find yourself needing to prevent translation of a certain word or group of text, remember that the default behavior of Google's Translate API allows you to avoid translation with the following methods:

```html
<span translate='no'>This will not translate</span>
<div class='notranslate'>Neither will this</div>
```

### A note on precedence
Excluded delimiters have precedence over included attributes. This makes it possible to include custom values in translated attributes. For example, consider the following `<div></div>` element:

```html
<div data-message='Hello, {{name}}'></div>
```

And consider we provide the following options:

```javascript
...
const options = {
  includeAttributes: [ 'data-message' ],
  excludeAttributes: [
    {
      start: '{{',
      end: '}}'
    }
  ]
};
...
```

Then the `<div></div>` element above would be correctly translated as follows (respecting both the `includeAttributes` and `excludeDelimiters` rules):

```html
<div data-message='Hola, {{name}}'></div>
```

## Advanced usage

### Initialization

The `MarkupTranslator` class constructor accepts two arguments: a Google Cloud API key and an `options` object.

The first argument, the API key, is required. The `options` object, on the other hand, is not required and may be omitted.

If possible, try not to hard code the Google Cloud API key into your program. Rather, try using environment variables to store API keys. Consult [dotenv](https://www.npmjs.com/package/dotenv) to learn more.

Below is an example initialization using the environment variable `GOOGLE_CLOUD_API_KEY` and passing in an arbitrary `options` argument.

```javascript
const MarkupTranslator = require('markup-translator');

const translator = new MarkupTranslator(process.env.GOOGLE_CLOUD_API_KEY, {
  includeAttributes: ['placeholder', 'title', 'alt'],
  excludeDelimiters: [
    {
      start: '{{',
      end: '}}'
    },
    {
      start: '<<',
      end: '>>'
    }
  ]
});
```

### Instance methods

Below are the two ways in which to translate markup given an instance of the `MarkupTranslator` class named `translator`:

#### `await translator.translateFromText(text, targetLanguage)`
`translateFromText` accepts a string of markup and a target language code. It returns the translated markup.

#### `await translator.translateFromFile(inputFilePath, outputFilePath, targetLanguage)`
`translateFromFile` accepts an input file path, an output file path, and a target language code. This method accepts markup from `inputFilePath` and ouputs the translated markup to `outputFilePath`. Returns `true` upon completing this.

If `inputFilePath` cannot be resolved, a fatal error will be thrown.

If `outputFilePath` does not exist at runtime, then it will be created. Make sure, however, that `outputFilePath`'s enclosing directories exist. Otherwise, a fatal error will be thrown.

### Supported target languages
The language of the provided markup is inferred. The `targetLanguage` argument must be a supported [ISO_639-1](https://en.wikipedia.org/wiki/ISO_639-1) language code. A list of supported ISO_639-1 codes for Google's Translate API can be found [here](https://cloud.google.com/translate/docs/languages).

Alternatively, you may print out supported languages and their corresponding ISO_639-1 codes with the following statement:

```javascript
translator.printSupportedLanguageCodes();
```

## Contributing
Pull requests are welcome!

## License
[MIT](https://choosealicense.com/licenses/mit/)
