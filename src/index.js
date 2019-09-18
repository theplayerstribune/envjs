const dotenv = require('dotenv');

function copy() {
  return Object.assign({}, ...Array.from(arguments));
}

function exit() {
  process.exit(1);
}

/**
 * A dictionary of environmental variables.
 * @typedef {Object.<string, string>} EnvList
 *
 * @todo Upgrade to a class that implements envjs.LIST_PROTO below.
 */

/**
 * A descriptive environment context that stores the definitions for
 * environmental variables by their source, as well as any errors that
 * have been generated while compiling them.
 * @typedef {Object} EnvContext
 * @property {EnvList} defaults - Default environmental variables that
 *                     are overriden by all other explicity set
 *                     environmental variables.
 * @property {EnvList} constants - Constant environmental variables that
 *                     can not be overriden.
 * @property {EnvList} process - The content of process.env as of the last
 *                     call to clearCtx.
 * @property {EnvList} dotenv - All environmental variables loaded by the
 *                     dotenv module.
 * @property {Object}  errors - A depository for errors generated when
 *                     loading the environment.
 */

/**
 * The memoized environment context that we mutate and share.
 * @type {EnvContext}
 */
const memo = {
  ctx: null,
  emptyCtx: {
    defaults: {},
    dotenv: {},
    process: {},
    constants: {},
    errors: {},
    missValue: null,
  },
};

/**
 * Resets the state of the context.
 * @protected
 */
function clearCtx() {
  memo.ctx = {};
  memo.ctx.defaults = {};
  memo.ctx.dotenv = {};
  memo.ctx.process = {};
  memo.ctx.constants = {};
  memo.ctx.errors = {};
  memo.ctx.missValue = null;
}

function valuesFrom(ctx) {
  return copy(ctx.defaults, ctx.dotenv, ctx.process, ctx.constants);
}

/**
 * The class for all EnvList objects. Allows us to dereference variables
 * by name and control the value that is returned when the variable does not
 * exist.
 *
 * @property {Object} values - A basic object/dict version of the EnvList.
 * @property {*}      missValue - The value returned on a miss when
 *                    calling EnvList.get().
 * @method include(<string>) - Accesses the values dict and returns
 *         whether the given name is in it.
 * @method includes(<string>) – An alias of include().
 * @method get(<string>) - Accesses the values dict and returns the
 *         dereferenced variable, or the missValue if not found.
 * @method setMissValue(<*>) - Sets the missing return value.
 *
 * @example
 *     const envvars = env({ constants: { USERNAME: 'starbuck' } });
 *     envvars.setMissValue('n/a');
 *     envvars.get('USERNAME')
 *     // => 'starbuck'
 *     envvars.get('PASSWORD')
 *     // => 'n/a'
 *     envvars.PASSWORD
 *     // => null
 *
 * @example <caption>You can pass a missing return value on generation:</caption>
 *     const envvars = env({
 *       constants: { USERNAME: 'starbuck' },
 *       missValue: 'n/a',
 *     });
 *     envvars.get('PASSWORD')
 *     // => 'n/a'
 */
class EnvList {
  constructor(missValue = null) {
    this.missValue = missValue;
  }

  include(name) {
    this._staticValues = copy(valuesFrom(memo.ctx));
    return Object.prototype.hasOwnProperty.call(this._staticValues, name);
  }

  includes(name) {
    return this.include(name);
  }

  get(name) {
    if (!this.include(name)) {
      return this.missValue;
    }
    return this._staticValues[name];
  }

  setMissValue(missValue = null) {
    this.missValue = missValue;
  }
}

/**
 * Merge the environmental variables in the context together into a
 * single environmental object. Adds a prototype to the object with a
 * few helper functions.
 * @protected
 */
function generateFromCtx(missValue) {
  const proto = new envjs.EnvList(missValue);
  return Object.assign(Object.create(proto), valuesFrom(memo.ctx));
}

/**
 * Options for calls to generate a new context.
 * @typedef {Object} EnvOptions
 * @property {boolean}  dotenv - Whether or not to run a dotenv config
 *                      load.
 * @property {EnvList}  defaults - A list of default environmental
 *                      variables.
 * @property {EnvList}  constants - A list of constant environmental
 *                      variables.
 * @property {string[]} ensure - A list environmental variable names that
 *                      must exist in the context, or we exit the program.
 * @property {*}        missValue - The value that is returned when we
 *                      call EnvList.get() on a missing value.
 */
const defaultOptions = {
  dotenv: true,
  constants: {},
  defaults: {},
  ensure: [],
  missValue: null,
};

function isObjectLiteral(obj) {
  return typeof obj === 'object' && obj.constructor === Object;
}

function isArrayLiteral(obj) {
  return typeof obj === 'object' && obj.constructor === Array;
}

function validateEnvOptions(options) {
  if (!isObjectLiteral(options)) {
    throw new Error(
      `invalid options: expected object literal, received: ${JSON.stringify(
        options
      )}`
    );
  }
  const whitelistedFields = [
    'dotenv',
    'constants',
    'defaults',
    'ensure',
    'missValue',
  ];
  const invalidFields = [];
  for (const prop in options) {
    if (!whitelistedFields.includes(prop)) {
      invalidFields.push(prop);
    }
  }
  if (invalidFields.length) {
    throw new Error(
      `invalid options: includes invalid fields: ${invalidFields.join(', ')}`
    );
  }

  if (
    options.defaults &&
    (!isObjectLiteral(options.defaults) ||
      !Object.values(options.defaults).every(i => typeof i === 'string'))
  ) {
    throw new Error(
      `invalid option defaults: expected object literal with string keys`
    );
  }

  if (
    options.constants &&
    (!isObjectLiteral(options.constants) ||
      !Object.values(options.constants).every(i => typeof i === 'string'))
  ) {
    throw new Error(
      `invalid option constants: expected object literal with string keys`
    );
  }

  if (
    options.ensure &&
    (!isArrayLiteral(options.ensure) ||
      !options.ensure.every(i => typeof i === 'string'))
  ) {
    throw new Error(
      `invalid option ensure: expected array literal with string items`
    );
  }
  return true;
}

/**
 * Generates a set of environmental variables from the current context,
 * after applying all passed options. If a set of names we want to ensure
 * exist are passed, will apply these after the list is generated.
 * @param {EnvOptions} [options=envjs.defaultOptions]
 * @returns {EnvList} The reset, newly-generated environmental variables.
 */
function envjs(options = {}) {
  return envjs.set(options);
}
envjs.defaultOptions = defaultOptions;
envjs.validateEnvOptions = validateEnvOptions;
envjs.EnvList = EnvList;
envjs._clearCtx = clearCtx;
envjs._generateFromCtx = generateFromCtx;
envjs._emptyCtx = memo.emptyCtx;
envjs._exit = exit;

envjs.set = function(options = {}) {
  envjs.validateEnvOptions(options);
  const opts = copy(envjs.defaultOptions, options);

  memo.ctx.process = copy(memo.ctx.process, process.env);
  memo.ctx.defaults = copy(memo.ctx.defaults, opts.defaults);
  memo.ctx.constants = copy(memo.ctx.constants, opts.constants);

  if (opts.dotenv) {
    envjs.load(); // NOTE: loses control of thread. Race condition.
  }

  const obj = envjs._generateFromCtx(opts.missValue);
  const expected = opts.ensure;
  if (expected.length) {
    envjs.check(expected, Object.keys(obj), {
      logOnMiss: true,
      exitOnMiss: true,
    });
  }
  return obj;
};

/**
 * A basic getter for the internal context "ctx" value.
 * @returns {EnvContext}
 */
envjs.ctx = function() {
  return copy(memo.ctx);
};

/**
 * Clears out the context and regenerates it according to the given
 * options.
 * @param {EnvOptions} [options=envjs.defaultOptions]
 * @returns {EnvList} The reset, newly-generated environmental variables.
 */
envjs.reset = function(opts) {
  envjs._clearCtx();
  return envjs.set(opts);
};

/**
 * Ensures that some variable or set of variables are defined in the
 * current context. Allows a list of defined variables to be passed, as
 * well as options that define what happens when there is a missing
 * variable. By default a miss will exit the process with an exit value
 * of 1.
 * @param {string[]} [expected=[]] - The list of variable names we expect
 *                   to have been defined.
 * @param {string[]} actual - If passed, this is the list of defined
 *                   variable names we check against (instead of those
 *                   defined in the current context).
 * @param {Object}   opts - Options.
 * @param {boolean}  [opts.silent=false] - Whether or not to log missing
 *                   variable names.
 * @param {boolean}  [opts.exitOnMiss=true] - Whether or not to exit the
 *                   process if any names are missing.
 * @returns {boolean} True if all the expected variables are defined,
 *                    false otherwise. Only runs if true or if the
 *                    exitOnMiss option is set to false.
 *
 * @todo Add an option to throwOnMiss, that collects the error messages
 *       and then throws an error at the end of the function.
 */
envjs.check = function(
  expected = [],
  actual = [],
  opts = {
    logOnMiss: false,
    exitOnMiss: false,
    throwOnMiss: false,
  }
) {
  if (!isArrayLiteral(expected) || !isArrayLiteral(actual)) {
    throw new Error('invalid values to check');
  }

  const missing = [];
  expected.forEach(v => {
    if (!actual.includes(v)) {
      missing.push(v);
    }
  });

  if (missing.length !== 0 && opts.logOnMiss) {
    console.error(
      missing.map(v => `[ERR] missing required env var {${v}}`).join('\n')
    );
  }

  if (missing.length !== 0 && opts.throwOnMiss) {
    throw new Error(`missing required env vars: ${missing.join(', ')}`);
  }

  if (missing.length !== 0 && opts.exitOnMiss) {
    envjs._exit();
  }

  return missing.length === 0;
};

envjs.ensure = function(expected) {
  return envjs.check(expected, Object.keys(valuesFrom(memo.ctx)), {
    throwOnMiss: true,
  });
};

/**
 * @typedef {Object} DotenvResult
 * @property {EnvList} dotenv - The list of environmental variables
 *                     loaded, if any, from the .env file.
 * @property {Error}   error - Any error (usually, missing .env file)
 *                     generated by running dotenv.config().
 */

/**
 * Loads variables from a .env file. Uses the standard modulen "dotenv",
 * but keeps the process.env free of the variables that are loaded,
 * adding them to the internal ctx.dotenv list. Any errors that are
 * generated are added to ctx.errors.dotenv (currently the only source
 * of errors in the context).
 * @returns {DotenvResult}
 */
envjs.load = function() {
  // Ensure we have a copy of the current process.env, then run dotenv.
  const oprocessenv = copy(process.env);
  const { parsed, error } = dotenv.config();

  // Restore the clean, pre-dotenv process.env
  process.env = oprocessenv;

  // Merge parsed and errors into the context.
  memo.ctx.dotenv = copy(memo.ctx.dotenv, parsed);
  if (error) {
    memo.ctx.errors = copy(memo.ctx.errors, { dotenv: { error } });
  }

  return { dotenv: parsed, error };
};

// Load the current state of process.envjs.
envjs._clearCtx();

module.exports = envjs;
