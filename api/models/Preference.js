/**
 * Preference.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true,
      unique:true,
      defaultsTo: ''
    },
    category: {
      type: 'string',
      required: true,
      unique:true,
      defaultsTo: ''
    },
    position:{
      type: 'integer',
      required: true,
      unique: true
    },
    link:{
      model:'link'
    },
    // Add a reference to User
    owner: {
      model: 'user'
    }
  }
};
