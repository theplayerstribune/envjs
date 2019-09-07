(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('fs'), require('path')) :
  typeof define === 'function' && define.amd ? define(['fs', 'path'], factory) :
  (global = global || self, global.envjs = factory(global.fs, global.path));
}(this, function (fs, path) { 'use strict';

  fs = fs && fs.hasOwnProperty('default') ? fs['default'] : fs;
  path = path && path.hasOwnProperty('default') ? path['default'] : path;

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(source, true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(source).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  /* @flow */
  /*::

  type DotenvParseOptions = {
    debug?: boolean
  }

  // keys and values from src
  type DotenvParseOutput = { [string]: string }

  type DotenvConfigOptions = {
    path?: string, // path to .env file
    encoding?: string, // encoding of .env file
    debug?: string // turn on logging for debugging purposes
  }

  type DotenvConfigOutput = {
    parsed?: DotenvParseOutput,
    error?: Error
  }

  */




  function log (message /*: string */) {
    console.log(`[dotenv][DEBUG] ${message}`);
  }

  const NEWLINE = '\n';
  const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
  const RE_NEWLINES = /\\n/g;
  const NEWLINES_MATCH = /\n|\r|\r\n/;

  // Parses src into an Object
  function parse (src /*: string | Buffer */, options /*: ?DotenvParseOptions */) /*: DotenvParseOutput */ {
    const debug = Boolean(options && options.debug);
    const obj = {};

    // convert Buffers before splitting into lines and processing
    src.toString().split(NEWLINES_MATCH).forEach(function (line, idx) {
      // matching "KEY' and 'VAL' in 'KEY=VAL'
      const keyValueArr = line.match(RE_INI_KEY_VAL);
      // matched?
      if (keyValueArr != null) {
        const key = keyValueArr[1];
        // default undefined or missing values to empty string
        let val = (keyValueArr[2] || '');
        const end = val.length - 1;
        const isDoubleQuoted = val[0] === '"' && val[end] === '"';
        const isSingleQuoted = val[0] === "'" && val[end] === "'";

        // if single or double quoted, remove quotes
        if (isSingleQuoted || isDoubleQuoted) {
          val = val.substring(1, end);

          // if double quoted, expand newlines
          if (isDoubleQuoted) {
            val = val.replace(RE_NEWLINES, NEWLINE);
          }
        } else {
          // remove surrounding whitespace
          val = val.trim();
        }

        obj[key] = val;
      } else if (debug) {
        log(`did not match key and value when parsing line ${idx + 1}: ${line}`);
      }
    });

    return obj
  }

  // Populates process.env from .env file
  function config (options /*: ?DotenvConfigOptions */) /*: DotenvConfigOutput */ {
    let dotenvPath = path.resolve(process.cwd(), '.env');
    let encoding /*: string */ = 'utf8';
    let debug = false;

    if (options) {
      if (options.path != null) {
        dotenvPath = options.path;
      }
      if (options.encoding != null) {
        encoding = options.encoding;
      }
      if (options.debug != null) {
        debug = true;
      }
    }

    try {
      // specifying an encoding returns a string instead of a buffer
      const parsed = parse(fs.readFileSync(dotenvPath, { encoding }), { debug });

      Object.keys(parsed).forEach(function (key) {
        if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
          process.env[key] = parsed[key];
        } else if (debug) {
          log(`"${key}" is already defined in \`process.env\` and will not be overwritten`);
        }
      });

      return { parsed }
    } catch (e) {
      return { error: e }
    }
  }

  var config_1 = config;
  var parse_1 = parse;

  var main = {
  	config: config_1,
  	parse: parse_1
  };

  /**
   * A dictionary of environmental variables.
   * @typedef {Object.<string, string>} EnvList
   *
   * @todo Upgrade to a class that implements env.LIST_PROTO below.
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
   *                     call to _resetCtx.
   * @property {EnvList} dotenv - All environmental variables loaded by the
   *                     dotenv module.
   * @property {Object}  errors - A depository for errors generated when
   *                     loading the environment.
   */

  /**
   * The memoized environment context that we mutate and share.
   * @type {EnvContext}
   */

  var ctx = {
    defaults: {},
    constants: {},
    process: {},
    dotenv: {},
    errors: {}
  };
  /**
   * Generates a set of environmental variables from the current context,
   * after applying all passed options. If a set of names we want to ensure
   * exist are passed, will apply these after the list is generated.
   * @param {EnvOptions} [options=env.DEFAULT_OPTS]
   * @returns {EnvList} The reset, newly-generated environmental variables.
   */

  function env() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var opts = Object.assign(env.DEFAULT_OPTS, options);
    env.defaults(opts.defaults);
    env.constants(opts.constants);

    if (opts.dotenv) {
      env.dotenv();
    }

    var obj = env._generateFromCtx();

    obj.missingReturnValue(opts.missingReturnValue);

    if (Array.isArray(opts.ensure) && opts.ensure.length) {
      env.ensure(opts.ensure, Object.keys(obj));
    }

    return obj;
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
   * @property {*}        missingReturnValue - The value that is returned
   *                      when we call EnvList.get() on a missing value.
   */

  /**
   * The default options passed to calls that generate a new context.
   * @type {EnvOptions}
   * @constant
   * @default
   */


  env.DEFAULT_OPTS = {
    dotenv: true,
    constants: {},
    defaults: {},
    ensure: [],
    missingReturnValue: undefined
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

  env.dotenv = function () {
    // Ensure we have a copy of the current process.env, then run dotenv.
    ctx.process = Object.assign({}, process.env);

    var _dotenv$config = main.config(),
        parsed = _dotenv$config.parsed,
        error = _dotenv$config.error; // Identify what vars (if any) were appended by dotenv, and add to ctx.


    if (parsed) {
      Object.keys(parsed).forEach(function (prop) {
        if (!Object.prototype.hasOwnProperty.call(ctx.process, prop)) {
          ctx.dotenv[prop] = parsed[prop];
        }
      });
    } // Attach any errors


    if (error) {
      ctx.errors = Object.assign(ctx.errors, {
        dotenv: {
          error: error
        }
      });
    } // Restore the clean, pre-dotenv process.env


    process.env = ctx.process;
    return {
      dotenv: ctx.dotenv,
      error: error
    };
  };
  /**
   * Set the context's default environmental variables.
   * @param {EnvList} defaults - The new default environmental variables to
   *                  add/update.
   * @return {EnvList} The updated, complete list of default environmental
   *                   variables.
   */


  env.defaults = function () {
    var defaults = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    ctx.defaults = Object.assign(ctx.defaults, defaults);
    return ctx.defaults;
  };
  /**
   * Set the context's constant environmental variables.
   * @param {EnvList} constants - The new constant environmental variables
   *                  to add/update.
   * @return {EnvList} The updated, complete list of constant environmental
   *                   variables.
   */


  env.constants = function () {
    var constants = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    ctx.constants = Object.assign(ctx.constants, constants);
    return ctx.constants;
  };
  /**
   * Clears out the context and regenerates it according to the given
   * options.
   * @param {EnvOptions} [options=env.DEFAULT_OPTS]
   * @returns {EnvList} The reset, newly-generated environmental variables.
   */


  env.reset = function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var opts = Object.assign(env.DEFAULT_OPTS, options);

    env._resetCtx();

    return env(opts);
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


  env.ensure = function () {
    var expected = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var actual = arguments.length > 1 ? arguments[1] : undefined;
    var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
      silent: false,
      exitOnMiss: true
    };

    if (typeof actual === 'undefined') {
      actual = Object.keys(env._generateFromCtx());
    }

    var missing = false;
    expected.forEach(function (variable) {
      if (!actual.includes(variable)) {
        if (!opts.silent) {
          console.error("[ERR] missing required env var {".concat(variable, "}"));
        }

        missing = true;
      }
    });

    if (missing && opts.exitOnMiss) {
      process.exit(1);
    }

    return !missing;
  };
  /**
   * A thin wrapper around env.ensure() that silences output and forces a
   * return value.
   * @param {string[]} [expected=[]] - The list of variable names we expect
   *                   to have been defined.
   * @returns {boolean} True if all the expected variables are defined,
   *                    false otherwise.
   */


  env.check = function () {
    var expected = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    return env.ensure(expected, undefined, {
      silent: true,
      exitOnMiss: false
    });
  };
  /**
   * A basic getter for the internal context "ctx" value.
   * @returns {EnvContext}
   */


  env.ctx = function () {
    return ctx;
  };
  /**
   * Resets the state of the context.
   * @protected
   */


  env._resetCtx = function () {
    ctx.defaults = {};
    ctx.constants = {};
    ctx.dotenv = {};
    ctx.process = Object.assign({}, process.env);
    ctx.errors = {};
  };
  /**
   * The prototype for all EnvList objects. Allows us to dereference variables
   * by name and control the value that is returned when the variable does not
   * exist.
   * @constant
   * @property {Object} _values - A basic object/dict version of the EnvList.
   * @property {*}      _missValue - The value returned on a miss when
   *                    calling EnvList.get().
   * @method missingReturnValue(<*>) - Sets the missing return value.
   * @method get(<string>) - Accesses the values dict (essentially a copy
   *         of the EnvList) and returns the dereferenced variable, or the
   *         _missValue if not found.
   *
   * @todo Turn this into a class definition for EnvList (replace typedef
   *       above).
   *
   * @example
   *     const envvars = env({ constants: { USERNAME: 'starbuck' } });
   *     envvars.missingReturnValue('n/a');
   *     envvars.get('USERNAME')
   *     // => 'starbuck'
   *     envvars.get('PASSWORD')
   *     // => 'n/a'
   *     envvars.PASSWORD
   *     // => undefined
   *
   * @example <caption>You can pass a missing return value on generation:</caption>
   *     const envvars = env({
   *       constants: { USERNAME: 'starbuck' },
   *       missingReturnValue: 'n/a',
   *     });
   *     envvars.get('PASSWORD')
   *     // => 'n/a'
   */


  env.LIST_PROTO = {
    _values: {},
    _missValue: undefined,
    get: function get(name) {
      if (!Object.prototype.hasOwnProperty.call(this._values, name)) {
        return this._missValue;
      }

      return this._values[name];
    },
    missingReturnValue: function missingReturnValue() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      this._missValue = value;
    }
  };
  /**
   * Merge the environmental variables in the context together into a
   * single environmental object. Adds a prototype to the object with a
   * few helper functions (TODO).
   * @protected
   */

  env._generateFromCtx = function () {
    var values = Object.assign({}, ctx.defaults, ctx.dotenv, ctx.process, ctx.constants);

    var proto = _objectSpread2({}, env.LIST_PROTO, {
      _values: values
    });

    return Object.assign(Object.create(proto), values);
  }; // Load the current state of process.env.


  env._resetCtx();

  var src = env;

  return src;

}));
