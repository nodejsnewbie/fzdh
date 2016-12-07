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
    links:{
      collection:'Link',
      via:'owner'
    },
    fans:{
      collection:'User',
      via:'preferences'
    }
  }
};

