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
```
The options argument has two fields: `includeAttributes` and `excludeDelimiters`. You may wish include one, the other, or both.

### includeAttributes
The `includeAttributes` field is a list of all attribute names you wish to have translated in your markup. All content between either single or double quotes of the attribute declaration will be translated in the specified target language. For the best results, only include attributes with simple text values rather than ones with inlined styles or scripts.

### excludeDelimiters

### A note on precedence


## Advanced usage

## Contributing
Pull requests are welcome!

## License
[MIT](https://choosealicense.com/licenses/mit/)
