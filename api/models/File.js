/**
 * File.js
 *
 * @description :: Model of file. Now do not use.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    id: {
      type: 'integer',
      required: true
    },
    name: {
      type: 'string',
      required: true
    },
    url: {
      type: 'string',
      required: true
    }

  }
};

