/**
 * Link.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
     title:{
       type:'string',
       required: true
     },
    url:{
       type:'string',
       required: true
    },
    weight:{
       type:'integer',
       defaultsTo: 3
    },
    image:{
      type:'string',
      required: false
    },
   preferences: {
     collection: 'Preference',
     via: 'link'
   },
    owners: {
       collection: 'Category',
       via: 'links'
    }

  }
};
