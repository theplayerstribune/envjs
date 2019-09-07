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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJub2RlX21vZHVsZXMvZG90ZW52L2xpYi9tYWluLmpzIiwic3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG4vKjo6XG5cbnR5cGUgRG90ZW52UGFyc2VPcHRpb25zID0ge1xuICBkZWJ1Zz86IGJvb2xlYW5cbn1cblxuLy8ga2V5cyBhbmQgdmFsdWVzIGZyb20gc3JjXG50eXBlIERvdGVudlBhcnNlT3V0cHV0ID0geyBbc3RyaW5nXTogc3RyaW5nIH1cblxudHlwZSBEb3RlbnZDb25maWdPcHRpb25zID0ge1xuICBwYXRoPzogc3RyaW5nLCAvLyBwYXRoIHRvIC5lbnYgZmlsZVxuICBlbmNvZGluZz86IHN0cmluZywgLy8gZW5jb2Rpbmcgb2YgLmVudiBmaWxlXG4gIGRlYnVnPzogc3RyaW5nIC8vIHR1cm4gb24gbG9nZ2luZyBmb3IgZGVidWdnaW5nIHB1cnBvc2VzXG59XG5cbnR5cGUgRG90ZW52Q29uZmlnT3V0cHV0ID0ge1xuICBwYXJzZWQ/OiBEb3RlbnZQYXJzZU91dHB1dCxcbiAgZXJyb3I/OiBFcnJvclxufVxuXG4qL1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcblxuZnVuY3Rpb24gbG9nIChtZXNzYWdlIC8qOiBzdHJpbmcgKi8pIHtcbiAgY29uc29sZS5sb2coYFtkb3RlbnZdW0RFQlVHXSAke21lc3NhZ2V9YClcbn1cblxuY29uc3QgTkVXTElORSA9ICdcXG4nXG5jb25zdCBSRV9JTklfS0VZX1ZBTCA9IC9eXFxzKihbXFx3Li1dKylcXHMqPVxccyooLiopP1xccyokL1xuY29uc3QgUkVfTkVXTElORVMgPSAvXFxcXG4vZ1xuY29uc3QgTkVXTElORVNfTUFUQ0ggPSAvXFxufFxccnxcXHJcXG4vXG5cbi8vIFBhcnNlcyBzcmMgaW50byBhbiBPYmplY3RcbmZ1bmN0aW9uIHBhcnNlIChzcmMgLyo6IHN0cmluZyB8IEJ1ZmZlciAqLywgb3B0aW9ucyAvKjogP0RvdGVudlBhcnNlT3B0aW9ucyAqLykgLyo6IERvdGVudlBhcnNlT3V0cHV0ICovIHtcbiAgY29uc3QgZGVidWcgPSBCb29sZWFuKG9wdGlvbnMgJiYgb3B0aW9ucy5kZWJ1ZylcbiAgY29uc3Qgb2JqID0ge31cblxuICAvLyBjb252ZXJ0IEJ1ZmZlcnMgYmVmb3JlIHNwbGl0dGluZyBpbnRvIGxpbmVzIGFuZCBwcm9jZXNzaW5nXG4gIHNyYy50b1N0cmluZygpLnNwbGl0KE5FV0xJTkVTX01BVENIKS5mb3JFYWNoKGZ1bmN0aW9uIChsaW5lLCBpZHgpIHtcbiAgICAvLyBtYXRjaGluZyBcIktFWScgYW5kICdWQUwnIGluICdLRVk9VkFMJ1xuICAgIGNvbnN0IGtleVZhbHVlQXJyID0gbGluZS5tYXRjaChSRV9JTklfS0VZX1ZBTClcbiAgICAvLyBtYXRjaGVkP1xuICAgIGlmIChrZXlWYWx1ZUFyciAhPSBudWxsKSB7XG4gICAgICBjb25zdCBrZXkgPSBrZXlWYWx1ZUFyclsxXVxuICAgICAgLy8gZGVmYXVsdCB1bmRlZmluZWQgb3IgbWlzc2luZyB2YWx1ZXMgdG8gZW1wdHkgc3RyaW5nXG4gICAgICBsZXQgdmFsID0gKGtleVZhbHVlQXJyWzJdIHx8ICcnKVxuICAgICAgY29uc3QgZW5kID0gdmFsLmxlbmd0aCAtIDFcbiAgICAgIGNvbnN0IGlzRG91YmxlUXVvdGVkID0gdmFsWzBdID09PSAnXCInICYmIHZhbFtlbmRdID09PSAnXCInXG4gICAgICBjb25zdCBpc1NpbmdsZVF1b3RlZCA9IHZhbFswXSA9PT0gXCInXCIgJiYgdmFsW2VuZF0gPT09IFwiJ1wiXG5cbiAgICAgIC8vIGlmIHNpbmdsZSBvciBkb3VibGUgcXVvdGVkLCByZW1vdmUgcXVvdGVzXG4gICAgICBpZiAoaXNTaW5nbGVRdW90ZWQgfHwgaXNEb3VibGVRdW90ZWQpIHtcbiAgICAgICAgdmFsID0gdmFsLnN1YnN0cmluZygxLCBlbmQpXG5cbiAgICAgICAgLy8gaWYgZG91YmxlIHF1b3RlZCwgZXhwYW5kIG5ld2xpbmVzXG4gICAgICAgIGlmIChpc0RvdWJsZVF1b3RlZCkge1xuICAgICAgICAgIHZhbCA9IHZhbC5yZXBsYWNlKFJFX05FV0xJTkVTLCBORVdMSU5FKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZW1vdmUgc3Vycm91bmRpbmcgd2hpdGVzcGFjZVxuICAgICAgICB2YWwgPSB2YWwudHJpbSgpXG4gICAgICB9XG5cbiAgICAgIG9ialtrZXldID0gdmFsXG4gICAgfSBlbHNlIGlmIChkZWJ1Zykge1xuICAgICAgbG9nKGBkaWQgbm90IG1hdGNoIGtleSBhbmQgdmFsdWUgd2hlbiBwYXJzaW5nIGxpbmUgJHtpZHggKyAxfTogJHtsaW5lfWApXG4gICAgfVxuICB9KVxuXG4gIHJldHVybiBvYmpcbn1cblxuLy8gUG9wdWxhdGVzIHByb2Nlc3MuZW52IGZyb20gLmVudiBmaWxlXG5mdW5jdGlvbiBjb25maWcgKG9wdGlvbnMgLyo6ID9Eb3RlbnZDb25maWdPcHRpb25zICovKSAvKjogRG90ZW52Q29uZmlnT3V0cHV0ICovIHtcbiAgbGV0IGRvdGVudlBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJy5lbnYnKVxuICBsZXQgZW5jb2RpbmcgLyo6IHN0cmluZyAqLyA9ICd1dGY4J1xuICBsZXQgZGVidWcgPSBmYWxzZVxuXG4gIGlmIChvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMucGF0aCAhPSBudWxsKSB7XG4gICAgICBkb3RlbnZQYXRoID0gb3B0aW9ucy5wYXRoXG4gICAgfVxuICAgIGlmIChvcHRpb25zLmVuY29kaW5nICE9IG51bGwpIHtcbiAgICAgIGVuY29kaW5nID0gb3B0aW9ucy5lbmNvZGluZ1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5kZWJ1ZyAhPSBudWxsKSB7XG4gICAgICBkZWJ1ZyA9IHRydWVcbiAgICB9XG4gIH1cblxuICB0cnkge1xuICAgIC8vIHNwZWNpZnlpbmcgYW4gZW5jb2RpbmcgcmV0dXJucyBhIHN0cmluZyBpbnN0ZWFkIG9mIGEgYnVmZmVyXG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2UoZnMucmVhZEZpbGVTeW5jKGRvdGVudlBhdGgsIHsgZW5jb2RpbmcgfSksIHsgZGVidWcgfSlcblxuICAgIE9iamVjdC5rZXlzKHBhcnNlZCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChwcm9jZXNzLmVudiwga2V5KSkge1xuICAgICAgICBwcm9jZXNzLmVudltrZXldID0gcGFyc2VkW2tleV1cbiAgICAgIH0gZWxzZSBpZiAoZGVidWcpIHtcbiAgICAgICAgbG9nKGBcIiR7a2V5fVwiIGlzIGFscmVhZHkgZGVmaW5lZCBpbiBcXGBwcm9jZXNzLmVudlxcYCBhbmQgd2lsbCBub3QgYmUgb3ZlcndyaXR0ZW5gKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4geyBwYXJzZWQgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHsgZXJyb3I6IGUgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmNvbmZpZyA9IGNvbmZpZ1xubW9kdWxlLmV4cG9ydHMucGFyc2UgPSBwYXJzZVxuIiwiY29uc3QgZG90ZW52ID0gcmVxdWlyZSgnZG90ZW52Jyk7XG5cbi8qKlxuICogQSBkaWN0aW9uYXJ5IG9mIGVudmlyb25tZW50YWwgdmFyaWFibGVzLlxuICogQHR5cGVkZWYge09iamVjdC48c3RyaW5nLCBzdHJpbmc+fSBFbnZMaXN0XG4gKlxuICogQHRvZG8gVXBncmFkZSB0byBhIGNsYXNzIHRoYXQgaW1wbGVtZW50cyBlbnYuTElTVF9QUk9UTyBiZWxvdy5cbiAqL1xuXG4vKipcbiAqIEEgZGVzY3JpcHRpdmUgZW52aXJvbm1lbnQgY29udGV4dCB0aGF0IHN0b3JlcyB0aGUgZGVmaW5pdGlvbnMgZm9yXG4gKiBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcyBieSB0aGVpciBzb3VyY2UsIGFzIHdlbGwgYXMgYW55IGVycm9ycyB0aGF0XG4gKiBoYXZlIGJlZW4gZ2VuZXJhdGVkIHdoaWxlIGNvbXBpbGluZyB0aGVtLlxuICogQHR5cGVkZWYge09iamVjdH0gRW52Q29udGV4dFxuICogQHByb3BlcnR5IHtFbnZMaXN0fSBkZWZhdWx0cyAtIERlZmF1bHQgZW52aXJvbm1lbnRhbCB2YXJpYWJsZXMgdGhhdFxuICogICAgICAgICAgICAgICAgICAgICBhcmUgb3ZlcnJpZGVuIGJ5IGFsbCBvdGhlciBleHBsaWNpdHkgc2V0XG4gKiAgICAgICAgICAgICAgICAgICAgIGVudmlyb25tZW50YWwgdmFyaWFibGVzLlxuICogQHByb3BlcnR5IHtFbnZMaXN0fSBjb25zdGFudHMgLSBDb25zdGFudCBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcyB0aGF0XG4gKiAgICAgICAgICAgICAgICAgICAgIGNhbiBub3QgYmUgb3ZlcnJpZGVuLlxuICogQHByb3BlcnR5IHtFbnZMaXN0fSBwcm9jZXNzIC0gVGhlIGNvbnRlbnQgb2YgcHJvY2Vzcy5lbnYgYXMgb2YgdGhlIGxhc3RcbiAqICAgICAgICAgICAgICAgICAgICAgY2FsbCB0byBfcmVzZXRDdHguXG4gKiBAcHJvcGVydHkge0Vudkxpc3R9IGRvdGVudiAtIEFsbCBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcyBsb2FkZWQgYnkgdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgIGRvdGVudiBtb2R1bGUuXG4gKiBAcHJvcGVydHkge09iamVjdH0gIGVycm9ycyAtIEEgZGVwb3NpdG9yeSBmb3IgZXJyb3JzIGdlbmVyYXRlZCB3aGVuXG4gKiAgICAgICAgICAgICAgICAgICAgIGxvYWRpbmcgdGhlIGVudmlyb25tZW50LlxuICovXG5cbi8qKlxuICogVGhlIG1lbW9pemVkIGVudmlyb25tZW50IGNvbnRleHQgdGhhdCB3ZSBtdXRhdGUgYW5kIHNoYXJlLlxuICogQHR5cGUge0VudkNvbnRleHR9XG4gKi9cbmNvbnN0IGN0eCA9IHtcbiAgZGVmYXVsdHM6IHt9LFxuICBjb25zdGFudHM6IHt9LFxuICBwcm9jZXNzOiB7fSxcbiAgZG90ZW52OiB7fSxcbiAgZXJyb3JzOiB7fSxcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgc2V0IG9mIGVudmlyb25tZW50YWwgdmFyaWFibGVzIGZyb20gdGhlIGN1cnJlbnQgY29udGV4dCxcbiAqIGFmdGVyIGFwcGx5aW5nIGFsbCBwYXNzZWQgb3B0aW9ucy4gSWYgYSBzZXQgb2YgbmFtZXMgd2Ugd2FudCB0byBlbnN1cmVcbiAqIGV4aXN0IGFyZSBwYXNzZWQsIHdpbGwgYXBwbHkgdGhlc2UgYWZ0ZXIgdGhlIGxpc3QgaXMgZ2VuZXJhdGVkLlxuICogQHBhcmFtIHtFbnZPcHRpb25zfSBbb3B0aW9ucz1lbnYuREVGQVVMVF9PUFRTXVxuICogQHJldHVybnMge0Vudkxpc3R9IFRoZSByZXNldCwgbmV3bHktZ2VuZXJhdGVkIGVudmlyb25tZW50YWwgdmFyaWFibGVzLlxuICovXG5mdW5jdGlvbiBlbnYob3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IG9wdHMgPSBPYmplY3QuYXNzaWduKGVudi5ERUZBVUxUX09QVFMsIG9wdGlvbnMpO1xuICBlbnYuZGVmYXVsdHMob3B0cy5kZWZhdWx0cyk7XG4gIGVudi5jb25zdGFudHMob3B0cy5jb25zdGFudHMpO1xuICBpZiAob3B0cy5kb3RlbnYpIHtcbiAgICBlbnYuZG90ZW52KCk7XG4gIH1cbiAgY29uc3Qgb2JqID0gZW52Ll9nZW5lcmF0ZUZyb21DdHgoKTtcbiAgb2JqLm1pc3NpbmdSZXR1cm5WYWx1ZShvcHRzLm1pc3NpbmdSZXR1cm5WYWx1ZSk7XG4gIGlmIChBcnJheS5pc0FycmF5KG9wdHMuZW5zdXJlKSAmJiBvcHRzLmVuc3VyZS5sZW5ndGgpIHtcbiAgICBlbnYuZW5zdXJlKG9wdHMuZW5zdXJlLCBPYmplY3Qua2V5cyhvYmopKTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIE9wdGlvbnMgZm9yIGNhbGxzIHRvIGdlbmVyYXRlIGEgbmV3IGNvbnRleHQuXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBFbnZPcHRpb25zXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59ICBkb3RlbnYgLSBXaGV0aGVyIG9yIG5vdCB0byBydW4gYSBkb3RlbnYgY29uZmlnXG4gKiAgICAgICAgICAgICAgICAgICAgICBsb2FkLlxuICogQHByb3BlcnR5IHtFbnZMaXN0fSAgZGVmYXVsdHMgLSBBIGxpc3Qgb2YgZGVmYXVsdCBlbnZpcm9ubWVudGFsXG4gKiAgICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZXMuXG4gKiBAcHJvcGVydHkge0Vudkxpc3R9ICBjb25zdGFudHMgLSBBIGxpc3Qgb2YgY29uc3RhbnQgZW52aXJvbm1lbnRhbFxuICogICAgICAgICAgICAgICAgICAgICAgdmFyaWFibGVzLlxuICogQHByb3BlcnR5IHtzdHJpbmdbXX0gZW5zdXJlIC0gQSBsaXN0IGVudmlyb25tZW50YWwgdmFyaWFibGUgbmFtZXMgdGhhdFxuICogICAgICAgICAgICAgICAgICAgICAgbXVzdCBleGlzdCBpbiB0aGUgY29udGV4dCwgb3Igd2UgZXhpdCB0aGUgcHJvZ3JhbS5cbiAqIEBwcm9wZXJ0eSB7Kn0gICAgICAgIG1pc3NpbmdSZXR1cm5WYWx1ZSAtIFRoZSB2YWx1ZSB0aGF0IGlzIHJldHVybmVkXG4gKiAgICAgICAgICAgICAgICAgICAgICB3aGVuIHdlIGNhbGwgRW52TGlzdC5nZXQoKSBvbiBhIG1pc3NpbmcgdmFsdWUuXG4gKi9cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCBvcHRpb25zIHBhc3NlZCB0byBjYWxscyB0aGF0IGdlbmVyYXRlIGEgbmV3IGNvbnRleHQuXG4gKiBAdHlwZSB7RW52T3B0aW9uc31cbiAqIEBjb25zdGFudFxuICogQGRlZmF1bHRcbiAqL1xuZW52LkRFRkFVTFRfT1BUUyA9IHtcbiAgZG90ZW52OiB0cnVlLFxuICBjb25zdGFudHM6IHt9LFxuICBkZWZhdWx0czoge30sXG4gIGVuc3VyZTogW10sXG4gIG1pc3NpbmdSZXR1cm5WYWx1ZTogdW5kZWZpbmVkLFxufTtcblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBEb3RlbnZSZXN1bHRcbiAqIEBwcm9wZXJ0eSB7RW52TGlzdH0gZG90ZW52IC0gVGhlIGxpc3Qgb2YgZW52aXJvbm1lbnRhbCB2YXJpYWJsZXNcbiAqICAgICAgICAgICAgICAgICAgICAgbG9hZGVkLCBpZiBhbnksIGZyb20gdGhlIC5lbnYgZmlsZS5cbiAqIEBwcm9wZXJ0eSB7RXJyb3J9ICAgZXJyb3IgLSBBbnkgZXJyb3IgKHVzdWFsbHksIG1pc3NpbmcgLmVudiBmaWxlKVxuICogICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZWQgYnkgcnVubmluZyBkb3RlbnYuY29uZmlnKCkuXG4gKi9cblxuLyoqXG4gKiBMb2FkcyB2YXJpYWJsZXMgZnJvbSBhIC5lbnYgZmlsZS4gVXNlcyB0aGUgc3RhbmRhcmQgbW9kdWxlbiBcImRvdGVudlwiLFxuICogYnV0IGtlZXBzIHRoZSBwcm9jZXNzLmVudiBmcmVlIG9mIHRoZSB2YXJpYWJsZXMgdGhhdCBhcmUgbG9hZGVkLFxuICogYWRkaW5nIHRoZW0gdG8gdGhlIGludGVybmFsIGN0eC5kb3RlbnYgbGlzdC4gQW55IGVycm9ycyB0aGF0IGFyZVxuICogZ2VuZXJhdGVkIGFyZSBhZGRlZCB0byBjdHguZXJyb3JzLmRvdGVudiAoY3VycmVudGx5IHRoZSBvbmx5IHNvdXJjZVxuICogb2YgZXJyb3JzIGluIHRoZSBjb250ZXh0KS5cbiAqIEByZXR1cm5zIHtEb3RlbnZSZXN1bHR9XG4gKi9cbmVudi5kb3RlbnYgPSBmdW5jdGlvbigpIHtcbiAgLy8gRW5zdXJlIHdlIGhhdmUgYSBjb3B5IG9mIHRoZSBjdXJyZW50IHByb2Nlc3MuZW52LCB0aGVuIHJ1biBkb3RlbnYuXG4gIGN0eC5wcm9jZXNzID0gT2JqZWN0LmFzc2lnbih7fSwgcHJvY2Vzcy5lbnYpO1xuICBjb25zdCB7IHBhcnNlZCwgZXJyb3IgfSA9IGRvdGVudi5jb25maWcoKTtcblxuICAvLyBJZGVudGlmeSB3aGF0IHZhcnMgKGlmIGFueSkgd2VyZSBhcHBlbmRlZCBieSBkb3RlbnYsIGFuZCBhZGQgdG8gY3R4LlxuICBpZiAocGFyc2VkKSB7XG4gICAgT2JqZWN0LmtleXMocGFyc2VkKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY3R4LnByb2Nlc3MsIHByb3ApKSB7XG4gICAgICAgIGN0eC5kb3RlbnZbcHJvcF0gPSBwYXJzZWRbcHJvcF07XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvLyBBdHRhY2ggYW55IGVycm9yc1xuICBpZiAoZXJyb3IpIHtcbiAgICBjdHguZXJyb3JzID0gT2JqZWN0LmFzc2lnbihjdHguZXJyb3JzLCB7IGRvdGVudjogeyBlcnJvciB9IH0pO1xuICB9XG5cbiAgLy8gUmVzdG9yZSB0aGUgY2xlYW4sIHByZS1kb3RlbnYgcHJvY2Vzcy5lbnZcbiAgcHJvY2Vzcy5lbnYgPSBjdHgucHJvY2VzcztcbiAgcmV0dXJuIHsgZG90ZW52OiBjdHguZG90ZW52LCBlcnJvcjogZXJyb3IgfTtcbn07XG5cbi8qKlxuICogU2V0IHRoZSBjb250ZXh0J3MgZGVmYXVsdCBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcy5cbiAqIEBwYXJhbSB7RW52TGlzdH0gZGVmYXVsdHMgLSBUaGUgbmV3IGRlZmF1bHQgZW52aXJvbm1lbnRhbCB2YXJpYWJsZXMgdG9cbiAqICAgICAgICAgICAgICAgICAgYWRkL3VwZGF0ZS5cbiAqIEByZXR1cm4ge0Vudkxpc3R9IFRoZSB1cGRhdGVkLCBjb21wbGV0ZSBsaXN0IG9mIGRlZmF1bHQgZW52aXJvbm1lbnRhbFxuICogICAgICAgICAgICAgICAgICAgdmFyaWFibGVzLlxuICovXG5lbnYuZGVmYXVsdHMgPSBmdW5jdGlvbihkZWZhdWx0cyA9IHt9KSB7XG4gIGN0eC5kZWZhdWx0cyA9IE9iamVjdC5hc3NpZ24oY3R4LmRlZmF1bHRzLCBkZWZhdWx0cyk7XG4gIHJldHVybiBjdHguZGVmYXVsdHM7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgY29udGV4dCdzIGNvbnN0YW50IGVudmlyb25tZW50YWwgdmFyaWFibGVzLlxuICogQHBhcmFtIHtFbnZMaXN0fSBjb25zdGFudHMgLSBUaGUgbmV3IGNvbnN0YW50IGVudmlyb25tZW50YWwgdmFyaWFibGVzXG4gKiAgICAgICAgICAgICAgICAgIHRvIGFkZC91cGRhdGUuXG4gKiBAcmV0dXJuIHtFbnZMaXN0fSBUaGUgdXBkYXRlZCwgY29tcGxldGUgbGlzdCBvZiBjb25zdGFudCBlbnZpcm9ubWVudGFsXG4gKiAgICAgICAgICAgICAgICAgICB2YXJpYWJsZXMuXG4gKi9cbmVudi5jb25zdGFudHMgPSBmdW5jdGlvbihjb25zdGFudHMgPSB7fSkge1xuICBjdHguY29uc3RhbnRzID0gT2JqZWN0LmFzc2lnbihjdHguY29uc3RhbnRzLCBjb25zdGFudHMpO1xuICByZXR1cm4gY3R4LmNvbnN0YW50cztcbn07XG5cbi8qKlxuICogQ2xlYXJzIG91dCB0aGUgY29udGV4dCBhbmQgcmVnZW5lcmF0ZXMgaXQgYWNjb3JkaW5nIHRvIHRoZSBnaXZlblxuICogb3B0aW9ucy5cbiAqIEBwYXJhbSB7RW52T3B0aW9uc30gW29wdGlvbnM9ZW52LkRFRkFVTFRfT1BUU11cbiAqIEByZXR1cm5zIHtFbnZMaXN0fSBUaGUgcmVzZXQsIG5ld2x5LWdlbmVyYXRlZCBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcy5cbiAqL1xuZW52LnJlc2V0ID0gZnVuY3Rpb24ob3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IG9wdHMgPSBPYmplY3QuYXNzaWduKGVudi5ERUZBVUxUX09QVFMsIG9wdGlvbnMpO1xuICBlbnYuX3Jlc2V0Q3R4KCk7XG4gIHJldHVybiBlbnYob3B0cyk7XG59O1xuXG4vKipcbiAqIEVuc3VyZXMgdGhhdCBzb21lIHZhcmlhYmxlIG9yIHNldCBvZiB2YXJpYWJsZXMgYXJlIGRlZmluZWQgaW4gdGhlXG4gKiBjdXJyZW50IGNvbnRleHQuIEFsbG93cyBhIGxpc3Qgb2YgZGVmaW5lZCB2YXJpYWJsZXMgdG8gYmUgcGFzc2VkLCBhc1xuICogd2VsbCBhcyBvcHRpb25zIHRoYXQgZGVmaW5lIHdoYXQgaGFwcGVucyB3aGVuIHRoZXJlIGlzIGEgbWlzc2luZ1xuICogdmFyaWFibGUuIEJ5IGRlZmF1bHQgYSBtaXNzIHdpbGwgZXhpdCB0aGUgcHJvY2VzcyB3aXRoIGFuIGV4aXQgdmFsdWVcbiAqIG9mIDEuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBbZXhwZWN0ZWQ9W11dIC0gVGhlIGxpc3Qgb2YgdmFyaWFibGUgbmFtZXMgd2UgZXhwZWN0XG4gKiAgICAgICAgICAgICAgICAgICB0byBoYXZlIGJlZW4gZGVmaW5lZC5cbiAqIEBwYXJhbSB7c3RyaW5nW119IGFjdHVhbCAtIElmIHBhc3NlZCwgdGhpcyBpcyB0aGUgbGlzdCBvZiBkZWZpbmVkXG4gKiAgICAgICAgICAgICAgICAgICB2YXJpYWJsZSBuYW1lcyB3ZSBjaGVjayBhZ2FpbnN0IChpbnN0ZWFkIG9mIHRob3NlXG4gKiAgICAgICAgICAgICAgICAgICBkZWZpbmVkIGluIHRoZSBjdXJyZW50IGNvbnRleHQpLlxuICogQHBhcmFtIHtPYmplY3R9ICAgb3B0cyAtIE9wdGlvbnMuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICBbb3B0cy5zaWxlbnQ9ZmFsc2VdIC0gV2hldGhlciBvciBub3QgdG8gbG9nIG1pc3NpbmdcbiAqICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlIG5hbWVzLlxuICogQHBhcmFtIHtib29sZWFufSAgW29wdHMuZXhpdE9uTWlzcz10cnVlXSAtIFdoZXRoZXIgb3Igbm90IHRvIGV4aXQgdGhlXG4gKiAgICAgICAgICAgICAgICAgICBwcm9jZXNzIGlmIGFueSBuYW1lcyBhcmUgbWlzc2luZy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIGFsbCB0aGUgZXhwZWN0ZWQgdmFyaWFibGVzIGFyZSBkZWZpbmVkLFxuICogICAgICAgICAgICAgICAgICAgIGZhbHNlIG90aGVyd2lzZS4gT25seSBydW5zIGlmIHRydWUgb3IgaWYgdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgZXhpdE9uTWlzcyBvcHRpb24gaXMgc2V0IHRvIGZhbHNlLlxuICpcbiAqIEB0b2RvIEFkZCBhbiBvcHRpb24gdG8gdGhyb3dPbk1pc3MsIHRoYXQgY29sbGVjdHMgdGhlIGVycm9yIG1lc3NhZ2VzXG4gKiAgICAgICBhbmQgdGhlbiB0aHJvd3MgYW4gZXJyb3IgYXQgdGhlIGVuZCBvZiB0aGUgZnVuY3Rpb24uXG4gKi9cbmVudi5lbnN1cmUgPSBmdW5jdGlvbihcbiAgZXhwZWN0ZWQgPSBbXSxcbiAgYWN0dWFsLFxuICBvcHRzID0geyBzaWxlbnQ6IGZhbHNlLCBleGl0T25NaXNzOiB0cnVlIH1cbikge1xuICBpZiAodHlwZW9mIGFjdHVhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBhY3R1YWwgPSBPYmplY3Qua2V5cyhlbnYuX2dlbmVyYXRlRnJvbUN0eCgpKTtcbiAgfVxuXG4gIGxldCBtaXNzaW5nID0gZmFsc2U7XG4gIGV4cGVjdGVkLmZvckVhY2godmFyaWFibGUgPT4ge1xuICAgIGlmICghYWN0dWFsLmluY2x1ZGVzKHZhcmlhYmxlKSkge1xuICAgICAgaWYgKCFvcHRzLnNpbGVudCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbRVJSXSBtaXNzaW5nIHJlcXVpcmVkIGVudiB2YXIgeyR7dmFyaWFibGV9fWApO1xuICAgICAgfVxuICAgICAgbWlzc2luZyA9IHRydWU7XG4gICAgfVxuICB9KTtcblxuICBpZiAobWlzc2luZyAmJiBvcHRzLmV4aXRPbk1pc3MpIHtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICByZXR1cm4gIW1pc3Npbmc7XG59O1xuXG4vKipcbiAqIEEgdGhpbiB3cmFwcGVyIGFyb3VuZCBlbnYuZW5zdXJlKCkgdGhhdCBzaWxlbmNlcyBvdXRwdXQgYW5kIGZvcmNlcyBhXG4gKiByZXR1cm4gdmFsdWUuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBbZXhwZWN0ZWQ9W11dIC0gVGhlIGxpc3Qgb2YgdmFyaWFibGUgbmFtZXMgd2UgZXhwZWN0XG4gKiAgICAgICAgICAgICAgICAgICB0byBoYXZlIGJlZW4gZGVmaW5lZC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIGFsbCB0aGUgZXhwZWN0ZWQgdmFyaWFibGVzIGFyZSBkZWZpbmVkLFxuICogICAgICAgICAgICAgICAgICAgIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZW52LmNoZWNrID0gZnVuY3Rpb24oZXhwZWN0ZWQgPSBbXSkge1xuICByZXR1cm4gZW52LmVuc3VyZShleHBlY3RlZCwgdW5kZWZpbmVkLCB7IHNpbGVudDogdHJ1ZSwgZXhpdE9uTWlzczogZmFsc2UgfSk7XG59O1xuXG4vKipcbiAqIEEgYmFzaWMgZ2V0dGVyIGZvciB0aGUgaW50ZXJuYWwgY29udGV4dCBcImN0eFwiIHZhbHVlLlxuICogQHJldHVybnMge0VudkNvbnRleHR9XG4gKi9cbmVudi5jdHggPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGN0eDtcbn07XG5cbi8qKlxuICogUmVzZXRzIHRoZSBzdGF0ZSBvZiB0aGUgY29udGV4dC5cbiAqIEBwcm90ZWN0ZWRcbiAqL1xuZW52Ll9yZXNldEN0eCA9IGZ1bmN0aW9uKCkge1xuICBjdHguZGVmYXVsdHMgPSB7fTtcbiAgY3R4LmNvbnN0YW50cyA9IHt9O1xuICBjdHguZG90ZW52ID0ge307XG4gIGN0eC5wcm9jZXNzID0gT2JqZWN0LmFzc2lnbih7fSwgcHJvY2Vzcy5lbnYpO1xuICBjdHguZXJyb3JzID0ge307XG59O1xuXG4vKipcbiAqIFRoZSBwcm90b3R5cGUgZm9yIGFsbCBFbnZMaXN0IG9iamVjdHMuIEFsbG93cyB1cyB0byBkZXJlZmVyZW5jZSB2YXJpYWJsZXNcbiAqIGJ5IG5hbWUgYW5kIGNvbnRyb2wgdGhlIHZhbHVlIHRoYXQgaXMgcmV0dXJuZWQgd2hlbiB0aGUgdmFyaWFibGUgZG9lcyBub3RcbiAqIGV4aXN0LlxuICogQGNvbnN0YW50XG4gKiBAcHJvcGVydHkge09iamVjdH0gX3ZhbHVlcyAtIEEgYmFzaWMgb2JqZWN0L2RpY3QgdmVyc2lvbiBvZiB0aGUgRW52TGlzdC5cbiAqIEBwcm9wZXJ0eSB7Kn0gICAgICBfbWlzc1ZhbHVlIC0gVGhlIHZhbHVlIHJldHVybmVkIG9uIGEgbWlzcyB3aGVuXG4gKiAgICAgICAgICAgICAgICAgICAgY2FsbGluZyBFbnZMaXN0LmdldCgpLlxuICogQG1ldGhvZCBtaXNzaW5nUmV0dXJuVmFsdWUoPCo+KSAtIFNldHMgdGhlIG1pc3NpbmcgcmV0dXJuIHZhbHVlLlxuICogQG1ldGhvZCBnZXQoPHN0cmluZz4pIC0gQWNjZXNzZXMgdGhlIHZhbHVlcyBkaWN0IChlc3NlbnRpYWxseSBhIGNvcHlcbiAqICAgICAgICAgb2YgdGhlIEVudkxpc3QpIGFuZCByZXR1cm5zIHRoZSBkZXJlZmVyZW5jZWQgdmFyaWFibGUsIG9yIHRoZVxuICogICAgICAgICBfbWlzc1ZhbHVlIGlmIG5vdCBmb3VuZC5cbiAqXG4gKiBAdG9kbyBUdXJuIHRoaXMgaW50byBhIGNsYXNzIGRlZmluaXRpb24gZm9yIEVudkxpc3QgKHJlcGxhY2UgdHlwZWRlZlxuICogICAgICAgYWJvdmUpLlxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgY29uc3QgZW52dmFycyA9IGVudih7IGNvbnN0YW50czogeyBVU0VSTkFNRTogJ3N0YXJidWNrJyB9IH0pO1xuICogICAgIGVudnZhcnMubWlzc2luZ1JldHVyblZhbHVlKCduL2EnKTtcbiAqICAgICBlbnZ2YXJzLmdldCgnVVNFUk5BTUUnKVxuICogICAgIC8vID0+ICdzdGFyYnVjaydcbiAqICAgICBlbnZ2YXJzLmdldCgnUEFTU1dPUkQnKVxuICogICAgIC8vID0+ICduL2EnXG4gKiAgICAgZW52dmFycy5QQVNTV09SRFxuICogICAgIC8vID0+IHVuZGVmaW5lZFxuICpcbiAqIEBleGFtcGxlIDxjYXB0aW9uPllvdSBjYW4gcGFzcyBhIG1pc3NpbmcgcmV0dXJuIHZhbHVlIG9uIGdlbmVyYXRpb246PC9jYXB0aW9uPlxuICogICAgIGNvbnN0IGVudnZhcnMgPSBlbnYoe1xuICogICAgICAgY29uc3RhbnRzOiB7IFVTRVJOQU1FOiAnc3RhcmJ1Y2snIH0sXG4gKiAgICAgICBtaXNzaW5nUmV0dXJuVmFsdWU6ICduL2EnLFxuICogICAgIH0pO1xuICogICAgIGVudnZhcnMuZ2V0KCdQQVNTV09SRCcpXG4gKiAgICAgLy8gPT4gJ24vYSdcbiAqL1xuZW52LkxJU1RfUFJPVE8gPSB7XG4gIF92YWx1ZXM6IHt9LFxuICBfbWlzc1ZhbHVlOiB1bmRlZmluZWQsXG4gIGdldDogZnVuY3Rpb24obmFtZSkge1xuICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuX3ZhbHVlcywgbmFtZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9taXNzVmFsdWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl92YWx1ZXNbbmFtZV07XG4gIH0sXG4gIG1pc3NpbmdSZXR1cm5WYWx1ZTogZnVuY3Rpb24odmFsdWUgPSBudWxsKSB7XG4gICAgdGhpcy5fbWlzc1ZhbHVlID0gdmFsdWU7XG4gIH0sXG59O1xuXG4vKipcbiAqIE1lcmdlIHRoZSBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcyBpbiB0aGUgY29udGV4dCB0b2dldGhlciBpbnRvIGFcbiAqIHNpbmdsZSBlbnZpcm9ubWVudGFsIG9iamVjdC4gQWRkcyBhIHByb3RvdHlwZSB0byB0aGUgb2JqZWN0IHdpdGggYVxuICogZmV3IGhlbHBlciBmdW5jdGlvbnMgKFRPRE8pLlxuICogQHByb3RlY3RlZFxuICovXG5lbnYuX2dlbmVyYXRlRnJvbUN0eCA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCB2YWx1ZXMgPSBPYmplY3QuYXNzaWduKFxuICAgIHt9LFxuICAgIGN0eC5kZWZhdWx0cyxcbiAgICBjdHguZG90ZW52LFxuICAgIGN0eC5wcm9jZXNzLFxuICAgIGN0eC5jb25zdGFudHNcbiAgKTtcbiAgY29uc3QgcHJvdG8gPSB7IC4uLmVudi5MSVNUX1BST1RPLCBfdmFsdWVzOiB2YWx1ZXMgfTtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShwcm90byksIHZhbHVlcyk7XG59O1xuXG4vLyBMb2FkIHRoZSBjdXJyZW50IHN0YXRlIG9mIHByb2Nlc3MuZW52LlxuZW52Ll9yZXNldEN0eCgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVudjtcbiJdLCJuYW1lcyI6WyJjdHgiLCJkZWZhdWx0cyIsImNvbnN0YW50cyIsInByb2Nlc3MiLCJkb3RlbnYiLCJlcnJvcnMiLCJlbnYiLCJvcHRpb25zIiwib3B0cyIsIk9iamVjdCIsImFzc2lnbiIsIkRFRkFVTFRfT1BUUyIsIm9iaiIsIl9nZW5lcmF0ZUZyb21DdHgiLCJtaXNzaW5nUmV0dXJuVmFsdWUiLCJBcnJheSIsImlzQXJyYXkiLCJlbnN1cmUiLCJsZW5ndGgiLCJrZXlzIiwidW5kZWZpbmVkIiwiY29uZmlnIiwicGFyc2VkIiwiZXJyb3IiLCJmb3JFYWNoIiwicHJvcCIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwiY2FsbCIsInJlc2V0IiwiX3Jlc2V0Q3R4IiwiZXhwZWN0ZWQiLCJhY3R1YWwiLCJzaWxlbnQiLCJleGl0T25NaXNzIiwibWlzc2luZyIsInZhcmlhYmxlIiwiaW5jbHVkZXMiLCJjb25zb2xlIiwiZXhpdCIsImNoZWNrIiwiTElTVF9QUk9UTyIsIl92YWx1ZXMiLCJfbWlzc1ZhbHVlIiwiZ2V0IiwibmFtZSIsInZhbHVlIiwidmFsdWVzIiwicHJvdG8iLCJjcmVhdGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUEwQkEsU0FBUyxHQUFHLEVBQUUsT0FBTyxnQkFBZ0I7SUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUM7R0FDMUM7O0VBRUQsTUFBTSxPQUFPLEdBQUcsS0FBSTtFQUNwQixNQUFNLGNBQWMsR0FBRyxnQ0FBK0I7RUFD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
