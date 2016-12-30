/**
 * Category.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    category: {
      type: 'string',
      required: true,
      unique:true,
      defaultsTo: ''
    },
    types:{
      collection:'catalog',
      via:'categories'
    },
    links:{
      collection:'link',
      via:'owners'
    },
    fans:{
      collection:'User',
      via:'preferences'
    }
  }
};
