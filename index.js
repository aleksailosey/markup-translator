/*
  Author: Aleksai Losey
  Version: 5/19/2020
  Email: aleksailosey@gmail.com
  License: MIT
  Disclaimer: My first npm package
*/


const { Translate } = require('@google-cloud/translate').v2,
      Html5Entities = require('html-entities').Html5Entities,
      entities      = new Html5Entities();

class MarkupTranslator {

  #API_KEY;
  #TRANSLATOR;
  #EXCLUDE_DELIMITERS;
  #INCLUDE_ATTRIBUTES;
  #PLACEHOLDER_BASE  = 'MARKUPTRANSLATORPLACEHOLDER';
  #PLACEHOLDER_INDEX = 0;

  #INVALID_DELIMITERS = [`'`, '"', "'"];

  /*
    @param API_KEY: string
    @param options: object
  */
  constructor (API_KEY, options) {

    if (typeof API_KEY === 'undefined') {
      throw new Error('Please provide a Google Cloud API key.');
    }

    if (typeof API_KEY !== 'string') {
      throw new Error('The Google Cloud API key must be a string.');
    }

    if (API_KEY.trim() === '') {
      throw new Error('The Google Cloud API key may not be an empty string.');
    }

    this.#API_KEY             = API_KEY;
    this.#TRANSLATOR          = new Translate({ key: this.#API_KEY });
    this.#EXCLUDE_DELIMITERS  = options && options.excludeDelimiters && Array.isArray(options.excludeDelimiters) ? options.excludeDelimiters : [];
    this.#INCLUDE_ATTRIBUTES  = options && options.includeAttributes && Array.isArray(options.includeAttributes) ? options.includeAttributes : [];

    for (var delimiter of this.#EXCLUDE_DELIMITERS) {

      if (typeof delimiter !== 'object' || !delimiter.start || !delimiter.end || typeof delimiter.start !== 'string' || typeof delimiter.end !== 'string') {

        throw new Error(`Invalid delimiter (${JSON.stringify(delimiter)}) provided in the excludeDelimiters field. Delimiter objects must have the form { start: string, end: string }.`);

      }

    }

    // now check for validity of delimiters
    for (var delimiter of this.#EXCLUDE_DELIMITERS) {

      for (var invalidDelimiter of this.#INVALID_DELIMITERS) {

        if (delimiter.start.indexOf(invalidDelimiter) !== -1 || delimiter.end.indexOf(invalidDelimiter) !== -1) {

          throw new Error(`Invalid character (${invalidDelimiter}) is present in delimiter. Delimiters may not contain the following characters: ', ", or \`.`);

        }

      }

    }

    for (var attribute of this.#INCLUDE_ATTRIBUTES) {

      if (typeof attribute !== 'string') {

        throw new Error(`Invalid attribute (${attribute}) provided in the includeAttributes field. Attributes must be non-empty strings.`);

      }

    }

  }

  /*
    @param inputFilePath: string
    @param outputFilePath: string
    @param targetLanguage: string
  */
  async translateFromFile (inputFilePath, outputFilePath, targetLanguage) {

  }

  /*
    @param text: string
    @param targetLanguage: string
  */
  async translateFromText (text, targetLanguage) {

    if (typeof text === 'undefined') {

      throw new Error('Please provide text to translate.')

    }

    if (typeof text !== 'string') {

      throw new Error(`The text value provided (${text}) must be a string`);

    }

    if (typeof targetLanguage === 'undefined') {

      throw new Error('Please provide a target language.');

    }

    try {

      return await this.#translate(text, targetLanguage);

    } catch (error) {

      if (error.code === 403) {

        throw new Error(`The provided Google Cloud API key (${this.#API_KEY}) is invalid.`);

      } else if (error.message) {

        throw new Error(error.message);

      } else {

        throw new Error('An unexpected error has occurred');

      }

    }

  }


  /*
    Translates markup while considering excluded delimiters and included attributes

    @param text: string
    @param targetLanguage: string
  */
  #translate = async function (text, targetLanguage) {
    const { restoreMap, garbled } = this.#garble(text),
          translatedAttributes    = await this.#translateAttributes(garbled, targetLanguage),
          [translatedEncoded]     = await this.#TRANSLATOR.translate(translatedAttributes, { to: targetLanguage, format: 'html' }),
          translatedDecoded       = this.#decode(translatedEncoded),
          translated              = this.#ungarble(translatedDecoded, restoreMap);

    return translated;

  }


  /*
    Decodes HTML 5 Entities

    @params text: string
  */
  #decode = function (text) {
    return entities.decode(text);
  }


  #translateAttributes = async function (text, targetLanguage) {

    var translated = text,
        attributes = [];

    if (this.#INCLUDE_ATTRIBUTES.length) {

      for (var attribute of this.#INCLUDE_ATTRIBUTES) {

        // note: greedy inner capture
        var regex   = new RegExp(`${attribute}\\s*=\\s*('|")(.*)\\1`, 'g'),
            matches = [...translated.matchAll(regex)];

        for (var match of matches) {

          var item = {
            fullCapture: match[0],
            value: match[2]
          };

          var exists = false;

          for (var attribute of attributes) {

            if (attribute.fullCapture === item.fullCapture) {
              exists = true;
              break;
            }

          }

          if (!exists) {

            attributes.push(item);

          }

        }

      }

    }

    for (var attribute of attributes) {

      var [translatedAttributeEncoded] = await this.#TRANSLATOR.translate(attribute.value, { to: targetLanguage, format: 'text' }),
          translatedAttributeDecoded   = this.#decode(translatedAttributeEncoded),
          fullCaptureReplaced          = attribute.fullCapture.replace(attribute.value, translatedAttributeDecoded);

      translated = translated.replace(new RegExp(`${attribute.fullCapture}`, 'g'), fullCaptureReplaced);

    }

    return translated;

  }

  /*
    Replaces instances of this.#PLACEHOLDER with their respective Handlebars element

    @param text: string
    @param items: array
  */
  #ungarble = function (text, restoreMap) {

    var ungarbled = text;

    for (var placeholder in restoreMap) {
      var n         = 0,
          ungarbled = ungarbled.replace(new RegExp(placeholder, 'g'), function (_) {
            return restoreMap[placeholder]['items'][n++];
          });
    }

    return ungarbled;

  }


  /*
    Returns garbled text object containing map of placeholders to their corresponding text elements.

    @param text: string
    @return {
      restoreMap: Array
      garbled: string
    }
  */
  #garble = function (text) {

    var garbled    = text,
        restoreMap = [];

    if (this.#EXCLUDE_DELIMITERS.length) {

      for (var delimiter of this.#EXCLUDE_DELIMITERS) {

        var regex   = new RegExp(`${delimiter.start}(.*?)${delimiter.end}`, 'g'),
            matches = [...garbled.matchAll(regex)],
            items   = [];

        for (var match of matches) {
          items.push(match[0]);
        }

        if (items.length) {

          var placeholder = this.#PLACEHOLDER_BASE + this.#PLACEHOLDER_INDEX++;

          restoreMap[placeholder] = { delimiter: delimiter, items: items };

          garbled = garbled.replace(regex, placeholder);

        }

      }

    }

    return { garbled, restoreMap };

  }

}


module.exports.MarkupTranslator = MarkupTranslator;



async function test () {
  var translator = new MarkupTranslator('AIzaSyCh5DceyuecG8bRtKMNuWtDPFEd2ZH3sQM', { includeAttributes: ['placeholder', 'data-message'], excludeDelimiters: [{start: '{{', end: '}}'}] });
  console.log(await translator.translateFromText(`<div data-message='Hello, {{name}}'></div>`, 'es'));
}

test();
