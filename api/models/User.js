var User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {
    username  : { type: 'string', unique: true },
    email     : { type: 'email',  unique: true },
    passports : { collection: 'Passport', via: 'user' },
    preferences: {
      collection: 'preference',
      via: 'fans',
      dominant:true
    }
  }
};

module.exports = User;
