const { Translate } = require('@google-cloud/translate').v2,
      Html5Entities = require('html-entities').Html5Entities,
      entities      = new Html5Entities();

class ViewTranslator {

  #API_KEY;
  #TRANSLATOR;
  #PLACEHOLDER = '999VIEWTRANSLATORPLACEHOLDER999';


  /*
    @param API_KEY: string
  */
  constructor (API_KEY) {

    if (typeof API_KEY === 'undefined') {
      throw new Error('Please provide a Google Cloud API key.');
    }

    if (typeof API_KEY !== 'string') {
      throw new Error('The Google Cloud API key must be a string.');
    }

    if (API_KEY.trim() === '') {
      throw new Error('The Google Cloud API key may not be an empty string.');
    }

    this.#API_KEY        = API_KEY;
    this.#TRANSLATOR     = new Translate({ key: this.#API_KEY });

  }

  /*
    @param inputFilePath: string
    @param outputFilePath: string
    @param targetLanguage: string
  */
  async translateFile (inputFilePath, outputFilePath, targetLanguage) {

  }

  /*
    @param text: string
    @param targetLanguage: string
  */
  async translateText (text, targetLanguage) {

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

  */
  #translate = async function (text, targetLanguage) {
    const { items, garbled }  = this.#garble(text),
          [translatedEncoded] = await this.#TRANSLATOR.translate(garbled, { to: targetLanguage, format: 'html' }),
          translatedDecoded   = this.#decode(translatedEncoded),
          translated          = this.#ungarble(translatedDecoded, items);
    return translated;
  }


  /*
    Decodes HTML 5 Entities

    @params text: string
  */
  #decode = function (text) {
    return entities.decode(text);
  }


  /*
    Replaces instances of this.#PLACEHOLDER with their respective Handlebars element

    @param text: string
    @param items: array
  */
  #ungarble = function (text, items) {
    var n         = -1,
        ungarbled = text.replace(new RegExp(this.#PLACEHOLDER, 'g'), function (_) {
          n++;
          return items[n];
        });
    return ungarbled;
  }


  /*
    Returns object containing array of Handlebars bracket {{...}} elements and garbled text.
    Occurrences of {{...}} are replaced with the string of this.#PLACEHOLDER

    @param text: string
    @return {
      items: Array
      garbled: string
    }
  */
  #garble = function (text) {

    var matches = [...text.matchAll(/{{.*?}}/g)],
        items   = [];

    for (var match of matches) {
      items.push(match[0]);
    }

    var garbled = text.replace(/{{.*?}}/g, this.#PLACEHOLDER);

    return {
      items:   items,
      garbled: garbled
    };

  }


}


module.exports.ViewTranslator = ViewTranslator;


async function test() {
  const viewTranslator = new ViewTranslator('AIzaSyCh5DceyuecG8bRtKMNuWtDPFEd2ZH3sQM');
  console.log(await viewTranslator.translateText(fileText, 'es'))
}



test()
