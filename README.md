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

### includeAttributes
The `includeAttributes` field is a list of all attribute names you wish to have translated in your markup. All content between either single or double quotes of the attribute declaration will be translated in the specified target language.

For the best results, only include attributes with simple text values rather than ones with inlined styles or scripts.

### excludeDelimiters
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

Then the `<div></div>` element above would be correctly translated as follows (respecting both the `includedAttributes` and `excludeDelimiters` rules):

```html
<div data-message='Hola, {{name}}'></div>
```

## Advanced usage

## Contributing
Pull requests are welcome!

## License
[MIT](https://choosealicense.com/licenses/mit/)
