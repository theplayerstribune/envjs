(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory(require('fs'), require('path')))
    : typeof define === 'function' && define.amd
    ? define(['fs', 'path'], factory)
    : ((global = global || self),
      (global.envjs = factory(global.fs, global.path)));
})(this, function(fs, path) {
  'use strict';

  fs = fs && fs.hasOwnProperty('default') ? fs['default'] : fs;
  path = path && path.hasOwnProperty('default') ? path['default'] : path;

  function _typeof(obj) {
    if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
      _typeof = function(obj) {
        return typeof obj;
      };
    } else {
      _typeof = function(obj) {
        return obj &&
          typeof Symbol === 'function' &&
          obj.constructor === Symbol &&
          obj !== Symbol.prototype
          ? 'symbol'
          : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function');
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _toConsumableArray(arr) {
    return (
      _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread()
    );
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++)
        arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (
      Symbol.iterator in Object(iter) ||
      Object.prototype.toString.call(iter) === '[object Arguments]'
    )
      return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError('Invalid attempt to spread non-iterable instance');
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

  function log(message /*: string */) {
    console.log(`[dotenv][DEBUG] ${message}`);
  }

  const NEWLINE = '\n';
  const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
  const RE_NEWLINES = /\\n/g;
  const NEWLINES_MATCH = /\n|\r|\r\n/;

  // Parses src into an Object
  function parse(
    src /*: string | Buffer */,
    options /*: ?DotenvParseOptions */
  ) /*: DotenvParseOutput */ {
    const debug = Boolean(options && options.debug);
    const obj = {};

    // convert Buffers before splitting into lines and processing
    src
      .toString()
      .split(NEWLINES_MATCH)
      .forEach(function(line, idx) {
        // matching "KEY' and 'VAL' in 'KEY=VAL'
        const keyValueArr = line.match(RE_INI_KEY_VAL);
        // matched?
        if (keyValueArr != null) {
          const key = keyValueArr[1];
          // default undefined or missing values to empty string
          let val = keyValueArr[2] || '';
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
          log(
            `did not match key and value when parsing line ${idx + 1}: ${line}`
          );
        }
      });

    return obj;
  }

  // Populates process.env from .env file
  function config(
    options /*: ?DotenvConfigOptions */
  ) /*: DotenvConfigOutput */ {
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
      const parsed = parse(fs.readFileSync(dotenvPath, { encoding }), {
        debug,
      });

      Object.keys(parsed).forEach(function(key) {
        if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
          process.env[key] = parsed[key];
        } else if (debug) {
          log(
            `"${key}" is already defined in \`process.env\` and will not be overwritten`
          );
        }
      });

      return { parsed };
    } catch (e) {
      return { error: e };
    }
  }

  var config_1 = config;
  var parse_1 = parse;

  var main = {
    config: config_1,
    parse: parse_1,
  };

  function copy() {
    return Object.assign.apply(
      Object,
      [{}].concat(_toConsumableArray(Array.from(arguments)))
    );
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

  var memo = {
    ctx: null,
    emptyCtx: {
      defaults: {},
      dotenv: {},
      process: {},
      constants: {},
      errors: {},
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

  var EnvList =
    /*#__PURE__*/
    (function() {
      function EnvList() {
        var missValue =
          arguments.length > 0 && arguments[0] !== undefined
            ? arguments[0]
            : null;

        _classCallCheck(this, EnvList);

        this.missValue = missValue;
      }

      _createClass(EnvList, [
        {
          key: 'include',
          value: function include(name) {
            this._staticValues = copy(valuesFrom(memo.ctx));
            return Object.prototype.hasOwnProperty.call(
              this._staticValues,
              name
            );
          },
        },
        {
          key: 'includes',
          value: function includes(name) {
            return this.include(name);
          },
        },
        {
          key: 'get',
          value: function get(name) {
            if (!this.include(name)) {
              return this.missValue;
            }

            return this._staticValues[name];
          },
        },
        {
          key: 'setMissValue',
          value: function setMissValue() {
            var missValue =
              arguments.length > 0 && arguments[0] !== undefined
                ? arguments[0]
                : null;
            this.missValue = missValue;
          },
        },
      ]);

      return EnvList;
    })();
  /**
   * Merge the environmental variables in the context together into a
   * single environmental object. Adds a prototype to the object with a
   * few helper functions.
   * @protected
   */

  function generateFromCtx(missValue) {
    var proto = new envjs.EnvList(missValue);
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

  var defaultOptions = {
    dotenv: true,
    constants: {},
    defaults: {},
    ensure: [],
    missValue: null,
  };

  function isObjectLiteral(obj) {
    return _typeof(obj) === 'object' && obj.constructor === Object;
  }

  function isArrayLiteral(obj) {
    return _typeof(obj) === 'object' && obj.constructor === Array;
  }

  function validateEnvOptions(options) {
    if (!isObjectLiteral(options)) {
      throw new Error(
        'invalid options: expected object literal, received: '.concat(
          JSON.stringify(options)
        )
      );
    }

    var whitelistedFields = [
      'dotenv',
      'constants',
      'defaults',
      'ensure',
      'missValue',
    ];
    var invalidFields = [];

    for (var prop in options) {
      if (!whitelistedFields.includes(prop)) {
        invalidFields.push(prop);
      }
    }

    if (invalidFields.length) {
      throw new Error(
        'invalid options: includes invalid fields: '.concat(
          invalidFields.join(', ')
        )
      );
    }

    if (
      options.defaults &&
      (!isObjectLiteral(options.defaults) ||
        !Object.values(options.defaults).every(function(i) {
          return typeof i === 'string';
        }))
    ) {
      throw new Error(
        'invalid option defaults: expected object literal with string values'
      );
    }

    if (
      options.constants &&
      (!isObjectLiteral(options.constants) ||
        !Object.values(options.constants).every(function(i) {
          return typeof i === 'string';
        }))
    ) {
      throw new Error(
        'invalid option constants: expected object literal with string values'
      );
    }

    if (
      options.ensure &&
      (!isArrayLiteral(options.ensure) ||
        !options.ensure.every(function(i) {
          return typeof i === 'string';
        }))
    ) {
      throw new Error(
        'invalid option ensure: expected array literal with string items'
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

  function envjs() {
    var options =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return envjs.update(options);
  }

  envjs.defaultOptions = defaultOptions;
  envjs.validateEnvOptions = validateEnvOptions;
  envjs.EnvList = EnvList;
  envjs._clearCtx = clearCtx;
  envjs._generateFromCtx = generateFromCtx;
  envjs._emptyCtx = memo.emptyCtx;
  envjs._exit = exit;
  envjs.__m = memo;

  envjs.update = function() {
    var options =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    envjs.validateEnvOptions(options);
    var opts = copy(envjs.defaultOptions, options);
    memo.ctx.process = copy(memo.ctx.process, process.env);
    memo.ctx.defaults = copy(memo.ctx.defaults, opts.defaults);
    memo.ctx.constants = copy(memo.ctx.constants, opts.constants);

    if (opts.dotenv) {
      envjs.load(); // NOTE: loses control of thread. Race condition.
    }

    var obj = envjs._generateFromCtx(opts.missValue);

    var expected = opts.ensure;

    if (expected.length) {
      envjs.check(expected, Object.keys(obj), {
        logOnMiss: true,
        exitOnMiss: true,
      });
    }

    return obj;
  };

  envjs.set = function(name, value) {
    if (typeof value === 'undefined') {
      delete memo.ctx.process[name];
      return false;
    }

    memo.ctx.process[name] = value;
    return true;
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

    return envjs.update(opts);
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

  envjs.check = function() {
    var expected =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var actual =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var opts =
      arguments.length > 2 && arguments[2] !== undefined
        ? arguments[2]
        : {
            logOnMiss: false,
            exitOnMiss: false,
            throwOnMiss: false,
          };

    if (!isArrayLiteral(expected) || !isArrayLiteral(actual)) {
      throw new Error('invalid values to check');
    }

    var missing = [];
    expected.forEach(function(v) {
      if (!actual.includes(v)) {
        missing.push(v);
      }
    });

    if (missing.length !== 0 && opts.logOnMiss) {
      console.error(
        missing
          .map(function(v) {
            return '[ERR] missing required env var {'.concat(v, '}');
          })
          .join('\n')
      );
    }

    if (missing.length !== 0 && opts.throwOnMiss) {
      throw new Error('missing required env vars: '.concat(missing.join(', ')));
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
    var oprocessenv = copy(process.env);

    var _dotenv$config = main.config(),
      parsed = _dotenv$config.parsed,
      error = _dotenv$config.error; // Restore the clean, pre-dotenv process.env

    process.env = oprocessenv; // Merge parsed and errors into the context.

    memo.ctx.dotenv = copy(memo.ctx.dotenv, parsed);

    if (error) {
      memo.ctx.errors = copy(memo.ctx.errors, {
        dotenv: {
          error: error,
        },
      });
    }

    return {
      dotenv: parsed,
      error: error,
    };
  }; // Load the current state of process.envjs.

  envjs._clearCtx();

  var src = envjs;

  return src;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW1kLWJ1bmRsZS5qcyIsInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL2RvdGVudi9saWIvbWFpbi5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuLyo6OlxuXG50eXBlIERvdGVudlBhcnNlT3B0aW9ucyA9IHtcbiAgZGVidWc/OiBib29sZWFuXG59XG5cbi8vIGtleXMgYW5kIHZhbHVlcyBmcm9tIHNyY1xudHlwZSBEb3RlbnZQYXJzZU91dHB1dCA9IHsgW3N0cmluZ106IHN0cmluZyB9XG5cbnR5cGUgRG90ZW52Q29uZmlnT3B0aW9ucyA9IHtcbiAgcGF0aD86IHN0cmluZywgLy8gcGF0aCB0byAuZW52IGZpbGVcbiAgZW5jb2Rpbmc/OiBzdHJpbmcsIC8vIGVuY29kaW5nIG9mIC5lbnYgZmlsZVxuICBkZWJ1Zz86IHN0cmluZyAvLyB0dXJuIG9uIGxvZ2dpbmcgZm9yIGRlYnVnZ2luZyBwdXJwb3Nlc1xufVxuXG50eXBlIERvdGVudkNvbmZpZ091dHB1dCA9IHtcbiAgcGFyc2VkPzogRG90ZW52UGFyc2VPdXRwdXQsXG4gIGVycm9yPzogRXJyb3Jcbn1cblxuKi9cblxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbmZ1bmN0aW9uIGxvZyAobWVzc2FnZSAvKjogc3RyaW5nICovKSB7XG4gIGNvbnNvbGUubG9nKGBbZG90ZW52XVtERUJVR10gJHttZXNzYWdlfWApXG59XG5cbmNvbnN0IE5FV0xJTkUgPSAnXFxuJ1xuY29uc3QgUkVfSU5JX0tFWV9WQUwgPSAvXlxccyooW1xcdy4tXSspXFxzKj1cXHMqKC4qKT9cXHMqJC9cbmNvbnN0IFJFX05FV0xJTkVTID0gL1xcXFxuL2dcbmNvbnN0IE5FV0xJTkVTX01BVENIID0gL1xcbnxcXHJ8XFxyXFxuL1xuXG4vLyBQYXJzZXMgc3JjIGludG8gYW4gT2JqZWN0XG5mdW5jdGlvbiBwYXJzZSAoc3JjIC8qOiBzdHJpbmcgfCBCdWZmZXIgKi8sIG9wdGlvbnMgLyo6ID9Eb3RlbnZQYXJzZU9wdGlvbnMgKi8pIC8qOiBEb3RlbnZQYXJzZU91dHB1dCAqLyB7XG4gIGNvbnN0IGRlYnVnID0gQm9vbGVhbihvcHRpb25zICYmIG9wdGlvbnMuZGVidWcpXG4gIGNvbnN0IG9iaiA9IHt9XG5cbiAgLy8gY29udmVydCBCdWZmZXJzIGJlZm9yZSBzcGxpdHRpbmcgaW50byBsaW5lcyBhbmQgcHJvY2Vzc2luZ1xuICBzcmMudG9TdHJpbmcoKS5zcGxpdChORVdMSU5FU19NQVRDSCkuZm9yRWFjaChmdW5jdGlvbiAobGluZSwgaWR4KSB7XG4gICAgLy8gbWF0Y2hpbmcgXCJLRVknIGFuZCAnVkFMJyBpbiAnS0VZPVZBTCdcbiAgICBjb25zdCBrZXlWYWx1ZUFyciA9IGxpbmUubWF0Y2goUkVfSU5JX0tFWV9WQUwpXG4gICAgLy8gbWF0Y2hlZD9cbiAgICBpZiAoa2V5VmFsdWVBcnIgIT0gbnVsbCkge1xuICAgICAgY29uc3Qga2V5ID0ga2V5VmFsdWVBcnJbMV1cbiAgICAgIC8vIGRlZmF1bHQgdW5kZWZpbmVkIG9yIG1pc3NpbmcgdmFsdWVzIHRvIGVtcHR5IHN0cmluZ1xuICAgICAgbGV0IHZhbCA9IChrZXlWYWx1ZUFyclsyXSB8fCAnJylcbiAgICAgIGNvbnN0IGVuZCA9IHZhbC5sZW5ndGggLSAxXG4gICAgICBjb25zdCBpc0RvdWJsZVF1b3RlZCA9IHZhbFswXSA9PT0gJ1wiJyAmJiB2YWxbZW5kXSA9PT0gJ1wiJ1xuICAgICAgY29uc3QgaXNTaW5nbGVRdW90ZWQgPSB2YWxbMF0gPT09IFwiJ1wiICYmIHZhbFtlbmRdID09PSBcIidcIlxuXG4gICAgICAvLyBpZiBzaW5nbGUgb3IgZG91YmxlIHF1b3RlZCwgcmVtb3ZlIHF1b3Rlc1xuICAgICAgaWYgKGlzU2luZ2xlUXVvdGVkIHx8IGlzRG91YmxlUXVvdGVkKSB7XG4gICAgICAgIHZhbCA9IHZhbC5zdWJzdHJpbmcoMSwgZW5kKVxuXG4gICAgICAgIC8vIGlmIGRvdWJsZSBxdW90ZWQsIGV4cGFuZCBuZXdsaW5lc1xuICAgICAgICBpZiAoaXNEb3VibGVRdW90ZWQpIHtcbiAgICAgICAgICB2YWwgPSB2YWwucmVwbGFjZShSRV9ORVdMSU5FUywgTkVXTElORSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcmVtb3ZlIHN1cnJvdW5kaW5nIHdoaXRlc3BhY2VcbiAgICAgICAgdmFsID0gdmFsLnRyaW0oKVxuICAgICAgfVxuXG4gICAgICBvYmpba2V5XSA9IHZhbFxuICAgIH0gZWxzZSBpZiAoZGVidWcpIHtcbiAgICAgIGxvZyhgZGlkIG5vdCBtYXRjaCBrZXkgYW5kIHZhbHVlIHdoZW4gcGFyc2luZyBsaW5lICR7aWR4ICsgMX06ICR7bGluZX1gKVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gb2JqXG59XG5cbi8vIFBvcHVsYXRlcyBwcm9jZXNzLmVudiBmcm9tIC5lbnYgZmlsZVxuZnVuY3Rpb24gY29uZmlnIChvcHRpb25zIC8qOiA/RG90ZW52Q29uZmlnT3B0aW9ucyAqLykgLyo6IERvdGVudkNvbmZpZ091dHB1dCAqLyB7XG4gIGxldCBkb3RlbnZQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICcuZW52JylcbiAgbGV0IGVuY29kaW5nIC8qOiBzdHJpbmcgKi8gPSAndXRmOCdcbiAgbGV0IGRlYnVnID0gZmFsc2VcblxuICBpZiAob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLnBhdGggIT0gbnVsbCkge1xuICAgICAgZG90ZW52UGF0aCA9IG9wdGlvbnMucGF0aFxuICAgIH1cbiAgICBpZiAob3B0aW9ucy5lbmNvZGluZyAhPSBudWxsKSB7XG4gICAgICBlbmNvZGluZyA9IG9wdGlvbnMuZW5jb2RpbmdcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZGVidWcgIT0gbnVsbCkge1xuICAgICAgZGVidWcgPSB0cnVlXG4gICAgfVxuICB9XG5cbiAgdHJ5IHtcbiAgICAvLyBzcGVjaWZ5aW5nIGFuIGVuY29kaW5nIHJldHVybnMgYSBzdHJpbmcgaW5zdGVhZCBvZiBhIGJ1ZmZlclxuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlKGZzLnJlYWRGaWxlU3luYyhkb3RlbnZQYXRoLCB7IGVuY29kaW5nIH0pLCB7IGRlYnVnIH0pXG5cbiAgICBPYmplY3Qua2V5cyhwYXJzZWQpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocHJvY2Vzcy5lbnYsIGtleSkpIHtcbiAgICAgICAgcHJvY2Vzcy5lbnZba2V5XSA9IHBhcnNlZFtrZXldXG4gICAgICB9IGVsc2UgaWYgKGRlYnVnKSB7XG4gICAgICAgIGxvZyhgXCIke2tleX1cIiBpcyBhbHJlYWR5IGRlZmluZWQgaW4gXFxgcHJvY2Vzcy5lbnZcXGAgYW5kIHdpbGwgbm90IGJlIG92ZXJ3cml0dGVuYClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHsgcGFyc2VkIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB7IGVycm9yOiBlIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5jb25maWcgPSBjb25maWdcbm1vZHVsZS5leHBvcnRzLnBhcnNlID0gcGFyc2VcbiIsImNvbnN0IGRvdGVudiA9IHJlcXVpcmUoJ2RvdGVudicpO1xuXG5mdW5jdGlvbiBjb3B5KCkge1xuICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgLi4uQXJyYXkuZnJvbShhcmd1bWVudHMpKTtcbn1cblxuZnVuY3Rpb24gZXhpdCgpIHtcbiAgcHJvY2Vzcy5leGl0KDEpO1xufVxuXG4vKipcbiAqIEEgZGljdGlvbmFyeSBvZiBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcy5cbiAqIEB0eXBlZGVmIHtPYmplY3QuPHN0cmluZywgc3RyaW5nPn0gRW52TGlzdFxuICpcbiAqIEB0b2RvIFVwZ3JhZGUgdG8gYSBjbGFzcyB0aGF0IGltcGxlbWVudHMgZW52anMuTElTVF9QUk9UTyBiZWxvdy5cbiAqL1xuXG4vKipcbiAqIEEgZGVzY3JpcHRpdmUgZW52aXJvbm1lbnQgY29udGV4dCB0aGF0IHN0b3JlcyB0aGUgZGVmaW5pdGlvbnMgZm9yXG4gKiBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcyBieSB0aGVpciBzb3VyY2UsIGFzIHdlbGwgYXMgYW55IGVycm9ycyB0aGF0XG4gKiBoYXZlIGJlZW4gZ2VuZXJhdGVkIHdoaWxlIGNvbXBpbGluZyB0aGVtLlxuICogQHR5cGVkZWYge09iamVjdH0gRW52Q29udGV4dFxuICogQHByb3BlcnR5IHtFbnZMaXN0fSBkZWZhdWx0cyAtIERlZmF1bHQgZW52aXJvbm1lbnRhbCB2YXJpYWJsZXMgdGhhdFxuICogICAgICAgICAgICAgICAgICAgICBhcmUgb3ZlcnJpZGVuIGJ5IGFsbCBvdGhlciBleHBsaWNpdHkgc2V0XG4gKiAgICAgICAgICAgICAgICAgICAgIGVudmlyb25tZW50YWwgdmFyaWFibGVzLlxuICogQHByb3BlcnR5IHtFbnZMaXN0fSBjb25zdGFudHMgLSBDb25zdGFudCBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcyB0aGF0XG4gKiAgICAgICAgICAgICAgICAgICAgIGNhbiBub3QgYmUgb3ZlcnJpZGVuLlxuICogQHByb3BlcnR5IHtFbnZMaXN0fSBwcm9jZXNzIC0gVGhlIGNvbnRlbnQgb2YgcHJvY2Vzcy5lbnYgYXMgb2YgdGhlIGxhc3RcbiAqICAgICAgICAgICAgICAgICAgICAgY2FsbCB0byBjbGVhckN0eC5cbiAqIEBwcm9wZXJ0eSB7RW52TGlzdH0gZG90ZW52IC0gQWxsIGVudmlyb25tZW50YWwgdmFyaWFibGVzIGxvYWRlZCBieSB0aGVcbiAqICAgICAgICAgICAgICAgICAgICAgZG90ZW52IG1vZHVsZS5cbiAqIEBwcm9wZXJ0eSB7T2JqZWN0fSAgZXJyb3JzIC0gQSBkZXBvc2l0b3J5IGZvciBlcnJvcnMgZ2VuZXJhdGVkIHdoZW5cbiAqICAgICAgICAgICAgICAgICAgICAgbG9hZGluZyB0aGUgZW52aXJvbm1lbnQuXG4gKi9cblxuLyoqXG4gKiBUaGUgbWVtb2l6ZWQgZW52aXJvbm1lbnQgY29udGV4dCB0aGF0IHdlIG11dGF0ZSBhbmQgc2hhcmUuXG4gKiBAdHlwZSB7RW52Q29udGV4dH1cbiAqL1xuY29uc3QgbWVtbyA9IHtcbiAgY3R4OiBudWxsLFxuICBlbXB0eUN0eDoge1xuICAgIGRlZmF1bHRzOiB7fSxcbiAgICBkb3RlbnY6IHt9LFxuICAgIHByb2Nlc3M6IHt9LFxuICAgIGNvbnN0YW50czoge30sXG4gICAgZXJyb3JzOiB7fSxcbiAgfSxcbn07XG5cbi8qKlxuICogUmVzZXRzIHRoZSBzdGF0ZSBvZiB0aGUgY29udGV4dC5cbiAqIEBwcm90ZWN0ZWRcbiAqL1xuZnVuY3Rpb24gY2xlYXJDdHgoKSB7XG4gIG1lbW8uY3R4ID0ge307XG4gIG1lbW8uY3R4LmRlZmF1bHRzID0ge307XG4gIG1lbW8uY3R4LmRvdGVudiA9IHt9O1xuICBtZW1vLmN0eC5wcm9jZXNzID0ge307XG4gIG1lbW8uY3R4LmNvbnN0YW50cyA9IHt9O1xuICBtZW1vLmN0eC5lcnJvcnMgPSB7fTtcbn1cblxuZnVuY3Rpb24gdmFsdWVzRnJvbShjdHgpIHtcbiAgcmV0dXJuIGNvcHkoY3R4LmRlZmF1bHRzLCBjdHguZG90ZW52LCBjdHgucHJvY2VzcywgY3R4LmNvbnN0YW50cyk7XG59XG5cbi8qKlxuICogVGhlIGNsYXNzIGZvciBhbGwgRW52TGlzdCBvYmplY3RzLiBBbGxvd3MgdXMgdG8gZGVyZWZlcmVuY2UgdmFyaWFibGVzXG4gKiBieSBuYW1lIGFuZCBjb250cm9sIHRoZSB2YWx1ZSB0aGF0IGlzIHJldHVybmVkIHdoZW4gdGhlIHZhcmlhYmxlIGRvZXMgbm90XG4gKiBleGlzdC5cbiAqXG4gKiBAcHJvcGVydHkge09iamVjdH0gdmFsdWVzIC0gQSBiYXNpYyBvYmplY3QvZGljdCB2ZXJzaW9uIG9mIHRoZSBFbnZMaXN0LlxuICogQHByb3BlcnR5IHsqfSAgICAgIG1pc3NWYWx1ZSAtIFRoZSB2YWx1ZSByZXR1cm5lZCBvbiBhIG1pc3Mgd2hlblxuICogICAgICAgICAgICAgICAgICAgIGNhbGxpbmcgRW52TGlzdC5nZXQoKS5cbiAqIEBtZXRob2QgaW5jbHVkZSg8c3RyaW5nPikgLSBBY2Nlc3NlcyB0aGUgdmFsdWVzIGRpY3QgYW5kIHJldHVybnNcbiAqICAgICAgICAgd2hldGhlciB0aGUgZ2l2ZW4gbmFtZSBpcyBpbiBpdC5cbiAqIEBtZXRob2QgaW5jbHVkZXMoPHN0cmluZz4pIOKAkyBBbiBhbGlhcyBvZiBpbmNsdWRlKCkuXG4gKiBAbWV0aG9kIGdldCg8c3RyaW5nPikgLSBBY2Nlc3NlcyB0aGUgdmFsdWVzIGRpY3QgYW5kIHJldHVybnMgdGhlXG4gKiAgICAgICAgIGRlcmVmZXJlbmNlZCB2YXJpYWJsZSwgb3IgdGhlIG1pc3NWYWx1ZSBpZiBub3QgZm91bmQuXG4gKiBAbWV0aG9kIHNldE1pc3NWYWx1ZSg8Kj4pIC0gU2V0cyB0aGUgbWlzc2luZyByZXR1cm4gdmFsdWUuXG4gKlxuICogQGV4YW1wbGVcbiAqICAgICBjb25zdCBlbnZ2YXJzID0gZW52KHsgY29uc3RhbnRzOiB7IFVTRVJOQU1FOiAnc3RhcmJ1Y2snIH0gfSk7XG4gKiAgICAgZW52dmFycy5zZXRNaXNzVmFsdWUoJ24vYScpO1xuICogICAgIGVudnZhcnMuZ2V0KCdVU0VSTkFNRScpXG4gKiAgICAgLy8gPT4gJ3N0YXJidWNrJ1xuICogICAgIGVudnZhcnMuZ2V0KCdQQVNTV09SRCcpXG4gKiAgICAgLy8gPT4gJ24vYSdcbiAqICAgICBlbnZ2YXJzLlBBU1NXT1JEXG4gKiAgICAgLy8gPT4gbnVsbFxuICpcbiAqIEBleGFtcGxlIDxjYXB0aW9uPllvdSBjYW4gcGFzcyBhIG1pc3NpbmcgcmV0dXJuIHZhbHVlIG9uIGdlbmVyYXRpb246PC9jYXB0aW9uPlxuICogICAgIGNvbnN0IGVudnZhcnMgPSBlbnYoe1xuICogICAgICAgY29uc3RhbnRzOiB7IFVTRVJOQU1FOiAnc3RhcmJ1Y2snIH0sXG4gKiAgICAgICBtaXNzVmFsdWU6ICduL2EnLFxuICogICAgIH0pO1xuICogICAgIGVudnZhcnMuZ2V0KCdQQVNTV09SRCcpXG4gKiAgICAgLy8gPT4gJ24vYSdcbiAqL1xuY2xhc3MgRW52TGlzdCB7XG4gIGNvbnN0cnVjdG9yKG1pc3NWYWx1ZSA9IG51bGwpIHtcbiAgICB0aGlzLm1pc3NWYWx1ZSA9IG1pc3NWYWx1ZTtcbiAgfVxuXG4gIGluY2x1ZGUobmFtZSkge1xuICAgIHRoaXMuX3N0YXRpY1ZhbHVlcyA9IGNvcHkodmFsdWVzRnJvbShtZW1vLmN0eCkpO1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5fc3RhdGljVmFsdWVzLCBuYW1lKTtcbiAgfVxuXG4gIGluY2x1ZGVzKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5pbmNsdWRlKG5hbWUpO1xuICB9XG5cbiAgZ2V0KG5hbWUpIHtcbiAgICBpZiAoIXRoaXMuaW5jbHVkZShuYW1lKSkge1xuICAgICAgcmV0dXJuIHRoaXMubWlzc1ZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fc3RhdGljVmFsdWVzW25hbWVdO1xuICB9XG5cbiAgc2V0TWlzc1ZhbHVlKG1pc3NWYWx1ZSA9IG51bGwpIHtcbiAgICB0aGlzLm1pc3NWYWx1ZSA9IG1pc3NWYWx1ZTtcbiAgfVxufVxuXG4vKipcbiAqIE1lcmdlIHRoZSBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcyBpbiB0aGUgY29udGV4dCB0b2dldGhlciBpbnRvIGFcbiAqIHNpbmdsZSBlbnZpcm9ubWVudGFsIG9iamVjdC4gQWRkcyBhIHByb3RvdHlwZSB0byB0aGUgb2JqZWN0IHdpdGggYVxuICogZmV3IGhlbHBlciBmdW5jdGlvbnMuXG4gKiBAcHJvdGVjdGVkXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlRnJvbUN0eChtaXNzVmFsdWUpIHtcbiAgY29uc3QgcHJvdG8gPSBuZXcgZW52anMuRW52TGlzdChtaXNzVmFsdWUpO1xuICByZXR1cm4gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKHByb3RvKSwgdmFsdWVzRnJvbShtZW1vLmN0eCkpO1xufVxuXG4vKipcbiAqIE9wdGlvbnMgZm9yIGNhbGxzIHRvIGdlbmVyYXRlIGEgbmV3IGNvbnRleHQuXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBFbnZPcHRpb25zXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59ICBkb3RlbnYgLSBXaGV0aGVyIG9yIG5vdCB0byBydW4gYSBkb3RlbnYgY29uZmlnXG4gKiAgICAgICAgICAgICAgICAgICAgICBsb2FkLlxuICogQHByb3BlcnR5IHtFbnZMaXN0fSAgZGVmYXVsdHMgLSBBIGxpc3Qgb2YgZGVmYXVsdCBlbnZpcm9ubWVudGFsXG4gKiAgICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZXMuXG4gKiBAcHJvcGVydHkge0Vudkxpc3R9ICBjb25zdGFudHMgLSBBIGxpc3Qgb2YgY29uc3RhbnQgZW52aXJvbm1lbnRhbFxuICogICAgICAgICAgICAgICAgICAgICAgdmFyaWFibGVzLlxuICogQHByb3BlcnR5IHtzdHJpbmdbXX0gZW5zdXJlIC0gQSBsaXN0IGVudmlyb25tZW50YWwgdmFyaWFibGUgbmFtZXMgdGhhdFxuICogICAgICAgICAgICAgICAgICAgICAgbXVzdCBleGlzdCBpbiB0aGUgY29udGV4dCwgb3Igd2UgZXhpdCB0aGUgcHJvZ3JhbS5cbiAqIEBwcm9wZXJ0eSB7Kn0gICAgICAgIG1pc3NWYWx1ZSAtIFRoZSB2YWx1ZSB0aGF0IGlzIHJldHVybmVkIHdoZW4gd2VcbiAqICAgICAgICAgICAgICAgICAgICAgIGNhbGwgRW52TGlzdC5nZXQoKSBvbiBhIG1pc3NpbmcgdmFsdWUuXG4gKi9cbmNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICBkb3RlbnY6IHRydWUsXG4gIGNvbnN0YW50czoge30sXG4gIGRlZmF1bHRzOiB7fSxcbiAgZW5zdXJlOiBbXSxcbiAgbWlzc1ZhbHVlOiBudWxsLFxufTtcblxuZnVuY3Rpb24gaXNPYmplY3RMaXRlcmFsKG9iaikge1xuICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBPYmplY3Q7XG59XG5cbmZ1bmN0aW9uIGlzQXJyYXlMaXRlcmFsKG9iaikge1xuICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBBcnJheTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVFbnZPcHRpb25zKG9wdGlvbnMpIHtcbiAgaWYgKCFpc09iamVjdExpdGVyYWwob3B0aW9ucykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgaW52YWxpZCBvcHRpb25zOiBleHBlY3RlZCBvYmplY3QgbGl0ZXJhbCwgcmVjZWl2ZWQ6ICR7SlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIG9wdGlvbnNcbiAgICAgICl9YFxuICAgICk7XG4gIH1cbiAgY29uc3Qgd2hpdGVsaXN0ZWRGaWVsZHMgPSBbXG4gICAgJ2RvdGVudicsXG4gICAgJ2NvbnN0YW50cycsXG4gICAgJ2RlZmF1bHRzJyxcbiAgICAnZW5zdXJlJyxcbiAgICAnbWlzc1ZhbHVlJyxcbiAgXTtcbiAgY29uc3QgaW52YWxpZEZpZWxkcyA9IFtdO1xuICBmb3IgKGNvbnN0IHByb3AgaW4gb3B0aW9ucykge1xuICAgIGlmICghd2hpdGVsaXN0ZWRGaWVsZHMuaW5jbHVkZXMocHJvcCkpIHtcbiAgICAgIGludmFsaWRGaWVsZHMucHVzaChwcm9wKTtcbiAgICB9XG4gIH1cbiAgaWYgKGludmFsaWRGaWVsZHMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYGludmFsaWQgb3B0aW9uczogaW5jbHVkZXMgaW52YWxpZCBmaWVsZHM6ICR7aW52YWxpZEZpZWxkcy5qb2luKCcsICcpfWBcbiAgICApO1xuICB9XG5cbiAgaWYgKFxuICAgIG9wdGlvbnMuZGVmYXVsdHMgJiZcbiAgICAoIWlzT2JqZWN0TGl0ZXJhbChvcHRpb25zLmRlZmF1bHRzKSB8fFxuICAgICAgIU9iamVjdC52YWx1ZXMob3B0aW9ucy5kZWZhdWx0cykuZXZlcnkoaSA9PiB0eXBlb2YgaSA9PT0gJ3N0cmluZycpKVxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgaW52YWxpZCBvcHRpb24gZGVmYXVsdHM6IGV4cGVjdGVkIG9iamVjdCBsaXRlcmFsIHdpdGggc3RyaW5nIHZhbHVlc2BcbiAgICApO1xuICB9XG5cbiAgaWYgKFxuICAgIG9wdGlvbnMuY29uc3RhbnRzICYmXG4gICAgKCFpc09iamVjdExpdGVyYWwob3B0aW9ucy5jb25zdGFudHMpIHx8XG4gICAgICAhT2JqZWN0LnZhbHVlcyhvcHRpb25zLmNvbnN0YW50cykuZXZlcnkoaSA9PiB0eXBlb2YgaSA9PT0gJ3N0cmluZycpKVxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgaW52YWxpZCBvcHRpb24gY29uc3RhbnRzOiBleHBlY3RlZCBvYmplY3QgbGl0ZXJhbCB3aXRoIHN0cmluZyB2YWx1ZXNgXG4gICAgKTtcbiAgfVxuXG4gIGlmIChcbiAgICBvcHRpb25zLmVuc3VyZSAmJlxuICAgICghaXNBcnJheUxpdGVyYWwob3B0aW9ucy5lbnN1cmUpIHx8XG4gICAgICAhb3B0aW9ucy5lbnN1cmUuZXZlcnkoaSA9PiB0eXBlb2YgaSA9PT0gJ3N0cmluZycpKVxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgaW52YWxpZCBvcHRpb24gZW5zdXJlOiBleHBlY3RlZCBhcnJheSBsaXRlcmFsIHdpdGggc3RyaW5nIGl0ZW1zYFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgc2V0IG9mIGVudmlyb25tZW50YWwgdmFyaWFibGVzIGZyb20gdGhlIGN1cnJlbnQgY29udGV4dCxcbiAqIGFmdGVyIGFwcGx5aW5nIGFsbCBwYXNzZWQgb3B0aW9ucy4gSWYgYSBzZXQgb2YgbmFtZXMgd2Ugd2FudCB0byBlbnN1cmVcbiAqIGV4aXN0IGFyZSBwYXNzZWQsIHdpbGwgYXBwbHkgdGhlc2UgYWZ0ZXIgdGhlIGxpc3QgaXMgZ2VuZXJhdGVkLlxuICogQHBhcmFtIHtFbnZPcHRpb25zfSBbb3B0aW9ucz1lbnZqcy5kZWZhdWx0T3B0aW9uc11cbiAqIEByZXR1cm5zIHtFbnZMaXN0fSBUaGUgcmVzZXQsIG5ld2x5LWdlbmVyYXRlZCBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcy5cbiAqL1xuZnVuY3Rpb24gZW52anMob3B0aW9ucyA9IHt9KSB7XG4gIHJldHVybiBlbnZqcy51cGRhdGUob3B0aW9ucyk7XG59XG5lbnZqcy5kZWZhdWx0T3B0aW9ucyA9IGRlZmF1bHRPcHRpb25zO1xuZW52anMudmFsaWRhdGVFbnZPcHRpb25zID0gdmFsaWRhdGVFbnZPcHRpb25zO1xuZW52anMuRW52TGlzdCA9IEVudkxpc3Q7XG5lbnZqcy5fY2xlYXJDdHggPSBjbGVhckN0eDtcbmVudmpzLl9nZW5lcmF0ZUZyb21DdHggPSBnZW5lcmF0ZUZyb21DdHg7XG5lbnZqcy5fZW1wdHlDdHggPSBtZW1vLmVtcHR5Q3R4O1xuZW52anMuX2V4aXQgPSBleGl0O1xuZW52anMuX19tID0gbWVtbztcblxuZW52anMudXBkYXRlID0gZnVuY3Rpb24ob3B0aW9ucyA9IHt9KSB7XG4gIGVudmpzLnZhbGlkYXRlRW52T3B0aW9ucyhvcHRpb25zKTtcbiAgY29uc3Qgb3B0cyA9IGNvcHkoZW52anMuZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gIG1lbW8uY3R4LnByb2Nlc3MgPSBjb3B5KG1lbW8uY3R4LnByb2Nlc3MsIHByb2Nlc3MuZW52KTtcbiAgbWVtby5jdHguZGVmYXVsdHMgPSBjb3B5KG1lbW8uY3R4LmRlZmF1bHRzLCBvcHRzLmRlZmF1bHRzKTtcbiAgbWVtby5jdHguY29uc3RhbnRzID0gY29weShtZW1vLmN0eC5jb25zdGFudHMsIG9wdHMuY29uc3RhbnRzKTtcblxuICBpZiAob3B0cy5kb3RlbnYpIHtcbiAgICBlbnZqcy5sb2FkKCk7IC8vIE5PVEU6IGxvc2VzIGNvbnRyb2wgb2YgdGhyZWFkLiBSYWNlIGNvbmRpdGlvbi5cbiAgfVxuXG4gIGNvbnN0IG9iaiA9IGVudmpzLl9nZW5lcmF0ZUZyb21DdHgob3B0cy5taXNzVmFsdWUpO1xuICBjb25zdCBleHBlY3RlZCA9IG9wdHMuZW5zdXJlO1xuICBpZiAoZXhwZWN0ZWQubGVuZ3RoKSB7XG4gICAgZW52anMuY2hlY2soZXhwZWN0ZWQsIE9iamVjdC5rZXlzKG9iaiksIHtcbiAgICAgIGxvZ09uTWlzczogdHJ1ZSxcbiAgICAgIGV4aXRPbk1pc3M6IHRydWUsXG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn07XG5cbmVudmpzLnNldCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgZGVsZXRlIG1lbW8uY3R4LnByb2Nlc3NbbmFtZV07XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIG1lbW8uY3R4LnByb2Nlc3NbbmFtZV0gPSB2YWx1ZTtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIEEgYmFzaWMgZ2V0dGVyIGZvciB0aGUgaW50ZXJuYWwgY29udGV4dCBcImN0eFwiIHZhbHVlLlxuICogQHJldHVybnMge0VudkNvbnRleHR9XG4gKi9cbmVudmpzLmN0eCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gY29weShtZW1vLmN0eCk7XG59O1xuXG4vKipcbiAqIENsZWFycyBvdXQgdGhlIGNvbnRleHQgYW5kIHJlZ2VuZXJhdGVzIGl0IGFjY29yZGluZyB0byB0aGUgZ2l2ZW5cbiAqIG9wdGlvbnMuXG4gKiBAcGFyYW0ge0Vudk9wdGlvbnN9IFtvcHRpb25zPWVudmpzLmRlZmF1bHRPcHRpb25zXVxuICogQHJldHVybnMge0Vudkxpc3R9IFRoZSByZXNldCwgbmV3bHktZ2VuZXJhdGVkIGVudmlyb25tZW50YWwgdmFyaWFibGVzLlxuICovXG5lbnZqcy5yZXNldCA9IGZ1bmN0aW9uKG9wdHMpIHtcbiAgZW52anMuX2NsZWFyQ3R4KCk7XG4gIHJldHVybiBlbnZqcy51cGRhdGUob3B0cyk7XG59O1xuXG4vKipcbiAqIEVuc3VyZXMgdGhhdCBzb21lIHZhcmlhYmxlIG9yIHNldCBvZiB2YXJpYWJsZXMgYXJlIGRlZmluZWQgaW4gdGhlXG4gKiBjdXJyZW50IGNvbnRleHQuIEFsbG93cyBhIGxpc3Qgb2YgZGVmaW5lZCB2YXJpYWJsZXMgdG8gYmUgcGFzc2VkLCBhc1xuICogd2VsbCBhcyBvcHRpb25zIHRoYXQgZGVmaW5lIHdoYXQgaGFwcGVucyB3aGVuIHRoZXJlIGlzIGEgbWlzc2luZ1xuICogdmFyaWFibGUuIEJ5IGRlZmF1bHQgYSBtaXNzIHdpbGwgZXhpdCB0aGUgcHJvY2VzcyB3aXRoIGFuIGV4aXQgdmFsdWVcbiAqIG9mIDEuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBbZXhwZWN0ZWQ9W11dIC0gVGhlIGxpc3Qgb2YgdmFyaWFibGUgbmFtZXMgd2UgZXhwZWN0XG4gKiAgICAgICAgICAgICAgICAgICB0byBoYXZlIGJlZW4gZGVmaW5lZC5cbiAqIEBwYXJhbSB7c3RyaW5nW119IGFjdHVhbCAtIElmIHBhc3NlZCwgdGhpcyBpcyB0aGUgbGlzdCBvZiBkZWZpbmVkXG4gKiAgICAgICAgICAgICAgICAgICB2YXJpYWJsZSBuYW1lcyB3ZSBjaGVjayBhZ2FpbnN0IChpbnN0ZWFkIG9mIHRob3NlXG4gKiAgICAgICAgICAgICAgICAgICBkZWZpbmVkIGluIHRoZSBjdXJyZW50IGNvbnRleHQpLlxuICogQHBhcmFtIHtPYmplY3R9ICAgb3B0cyAtIE9wdGlvbnMuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICBbb3B0cy5zaWxlbnQ9ZmFsc2VdIC0gV2hldGhlciBvciBub3QgdG8gbG9nIG1pc3NpbmdcbiAqICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlIG5hbWVzLlxuICogQHBhcmFtIHtib29sZWFufSAgW29wdHMuZXhpdE9uTWlzcz10cnVlXSAtIFdoZXRoZXIgb3Igbm90IHRvIGV4aXQgdGhlXG4gKiAgICAgICAgICAgICAgICAgICBwcm9jZXNzIGlmIGFueSBuYW1lcyBhcmUgbWlzc2luZy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIGFsbCB0aGUgZXhwZWN0ZWQgdmFyaWFibGVzIGFyZSBkZWZpbmVkLFxuICogICAgICAgICAgICAgICAgICAgIGZhbHNlIG90aGVyd2lzZS4gT25seSBydW5zIGlmIHRydWUgb3IgaWYgdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgZXhpdE9uTWlzcyBvcHRpb24gaXMgc2V0IHRvIGZhbHNlLlxuICpcbiAqIEB0b2RvIEFkZCBhbiBvcHRpb24gdG8gdGhyb3dPbk1pc3MsIHRoYXQgY29sbGVjdHMgdGhlIGVycm9yIG1lc3NhZ2VzXG4gKiAgICAgICBhbmQgdGhlbiB0aHJvd3MgYW4gZXJyb3IgYXQgdGhlIGVuZCBvZiB0aGUgZnVuY3Rpb24uXG4gKi9cbmVudmpzLmNoZWNrID0gZnVuY3Rpb24oXG4gIGV4cGVjdGVkID0gW10sXG4gIGFjdHVhbCA9IFtdLFxuICBvcHRzID0ge1xuICAgIGxvZ09uTWlzczogZmFsc2UsXG4gICAgZXhpdE9uTWlzczogZmFsc2UsXG4gICAgdGhyb3dPbk1pc3M6IGZhbHNlLFxuICB9XG4pIHtcbiAgaWYgKCFpc0FycmF5TGl0ZXJhbChleHBlY3RlZCkgfHwgIWlzQXJyYXlMaXRlcmFsKGFjdHVhbCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgdmFsdWVzIHRvIGNoZWNrJyk7XG4gIH1cblxuICBjb25zdCBtaXNzaW5nID0gW107XG4gIGV4cGVjdGVkLmZvckVhY2godiA9PiB7XG4gICAgaWYgKCFhY3R1YWwuaW5jbHVkZXModikpIHtcbiAgICAgIG1pc3NpbmcucHVzaCh2KTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChtaXNzaW5nLmxlbmd0aCAhPT0gMCAmJiBvcHRzLmxvZ09uTWlzcykge1xuICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICBtaXNzaW5nLm1hcCh2ID0+IGBbRVJSXSBtaXNzaW5nIHJlcXVpcmVkIGVudiB2YXIgeyR7dn19YCkuam9pbignXFxuJylcbiAgICApO1xuICB9XG5cbiAgaWYgKG1pc3NpbmcubGVuZ3RoICE9PSAwICYmIG9wdHMudGhyb3dPbk1pc3MpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYG1pc3NpbmcgcmVxdWlyZWQgZW52IHZhcnM6ICR7bWlzc2luZy5qb2luKCcsICcpfWApO1xuICB9XG5cbiAgaWYgKG1pc3NpbmcubGVuZ3RoICE9PSAwICYmIG9wdHMuZXhpdE9uTWlzcykge1xuICAgIGVudmpzLl9leGl0KCk7XG4gIH1cblxuICByZXR1cm4gbWlzc2luZy5sZW5ndGggPT09IDA7XG59O1xuXG5lbnZqcy5lbnN1cmUgPSBmdW5jdGlvbihleHBlY3RlZCkge1xuICByZXR1cm4gZW52anMuY2hlY2soZXhwZWN0ZWQsIE9iamVjdC5rZXlzKHZhbHVlc0Zyb20obWVtby5jdHgpKSwge1xuICAgIHRocm93T25NaXNzOiB0cnVlLFxuICB9KTtcbn07XG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gRG90ZW52UmVzdWx0XG4gKiBAcHJvcGVydHkge0Vudkxpc3R9IGRvdGVudiAtIFRoZSBsaXN0IG9mIGVudmlyb25tZW50YWwgdmFyaWFibGVzXG4gKiAgICAgICAgICAgICAgICAgICAgIGxvYWRlZCwgaWYgYW55LCBmcm9tIHRoZSAuZW52IGZpbGUuXG4gKiBAcHJvcGVydHkge0Vycm9yfSAgIGVycm9yIC0gQW55IGVycm9yICh1c3VhbGx5LCBtaXNzaW5nIC5lbnYgZmlsZSlcbiAqICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVkIGJ5IHJ1bm5pbmcgZG90ZW52LmNvbmZpZygpLlxuICovXG5cbi8qKlxuICogTG9hZHMgdmFyaWFibGVzIGZyb20gYSAuZW52IGZpbGUuIFVzZXMgdGhlIHN0YW5kYXJkIG1vZHVsZW4gXCJkb3RlbnZcIixcbiAqIGJ1dCBrZWVwcyB0aGUgcHJvY2Vzcy5lbnYgZnJlZSBvZiB0aGUgdmFyaWFibGVzIHRoYXQgYXJlIGxvYWRlZCxcbiAqIGFkZGluZyB0aGVtIHRvIHRoZSBpbnRlcm5hbCBjdHguZG90ZW52IGxpc3QuIEFueSBlcnJvcnMgdGhhdCBhcmVcbiAqIGdlbmVyYXRlZCBhcmUgYWRkZWQgdG8gY3R4LmVycm9ycy5kb3RlbnYgKGN1cnJlbnRseSB0aGUgb25seSBzb3VyY2VcbiAqIG9mIGVycm9ycyBpbiB0aGUgY29udGV4dCkuXG4gKiBAcmV0dXJucyB7RG90ZW52UmVzdWx0fVxuICovXG5lbnZqcy5sb2FkID0gZnVuY3Rpb24oKSB7XG4gIC8vIEVuc3VyZSB3ZSBoYXZlIGEgY29weSBvZiB0aGUgY3VycmVudCBwcm9jZXNzLmVudiwgdGhlbiBydW4gZG90ZW52LlxuICBjb25zdCBvcHJvY2Vzc2VudiA9IGNvcHkocHJvY2Vzcy5lbnYpO1xuICBjb25zdCB7IHBhcnNlZCwgZXJyb3IgfSA9IGRvdGVudi5jb25maWcoKTtcblxuICAvLyBSZXN0b3JlIHRoZSBjbGVhbiwgcHJlLWRvdGVudiBwcm9jZXNzLmVudlxuICBwcm9jZXNzLmVudiA9IG9wcm9jZXNzZW52O1xuXG4gIC8vIE1lcmdlIHBhcnNlZCBhbmQgZXJyb3JzIGludG8gdGhlIGNvbnRleHQuXG4gIG1lbW8uY3R4LmRvdGVudiA9IGNvcHkobWVtby5jdHguZG90ZW52LCBwYXJzZWQpO1xuICBpZiAoZXJyb3IpIHtcbiAgICBtZW1vLmN0eC5lcnJvcnMgPSBjb3B5KG1lbW8uY3R4LmVycm9ycywgeyBkb3RlbnY6IHsgZXJyb3IgfSB9KTtcbiAgfVxuXG4gIHJldHVybiB7IGRvdGVudjogcGFyc2VkLCBlcnJvciB9O1xufTtcblxuLy8gTG9hZCB0aGUgY3VycmVudCBzdGF0ZSBvZiBwcm9jZXNzLmVudmpzLlxuZW52anMuX2NsZWFyQ3R4KCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZW52anM7XG4iXSwibmFtZXMiOlsiY29weSIsIk9iamVjdCIsImFzc2lnbiIsIkFycmF5IiwiZnJvbSIsImFyZ3VtZW50cyIsImV4aXQiLCJwcm9jZXNzIiwibWVtbyIsImN0eCIsImVtcHR5Q3R4IiwiZGVmYXVsdHMiLCJkb3RlbnYiLCJjb25zdGFudHMiLCJlcnJvcnMiLCJjbGVhckN0eCIsInZhbHVlc0Zyb20iLCJFbnZMaXN0IiwibWlzc1ZhbHVlIiwibmFtZSIsIl9zdGF0aWNWYWx1ZXMiLCJwcm90b3R5cGUiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJpbmNsdWRlIiwiZ2VuZXJhdGVGcm9tQ3R4IiwicHJvdG8iLCJlbnZqcyIsImNyZWF0ZSIsImRlZmF1bHRPcHRpb25zIiwiZW5zdXJlIiwiaXNPYmplY3RMaXRlcmFsIiwib2JqIiwiY29uc3RydWN0b3IiLCJpc0FycmF5TGl0ZXJhbCIsInZhbGlkYXRlRW52T3B0aW9ucyIsIm9wdGlvbnMiLCJFcnJvciIsIkpTT04iLCJzdHJpbmdpZnkiLCJ3aGl0ZWxpc3RlZEZpZWxkcyIsImludmFsaWRGaWVsZHMiLCJwcm9wIiwiaW5jbHVkZXMiLCJwdXNoIiwibGVuZ3RoIiwiam9pbiIsInZhbHVlcyIsImV2ZXJ5IiwiaSIsInVwZGF0ZSIsIl9jbGVhckN0eCIsIl9nZW5lcmF0ZUZyb21DdHgiLCJfZW1wdHlDdHgiLCJfZXhpdCIsIl9fbSIsIm9wdHMiLCJlbnYiLCJsb2FkIiwiZXhwZWN0ZWQiLCJjaGVjayIsImtleXMiLCJsb2dPbk1pc3MiLCJleGl0T25NaXNzIiwic2V0IiwidmFsdWUiLCJyZXNldCIsImFjdHVhbCIsInRocm93T25NaXNzIiwibWlzc2luZyIsImZvckVhY2giLCJ2IiwiY29uc29sZSIsImVycm9yIiwibWFwIiwib3Byb2Nlc3NlbnYiLCJjb25maWciLCJwYXJzZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBMEJBLFNBQVMsR0FBRyxFQUFFLE9BQU8sZ0JBQWdCO0lBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFDO0dBQzFDOztFQUVELE1BQU0sT0FBTyxHQUFHLEtBQUk7RUFDcEIsTUFBTSxjQUFjLEdBQUcsZ0NB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
