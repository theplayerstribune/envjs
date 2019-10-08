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
        'invalid option defaults: expected object literal with string keys'
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
        'invalid option constants: expected object literal with string keys'
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW1kLWJ1bmRsZS5qcyIsInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL2RvdGVudi9saWIvbWFpbi5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuLyo6OlxuXG50eXBlIERvdGVudlBhcnNlT3B0aW9ucyA9IHtcbiAgZGVidWc/OiBib29sZWFuXG59XG5cbi8vIGtleXMgYW5kIHZhbHVlcyBmcm9tIHNyY1xudHlwZSBEb3RlbnZQYXJzZU91dHB1dCA9IHsgW3N0cmluZ106IHN0cmluZyB9XG5cbnR5cGUgRG90ZW52Q29uZmlnT3B0aW9ucyA9IHtcbiAgcGF0aD86IHN0cmluZywgLy8gcGF0aCB0byAuZW52IGZpbGVcbiAgZW5jb2Rpbmc/OiBzdHJpbmcsIC8vIGVuY29kaW5nIG9mIC5lbnYgZmlsZVxuICBkZWJ1Zz86IHN0cmluZyAvLyB0dXJuIG9uIGxvZ2dpbmcgZm9yIGRlYnVnZ2luZyBwdXJwb3Nlc1xufVxuXG50eXBlIERvdGVudkNvbmZpZ091dHB1dCA9IHtcbiAgcGFyc2VkPzogRG90ZW52UGFyc2VPdXRwdXQsXG4gIGVycm9yPzogRXJyb3Jcbn1cblxuKi9cblxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbmZ1bmN0aW9uIGxvZyAobWVzc2FnZSAvKjogc3RyaW5nICovKSB7XG4gIGNvbnNvbGUubG9nKGBbZG90ZW52XVtERUJVR10gJHttZXNzYWdlfWApXG59XG5cbmNvbnN0IE5FV0xJTkUgPSAnXFxuJ1xuY29uc3QgUkVfSU5JX0tFWV9WQUwgPSAvXlxccyooW1xcdy4tXSspXFxzKj1cXHMqKC4qKT9cXHMqJC9cbmNvbnN0IFJFX05FV0xJTkVTID0gL1xcXFxuL2dcbmNvbnN0IE5FV0xJTkVTX01BVENIID0gL1xcbnxcXHJ8XFxyXFxuL1xuXG4vLyBQYXJzZXMgc3JjIGludG8gYW4gT2JqZWN0XG5mdW5jdGlvbiBwYXJzZSAoc3JjIC8qOiBzdHJpbmcgfCBCdWZmZXIgKi8sIG9wdGlvbnMgLyo6ID9Eb3RlbnZQYXJzZU9wdGlvbnMgKi8pIC8qOiBEb3RlbnZQYXJzZU91dHB1dCAqLyB7XG4gIGNvbnN0IGRlYnVnID0gQm9vbGVhbihvcHRpb25zICYmIG9wdGlvbnMuZGVidWcpXG4gIGNvbnN0IG9iaiA9IHt9XG5cbiAgLy8gY29udmVydCBCdWZmZXJzIGJlZm9yZSBzcGxpdHRpbmcgaW50byBsaW5lcyBhbmQgcHJvY2Vzc2luZ1xuICBzcmMudG9TdHJpbmcoKS5zcGxpdChORVdMSU5FU19NQVRDSCkuZm9yRWFjaChmdW5jdGlvbiAobGluZSwgaWR4KSB7XG4gICAgLy8gbWF0Y2hpbmcgXCJLRVknIGFuZCAnVkFMJyBpbiAnS0VZPVZBTCdcbiAgICBjb25zdCBrZXlWYWx1ZUFyciA9IGxpbmUubWF0Y2goUkVfSU5JX0tFWV9WQUwpXG4gICAgLy8gbWF0Y2hlZD9cbiAgICBpZiAoa2V5VmFsdWVBcnIgIT0gbnVsbCkge1xuICAgICAgY29uc3Qga2V5ID0ga2V5VmFsdWVBcnJbMV1cbiAgICAgIC8vIGRlZmF1bHQgdW5kZWZpbmVkIG9yIG1pc3NpbmcgdmFsdWVzIHRvIGVtcHR5IHN0cmluZ1xuICAgICAgbGV0IHZhbCA9IChrZXlWYWx1ZUFyclsyXSB8fCAnJylcbiAgICAgIGNvbnN0IGVuZCA9IHZhbC5sZW5ndGggLSAxXG4gICAgICBjb25zdCBpc0RvdWJsZVF1b3RlZCA9IHZhbFswXSA9PT0gJ1wiJyAmJiB2YWxbZW5kXSA9PT0gJ1wiJ1xuICAgICAgY29uc3QgaXNTaW5nbGVRdW90ZWQgPSB2YWxbMF0gPT09IFwiJ1wiICYmIHZhbFtlbmRdID09PSBcIidcIlxuXG4gICAgICAvLyBpZiBzaW5nbGUgb3IgZG91YmxlIHF1b3RlZCwgcmVtb3ZlIHF1b3Rlc1xuICAgICAgaWYgKGlzU2luZ2xlUXVvdGVkIHx8IGlzRG91YmxlUXVvdGVkKSB7XG4gICAgICAgIHZhbCA9IHZhbC5zdWJzdHJpbmcoMSwgZW5kKVxuXG4gICAgICAgIC8vIGlmIGRvdWJsZSBxdW90ZWQsIGV4cGFuZCBuZXdsaW5lc1xuICAgICAgICBpZiAoaXNEb3VibGVRdW90ZWQpIHtcbiAgICAgICAgICB2YWwgPSB2YWwucmVwbGFjZShSRV9ORVdMSU5FUywgTkVXTElORSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcmVtb3ZlIHN1cnJvdW5kaW5nIHdoaXRlc3BhY2VcbiAgICAgICAgdmFsID0gdmFsLnRyaW0oKVxuICAgICAgfVxuXG4gICAgICBvYmpba2V5XSA9IHZhbFxuICAgIH0gZWxzZSBpZiAoZGVidWcpIHtcbiAgICAgIGxvZyhgZGlkIG5vdCBtYXRjaCBrZXkgYW5kIHZhbHVlIHdoZW4gcGFyc2luZyBsaW5lICR7aWR4ICsgMX06ICR7bGluZX1gKVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gb2JqXG59XG5cbi8vIFBvcHVsYXRlcyBwcm9jZXNzLmVudiBmcm9tIC5lbnYgZmlsZVxuZnVuY3Rpb24gY29uZmlnIChvcHRpb25zIC8qOiA/RG90ZW52Q29uZmlnT3B0aW9ucyAqLykgLyo6IERvdGVudkNvbmZpZ091dHB1dCAqLyB7XG4gIGxldCBkb3RlbnZQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICcuZW52JylcbiAgbGV0IGVuY29kaW5nIC8qOiBzdHJpbmcgKi8gPSAndXRmOCdcbiAgbGV0IGRlYnVnID0gZmFsc2VcblxuICBpZiAob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLnBhdGggIT0gbnVsbCkge1xuICAgICAgZG90ZW52UGF0aCA9IG9wdGlvbnMucGF0aFxuICAgIH1cbiAgICBpZiAob3B0aW9ucy5lbmNvZGluZyAhPSBudWxsKSB7XG4gICAgICBlbmNvZGluZyA9IG9wdGlvbnMuZW5jb2RpbmdcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZGVidWcgIT0gbnVsbCkge1xuICAgICAgZGVidWcgPSB0cnVlXG4gICAgfVxuICB9XG5cbiAgdHJ5IHtcbiAgICAvLyBzcGVjaWZ5aW5nIGFuIGVuY29kaW5nIHJldHVybnMgYSBzdHJpbmcgaW5zdGVhZCBvZiBhIGJ1ZmZlclxuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlKGZzLnJlYWRGaWxlU3luYyhkb3RlbnZQYXRoLCB7IGVuY29kaW5nIH0pLCB7IGRlYnVnIH0pXG5cbiAgICBPYmplY3Qua2V5cyhwYXJzZWQpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocHJvY2Vzcy5lbnYsIGtleSkpIHtcbiAgICAgICAgcHJvY2Vzcy5lbnZba2V5XSA9IHBhcnNlZFtrZXldXG4gICAgICB9IGVsc2UgaWYgKGRlYnVnKSB7XG4gICAgICAgIGxvZyhgXCIke2tleX1cIiBpcyBhbHJlYWR5IGRlZmluZWQgaW4gXFxgcHJvY2Vzcy5lbnZcXGAgYW5kIHdpbGwgbm90IGJlIG92ZXJ3cml0dGVuYClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHsgcGFyc2VkIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB7IGVycm9yOiBlIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5jb25maWcgPSBjb25maWdcbm1vZHVsZS5leHBvcnRzLnBhcnNlID0gcGFyc2VcbiIsImNvbnN0IGRvdGVudiA9IHJlcXVpcmUoJ2RvdGVudicpO1xuXG5mdW5jdGlvbiBjb3B5KCkge1xuICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgLi4uQXJyYXkuZnJvbShhcmd1bWVudHMpKTtcbn1cblxuZnVuY3Rpb24gZXhpdCgpIHtcbiAgcHJvY2Vzcy5leGl0KDEpO1xufVxuXG4vKipcbiAqIEEgZGljdGlvbmFyeSBvZiBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcy5cbiAqIEB0eXBlZGVmIHtPYmplY3QuPHN0cmluZywgc3RyaW5nPn0gRW52TGlzdFxuICpcbiAqIEB0b2RvIFVwZ3JhZGUgdG8gYSBjbGFzcyB0aGF0IGltcGxlbWVudHMgZW52anMuTElTVF9QUk9UTyBiZWxvdy5cbiAqL1xuXG4vKipcbiAqIEEgZGVzY3JpcHRpdmUgZW52aXJvbm1lbnQgY29udGV4dCB0aGF0IHN0b3JlcyB0aGUgZGVmaW5pdGlvbnMgZm9yXG4gKiBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcyBieSB0aGVpciBzb3VyY2UsIGFzIHdlbGwgYXMgYW55IGVycm9ycyB0aGF0XG4gKiBoYXZlIGJlZW4gZ2VuZXJhdGVkIHdoaWxlIGNvbXBpbGluZyB0aGVtLlxuICogQHR5cGVkZWYge09iamVjdH0gRW52Q29udGV4dFxuICogQHByb3BlcnR5IHtFbnZMaXN0fSBkZWZhdWx0cyAtIERlZmF1bHQgZW52aXJvbm1lbnRhbCB2YXJpYWJsZXMgdGhhdFxuICogICAgICAgICAgICAgICAgICAgICBhcmUgb3ZlcnJpZGVuIGJ5IGFsbCBvdGhlciBleHBsaWNpdHkgc2V0XG4gKiAgICAgICAgICAgICAgICAgICAgIGVudmlyb25tZW50YWwgdmFyaWFibGVzLlxuICogQHByb3BlcnR5IHtFbnZMaXN0fSBjb25zdGFudHMgLSBDb25zdGFudCBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcyB0aGF0XG4gKiAgICAgICAgICAgICAgICAgICAgIGNhbiBub3QgYmUgb3ZlcnJpZGVuLlxuICogQHByb3BlcnR5IHtFbnZMaXN0fSBwcm9jZXNzIC0gVGhlIGNvbnRlbnQgb2YgcHJvY2Vzcy5lbnYgYXMgb2YgdGhlIGxhc3RcbiAqICAgICAgICAgICAgICAgICAgICAgY2FsbCB0byBjbGVhckN0eC5cbiAqIEBwcm9wZXJ0eSB7RW52TGlzdH0gZG90ZW52IC0gQWxsIGVudmlyb25tZW50YWwgdmFyaWFibGVzIGxvYWRlZCBieSB0aGVcbiAqICAgICAgICAgICAgICAgICAgICAgZG90ZW52IG1vZHVsZS5cbiAqIEBwcm9wZXJ0eSB7T2JqZWN0fSAgZXJyb3JzIC0gQSBkZXBvc2l0b3J5IGZvciBlcnJvcnMgZ2VuZXJhdGVkIHdoZW5cbiAqICAgICAgICAgICAgICAgICAgICAgbG9hZGluZyB0aGUgZW52aXJvbm1lbnQuXG4gKi9cblxuLyoqXG4gKiBUaGUgbWVtb2l6ZWQgZW52aXJvbm1lbnQgY29udGV4dCB0aGF0IHdlIG11dGF0ZSBhbmQgc2hhcmUuXG4gKiBAdHlwZSB7RW52Q29udGV4dH1cbiAqL1xuY29uc3QgbWVtbyA9IHtcbiAgY3R4OiBudWxsLFxuICBlbXB0eUN0eDoge1xuICAgIGRlZmF1bHRzOiB7fSxcbiAgICBkb3RlbnY6IHt9LFxuICAgIHByb2Nlc3M6IHt9LFxuICAgIGNvbnN0YW50czoge30sXG4gICAgZXJyb3JzOiB7fSxcbiAgfSxcbn07XG5cbi8qKlxuICogUmVzZXRzIHRoZSBzdGF0ZSBvZiB0aGUgY29udGV4dC5cbiAqIEBwcm90ZWN0ZWRcbiAqL1xuZnVuY3Rpb24gY2xlYXJDdHgoKSB7XG4gIG1lbW8uY3R4ID0ge307XG4gIG1lbW8uY3R4LmRlZmF1bHRzID0ge307XG4gIG1lbW8uY3R4LmRvdGVudiA9IHt9O1xuICBtZW1vLmN0eC5wcm9jZXNzID0ge307XG4gIG1lbW8uY3R4LmNvbnN0YW50cyA9IHt9O1xuICBtZW1vLmN0eC5lcnJvcnMgPSB7fTtcbn1cblxuZnVuY3Rpb24gdmFsdWVzRnJvbShjdHgpIHtcbiAgcmV0dXJuIGNvcHkoY3R4LmRlZmF1bHRzLCBjdHguZG90ZW52LCBjdHgucHJvY2VzcywgY3R4LmNvbnN0YW50cyk7XG59XG5cbi8qKlxuICogVGhlIGNsYXNzIGZvciBhbGwgRW52TGlzdCBvYmplY3RzLiBBbGxvd3MgdXMgdG8gZGVyZWZlcmVuY2UgdmFyaWFibGVzXG4gKiBieSBuYW1lIGFuZCBjb250cm9sIHRoZSB2YWx1ZSB0aGF0IGlzIHJldHVybmVkIHdoZW4gdGhlIHZhcmlhYmxlIGRvZXMgbm90XG4gKiBleGlzdC5cbiAqXG4gKiBAcHJvcGVydHkge09iamVjdH0gdmFsdWVzIC0gQSBiYXNpYyBvYmplY3QvZGljdCB2ZXJzaW9uIG9mIHRoZSBFbnZMaXN0LlxuICogQHByb3BlcnR5IHsqfSAgICAgIG1pc3NWYWx1ZSAtIFRoZSB2YWx1ZSByZXR1cm5lZCBvbiBhIG1pc3Mgd2hlblxuICogICAgICAgICAgICAgICAgICAgIGNhbGxpbmcgRW52TGlzdC5nZXQoKS5cbiAqIEBtZXRob2QgaW5jbHVkZSg8c3RyaW5nPikgLSBBY2Nlc3NlcyB0aGUgdmFsdWVzIGRpY3QgYW5kIHJldHVybnNcbiAqICAgICAgICAgd2hldGhlciB0aGUgZ2l2ZW4gbmFtZSBpcyBpbiBpdC5cbiAqIEBtZXRob2QgaW5jbHVkZXMoPHN0cmluZz4pIOKAkyBBbiBhbGlhcyBvZiBpbmNsdWRlKCkuXG4gKiBAbWV0aG9kIGdldCg8c3RyaW5nPikgLSBBY2Nlc3NlcyB0aGUgdmFsdWVzIGRpY3QgYW5kIHJldHVybnMgdGhlXG4gKiAgICAgICAgIGRlcmVmZXJlbmNlZCB2YXJpYWJsZSwgb3IgdGhlIG1pc3NWYWx1ZSBpZiBub3QgZm91bmQuXG4gKiBAbWV0aG9kIHNldE1pc3NWYWx1ZSg8Kj4pIC0gU2V0cyB0aGUgbWlzc2luZyByZXR1cm4gdmFsdWUuXG4gKlxuICogQGV4YW1wbGVcbiAqICAgICBjb25zdCBlbnZ2YXJzID0gZW52KHsgY29uc3RhbnRzOiB7IFVTRVJOQU1FOiAnc3RhcmJ1Y2snIH0gfSk7XG4gKiAgICAgZW52dmFycy5zZXRNaXNzVmFsdWUoJ24vYScpO1xuICogICAgIGVudnZhcnMuZ2V0KCdVU0VSTkFNRScpXG4gKiAgICAgLy8gPT4gJ3N0YXJidWNrJ1xuICogICAgIGVudnZhcnMuZ2V0KCdQQVNTV09SRCcpXG4gKiAgICAgLy8gPT4gJ24vYSdcbiAqICAgICBlbnZ2YXJzLlBBU1NXT1JEXG4gKiAgICAgLy8gPT4gbnVsbFxuICpcbiAqIEBleGFtcGxlIDxjYXB0aW9uPllvdSBjYW4gcGFzcyBhIG1pc3NpbmcgcmV0dXJuIHZhbHVlIG9uIGdlbmVyYXRpb246PC9jYXB0aW9uPlxuICogICAgIGNvbnN0IGVudnZhcnMgPSBlbnYoe1xuICogICAgICAgY29uc3RhbnRzOiB7IFVTRVJOQU1FOiAnc3RhcmJ1Y2snIH0sXG4gKiAgICAgICBtaXNzVmFsdWU6ICduL2EnLFxuICogICAgIH0pO1xuICogICAgIGVudnZhcnMuZ2V0KCdQQVNTV09SRCcpXG4gKiAgICAgLy8gPT4gJ24vYSdcbiAqL1xuY2xhc3MgRW52TGlzdCB7XG4gIGNvbnN0cnVjdG9yKG1pc3NWYWx1ZSA9IG51bGwpIHtcbiAgICB0aGlzLm1pc3NWYWx1ZSA9IG1pc3NWYWx1ZTtcbiAgfVxuXG4gIGluY2x1ZGUobmFtZSkge1xuICAgIHRoaXMuX3N0YXRpY1ZhbHVlcyA9IGNvcHkodmFsdWVzRnJvbShtZW1vLmN0eCkpO1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5fc3RhdGljVmFsdWVzLCBuYW1lKTtcbiAgfVxuXG4gIGluY2x1ZGVzKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5pbmNsdWRlKG5hbWUpO1xuICB9XG5cbiAgZ2V0KG5hbWUpIHtcbiAgICBpZiAoIXRoaXMuaW5jbHVkZShuYW1lKSkge1xuICAgICAgcmV0dXJuIHRoaXMubWlzc1ZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fc3RhdGljVmFsdWVzW25hbWVdO1xuICB9XG5cbiAgc2V0TWlzc1ZhbHVlKG1pc3NWYWx1ZSA9IG51bGwpIHtcbiAgICB0aGlzLm1pc3NWYWx1ZSA9IG1pc3NWYWx1ZTtcbiAgfVxufVxuXG4vKipcbiAqIE1lcmdlIHRoZSBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcyBpbiB0aGUgY29udGV4dCB0b2dldGhlciBpbnRvIGFcbiAqIHNpbmdsZSBlbnZpcm9ubWVudGFsIG9iamVjdC4gQWRkcyBhIHByb3RvdHlwZSB0byB0aGUgb2JqZWN0IHdpdGggYVxuICogZmV3IGhlbHBlciBmdW5jdGlvbnMuXG4gKiBAcHJvdGVjdGVkXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlRnJvbUN0eChtaXNzVmFsdWUpIHtcbiAgY29uc3QgcHJvdG8gPSBuZXcgZW52anMuRW52TGlzdChtaXNzVmFsdWUpO1xuICByZXR1cm4gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKHByb3RvKSwgdmFsdWVzRnJvbShtZW1vLmN0eCkpO1xufVxuXG4vKipcbiAqIE9wdGlvbnMgZm9yIGNhbGxzIHRvIGdlbmVyYXRlIGEgbmV3IGNvbnRleHQuXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBFbnZPcHRpb25zXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59ICBkb3RlbnYgLSBXaGV0aGVyIG9yIG5vdCB0byBydW4gYSBkb3RlbnYgY29uZmlnXG4gKiAgICAgICAgICAgICAgICAgICAgICBsb2FkLlxuICogQHByb3BlcnR5IHtFbnZMaXN0fSAgZGVmYXVsdHMgLSBBIGxpc3Qgb2YgZGVmYXVsdCBlbnZpcm9ubWVudGFsXG4gKiAgICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZXMuXG4gKiBAcHJvcGVydHkge0Vudkxpc3R9ICBjb25zdGFudHMgLSBBIGxpc3Qgb2YgY29uc3RhbnQgZW52aXJvbm1lbnRhbFxuICogICAgICAgICAgICAgICAgICAgICAgdmFyaWFibGVzLlxuICogQHByb3BlcnR5IHtzdHJpbmdbXX0gZW5zdXJlIC0gQSBsaXN0IGVudmlyb25tZW50YWwgdmFyaWFibGUgbmFtZXMgdGhhdFxuICogICAgICAgICAgICAgICAgICAgICAgbXVzdCBleGlzdCBpbiB0aGUgY29udGV4dCwgb3Igd2UgZXhpdCB0aGUgcHJvZ3JhbS5cbiAqIEBwcm9wZXJ0eSB7Kn0gICAgICAgIG1pc3NWYWx1ZSAtIFRoZSB2YWx1ZSB0aGF0IGlzIHJldHVybmVkIHdoZW4gd2VcbiAqICAgICAgICAgICAgICAgICAgICAgIGNhbGwgRW52TGlzdC5nZXQoKSBvbiBhIG1pc3NpbmcgdmFsdWUuXG4gKi9cbmNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICBkb3RlbnY6IHRydWUsXG4gIGNvbnN0YW50czoge30sXG4gIGRlZmF1bHRzOiB7fSxcbiAgZW5zdXJlOiBbXSxcbiAgbWlzc1ZhbHVlOiBudWxsLFxufTtcblxuZnVuY3Rpb24gaXNPYmplY3RMaXRlcmFsKG9iaikge1xuICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBPYmplY3Q7XG59XG5cbmZ1bmN0aW9uIGlzQXJyYXlMaXRlcmFsKG9iaikge1xuICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBBcnJheTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVFbnZPcHRpb25zKG9wdGlvbnMpIHtcbiAgaWYgKCFpc09iamVjdExpdGVyYWwob3B0aW9ucykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgaW52YWxpZCBvcHRpb25zOiBleHBlY3RlZCBvYmplY3QgbGl0ZXJhbCwgcmVjZWl2ZWQ6ICR7SlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIG9wdGlvbnNcbiAgICAgICl9YFxuICAgICk7XG4gIH1cbiAgY29uc3Qgd2hpdGVsaXN0ZWRGaWVsZHMgPSBbXG4gICAgJ2RvdGVudicsXG4gICAgJ2NvbnN0YW50cycsXG4gICAgJ2RlZmF1bHRzJyxcbiAgICAnZW5zdXJlJyxcbiAgICAnbWlzc1ZhbHVlJyxcbiAgXTtcbiAgY29uc3QgaW52YWxpZEZpZWxkcyA9IFtdO1xuICBmb3IgKGNvbnN0IHByb3AgaW4gb3B0aW9ucykge1xuICAgIGlmICghd2hpdGVsaXN0ZWRGaWVsZHMuaW5jbHVkZXMocHJvcCkpIHtcbiAgICAgIGludmFsaWRGaWVsZHMucHVzaChwcm9wKTtcbiAgICB9XG4gIH1cbiAgaWYgKGludmFsaWRGaWVsZHMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYGludmFsaWQgb3B0aW9uczogaW5jbHVkZXMgaW52YWxpZCBmaWVsZHM6ICR7aW52YWxpZEZpZWxkcy5qb2luKCcsICcpfWBcbiAgICApO1xuICB9XG5cbiAgaWYgKFxuICAgIG9wdGlvbnMuZGVmYXVsdHMgJiZcbiAgICAoIWlzT2JqZWN0TGl0ZXJhbChvcHRpb25zLmRlZmF1bHRzKSB8fFxuICAgICAgIU9iamVjdC52YWx1ZXMob3B0aW9ucy5kZWZhdWx0cykuZXZlcnkoaSA9PiB0eXBlb2YgaSA9PT0gJ3N0cmluZycpKVxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgaW52YWxpZCBvcHRpb24gZGVmYXVsdHM6IGV4cGVjdGVkIG9iamVjdCBsaXRlcmFsIHdpdGggc3RyaW5nIGtleXNgXG4gICAgKTtcbiAgfVxuXG4gIGlmIChcbiAgICBvcHRpb25zLmNvbnN0YW50cyAmJlxuICAgICghaXNPYmplY3RMaXRlcmFsKG9wdGlvbnMuY29uc3RhbnRzKSB8fFxuICAgICAgIU9iamVjdC52YWx1ZXMob3B0aW9ucy5jb25zdGFudHMpLmV2ZXJ5KGkgPT4gdHlwZW9mIGkgPT09ICdzdHJpbmcnKSlcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYGludmFsaWQgb3B0aW9uIGNvbnN0YW50czogZXhwZWN0ZWQgb2JqZWN0IGxpdGVyYWwgd2l0aCBzdHJpbmcga2V5c2BcbiAgICApO1xuICB9XG5cbiAgaWYgKFxuICAgIG9wdGlvbnMuZW5zdXJlICYmXG4gICAgKCFpc0FycmF5TGl0ZXJhbChvcHRpb25zLmVuc3VyZSkgfHxcbiAgICAgICFvcHRpb25zLmVuc3VyZS5ldmVyeShpID0+IHR5cGVvZiBpID09PSAnc3RyaW5nJykpXG4gICkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBpbnZhbGlkIG9wdGlvbiBlbnN1cmU6IGV4cGVjdGVkIGFycmF5IGxpdGVyYWwgd2l0aCBzdHJpbmcgaXRlbXNgXG4gICAgKTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBzZXQgb2YgZW52aXJvbm1lbnRhbCB2YXJpYWJsZXMgZnJvbSB0aGUgY3VycmVudCBjb250ZXh0LFxuICogYWZ0ZXIgYXBwbHlpbmcgYWxsIHBhc3NlZCBvcHRpb25zLiBJZiBhIHNldCBvZiBuYW1lcyB3ZSB3YW50IHRvIGVuc3VyZVxuICogZXhpc3QgYXJlIHBhc3NlZCwgd2lsbCBhcHBseSB0aGVzZSBhZnRlciB0aGUgbGlzdCBpcyBnZW5lcmF0ZWQuXG4gKiBAcGFyYW0ge0Vudk9wdGlvbnN9IFtvcHRpb25zPWVudmpzLmRlZmF1bHRPcHRpb25zXVxuICogQHJldHVybnMge0Vudkxpc3R9IFRoZSByZXNldCwgbmV3bHktZ2VuZXJhdGVkIGVudmlyb25tZW50YWwgdmFyaWFibGVzLlxuICovXG5mdW5jdGlvbiBlbnZqcyhvcHRpb25zID0ge30pIHtcbiAgcmV0dXJuIGVudmpzLnVwZGF0ZShvcHRpb25zKTtcbn1cbmVudmpzLmRlZmF1bHRPcHRpb25zID0gZGVmYXVsdE9wdGlvbnM7XG5lbnZqcy52YWxpZGF0ZUVudk9wdGlvbnMgPSB2YWxpZGF0ZUVudk9wdGlvbnM7XG5lbnZqcy5FbnZMaXN0ID0gRW52TGlzdDtcbmVudmpzLl9jbGVhckN0eCA9IGNsZWFyQ3R4O1xuZW52anMuX2dlbmVyYXRlRnJvbUN0eCA9IGdlbmVyYXRlRnJvbUN0eDtcbmVudmpzLl9lbXB0eUN0eCA9IG1lbW8uZW1wdHlDdHg7XG5lbnZqcy5fZXhpdCA9IGV4aXQ7XG5lbnZqcy5fX20gPSBtZW1vO1xuXG5lbnZqcy51cGRhdGUgPSBmdW5jdGlvbihvcHRpb25zID0ge30pIHtcbiAgZW52anMudmFsaWRhdGVFbnZPcHRpb25zKG9wdGlvbnMpO1xuICBjb25zdCBvcHRzID0gY29weShlbnZqcy5kZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgbWVtby5jdHgucHJvY2VzcyA9IGNvcHkobWVtby5jdHgucHJvY2VzcywgcHJvY2Vzcy5lbnYpO1xuICBtZW1vLmN0eC5kZWZhdWx0cyA9IGNvcHkobWVtby5jdHguZGVmYXVsdHMsIG9wdHMuZGVmYXVsdHMpO1xuICBtZW1vLmN0eC5jb25zdGFudHMgPSBjb3B5KG1lbW8uY3R4LmNvbnN0YW50cywgb3B0cy5jb25zdGFudHMpO1xuXG4gIGlmIChvcHRzLmRvdGVudikge1xuICAgIGVudmpzLmxvYWQoKTsgLy8gTk9URTogbG9zZXMgY29udHJvbCBvZiB0aHJlYWQuIFJhY2UgY29uZGl0aW9uLlxuICB9XG5cbiAgY29uc3Qgb2JqID0gZW52anMuX2dlbmVyYXRlRnJvbUN0eChvcHRzLm1pc3NWYWx1ZSk7XG4gIGNvbnN0IGV4cGVjdGVkID0gb3B0cy5lbnN1cmU7XG4gIGlmIChleHBlY3RlZC5sZW5ndGgpIHtcbiAgICBlbnZqcy5jaGVjayhleHBlY3RlZCwgT2JqZWN0LmtleXMob2JqKSwge1xuICAgICAgbG9nT25NaXNzOiB0cnVlLFxuICAgICAgZXhpdE9uTWlzczogdHJ1ZSxcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gb2JqO1xufTtcblxuZW52anMuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBkZWxldGUgbWVtby5jdHgucHJvY2Vzc1tuYW1lXTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgbWVtby5jdHgucHJvY2Vzc1tuYW1lXSA9IHZhbHVlO1xuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogQSBiYXNpYyBnZXR0ZXIgZm9yIHRoZSBpbnRlcm5hbCBjb250ZXh0IFwiY3R4XCIgdmFsdWUuXG4gKiBAcmV0dXJucyB7RW52Q29udGV4dH1cbiAqL1xuZW52anMuY3R4ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBjb3B5KG1lbW8uY3R4KTtcbn07XG5cbi8qKlxuICogQ2xlYXJzIG91dCB0aGUgY29udGV4dCBhbmQgcmVnZW5lcmF0ZXMgaXQgYWNjb3JkaW5nIHRvIHRoZSBnaXZlblxuICogb3B0aW9ucy5cbiAqIEBwYXJhbSB7RW52T3B0aW9uc30gW29wdGlvbnM9ZW52anMuZGVmYXVsdE9wdGlvbnNdXG4gKiBAcmV0dXJucyB7RW52TGlzdH0gVGhlIHJlc2V0LCBuZXdseS1nZW5lcmF0ZWQgZW52aXJvbm1lbnRhbCB2YXJpYWJsZXMuXG4gKi9cbmVudmpzLnJlc2V0ID0gZnVuY3Rpb24ob3B0cykge1xuICBlbnZqcy5fY2xlYXJDdHgoKTtcbiAgcmV0dXJuIGVudmpzLnVwZGF0ZShvcHRzKTtcbn07XG5cbi8qKlxuICogRW5zdXJlcyB0aGF0IHNvbWUgdmFyaWFibGUgb3Igc2V0IG9mIHZhcmlhYmxlcyBhcmUgZGVmaW5lZCBpbiB0aGVcbiAqIGN1cnJlbnQgY29udGV4dC4gQWxsb3dzIGEgbGlzdCBvZiBkZWZpbmVkIHZhcmlhYmxlcyB0byBiZSBwYXNzZWQsIGFzXG4gKiB3ZWxsIGFzIG9wdGlvbnMgdGhhdCBkZWZpbmUgd2hhdCBoYXBwZW5zIHdoZW4gdGhlcmUgaXMgYSBtaXNzaW5nXG4gKiB2YXJpYWJsZS4gQnkgZGVmYXVsdCBhIG1pc3Mgd2lsbCBleGl0IHRoZSBwcm9jZXNzIHdpdGggYW4gZXhpdCB2YWx1ZVxuICogb2YgMS5cbiAqIEBwYXJhbSB7c3RyaW5nW119IFtleHBlY3RlZD1bXV0gLSBUaGUgbGlzdCBvZiB2YXJpYWJsZSBuYW1lcyB3ZSBleHBlY3RcbiAqICAgICAgICAgICAgICAgICAgIHRvIGhhdmUgYmVlbiBkZWZpbmVkLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gYWN0dWFsIC0gSWYgcGFzc2VkLCB0aGlzIGlzIHRoZSBsaXN0IG9mIGRlZmluZWRcbiAqICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlIG5hbWVzIHdlIGNoZWNrIGFnYWluc3QgKGluc3RlYWQgb2YgdGhvc2VcbiAqICAgICAgICAgICAgICAgICAgIGRlZmluZWQgaW4gdGhlIGN1cnJlbnQgY29udGV4dCkuXG4gKiBAcGFyYW0ge09iamVjdH0gICBvcHRzIC0gT3B0aW9ucy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gIFtvcHRzLnNpbGVudD1mYWxzZV0gLSBXaGV0aGVyIG9yIG5vdCB0byBsb2cgbWlzc2luZ1xuICogICAgICAgICAgICAgICAgICAgdmFyaWFibGUgbmFtZXMuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICBbb3B0cy5leGl0T25NaXNzPXRydWVdIC0gV2hldGhlciBvciBub3QgdG8gZXhpdCB0aGVcbiAqICAgICAgICAgICAgICAgICAgIHByb2Nlc3MgaWYgYW55IG5hbWVzIGFyZSBtaXNzaW5nLlxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgYWxsIHRoZSBleHBlY3RlZCB2YXJpYWJsZXMgYXJlIGRlZmluZWQsXG4gKiAgICAgICAgICAgICAgICAgICAgZmFsc2Ugb3RoZXJ3aXNlLiBPbmx5IHJ1bnMgaWYgdHJ1ZSBvciBpZiB0aGVcbiAqICAgICAgICAgICAgICAgICAgICBleGl0T25NaXNzIG9wdGlvbiBpcyBzZXQgdG8gZmFsc2UuXG4gKlxuICogQHRvZG8gQWRkIGFuIG9wdGlvbiB0byB0aHJvd09uTWlzcywgdGhhdCBjb2xsZWN0cyB0aGUgZXJyb3IgbWVzc2FnZXNcbiAqICAgICAgIGFuZCB0aGVuIHRocm93cyBhbiBlcnJvciBhdCB0aGUgZW5kIG9mIHRoZSBmdW5jdGlvbi5cbiAqL1xuZW52anMuY2hlY2sgPSBmdW5jdGlvbihcbiAgZXhwZWN0ZWQgPSBbXSxcbiAgYWN0dWFsID0gW10sXG4gIG9wdHMgPSB7XG4gICAgbG9nT25NaXNzOiBmYWxzZSxcbiAgICBleGl0T25NaXNzOiBmYWxzZSxcbiAgICB0aHJvd09uTWlzczogZmFsc2UsXG4gIH1cbikge1xuICBpZiAoIWlzQXJyYXlMaXRlcmFsKGV4cGVjdGVkKSB8fCAhaXNBcnJheUxpdGVyYWwoYWN0dWFsKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCB2YWx1ZXMgdG8gY2hlY2snKTtcbiAgfVxuXG4gIGNvbnN0IG1pc3NpbmcgPSBbXTtcbiAgZXhwZWN0ZWQuZm9yRWFjaCh2ID0+IHtcbiAgICBpZiAoIWFjdHVhbC5pbmNsdWRlcyh2KSkge1xuICAgICAgbWlzc2luZy5wdXNoKHYpO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKG1pc3NpbmcubGVuZ3RoICE9PSAwICYmIG9wdHMubG9nT25NaXNzKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgIG1pc3NpbmcubWFwKHYgPT4gYFtFUlJdIG1pc3NpbmcgcmVxdWlyZWQgZW52IHZhciB7JHt2fX1gKS5qb2luKCdcXG4nKVxuICAgICk7XG4gIH1cblxuICBpZiAobWlzc2luZy5sZW5ndGggIT09IDAgJiYgb3B0cy50aHJvd09uTWlzcykge1xuICAgIHRocm93IG5ldyBFcnJvcihgbWlzc2luZyByZXF1aXJlZCBlbnYgdmFyczogJHttaXNzaW5nLmpvaW4oJywgJyl9YCk7XG4gIH1cblxuICBpZiAobWlzc2luZy5sZW5ndGggIT09IDAgJiYgb3B0cy5leGl0T25NaXNzKSB7XG4gICAgZW52anMuX2V4aXQoKTtcbiAgfVxuXG4gIHJldHVybiBtaXNzaW5nLmxlbmd0aCA9PT0gMDtcbn07XG5cbmVudmpzLmVuc3VyZSA9IGZ1bmN0aW9uKGV4cGVjdGVkKSB7XG4gIHJldHVybiBlbnZqcy5jaGVjayhleHBlY3RlZCwgT2JqZWN0LmtleXModmFsdWVzRnJvbShtZW1vLmN0eCkpLCB7XG4gICAgdGhyb3dPbk1pc3M6IHRydWUsXG4gIH0pO1xufTtcblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBEb3RlbnZSZXN1bHRcbiAqIEBwcm9wZXJ0eSB7RW52TGlzdH0gZG90ZW52IC0gVGhlIGxpc3Qgb2YgZW52aXJvbm1lbnRhbCB2YXJpYWJsZXNcbiAqICAgICAgICAgICAgICAgICAgICAgbG9hZGVkLCBpZiBhbnksIGZyb20gdGhlIC5lbnYgZmlsZS5cbiAqIEBwcm9wZXJ0eSB7RXJyb3J9ICAgZXJyb3IgLSBBbnkgZXJyb3IgKHVzdWFsbHksIG1pc3NpbmcgLmVudiBmaWxlKVxuICogICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZWQgYnkgcnVubmluZyBkb3RlbnYuY29uZmlnKCkuXG4gKi9cblxuLyoqXG4gKiBMb2FkcyB2YXJpYWJsZXMgZnJvbSBhIC5lbnYgZmlsZS4gVXNlcyB0aGUgc3RhbmRhcmQgbW9kdWxlbiBcImRvdGVudlwiLFxuICogYnV0IGtlZXBzIHRoZSBwcm9jZXNzLmVudiBmcmVlIG9mIHRoZSB2YXJpYWJsZXMgdGhhdCBhcmUgbG9hZGVkLFxuICogYWRkaW5nIHRoZW0gdG8gdGhlIGludGVybmFsIGN0eC5kb3RlbnYgbGlzdC4gQW55IGVycm9ycyB0aGF0IGFyZVxuICogZ2VuZXJhdGVkIGFyZSBhZGRlZCB0byBjdHguZXJyb3JzLmRvdGVudiAoY3VycmVudGx5IHRoZSBvbmx5IHNvdXJjZVxuICogb2YgZXJyb3JzIGluIHRoZSBjb250ZXh0KS5cbiAqIEByZXR1cm5zIHtEb3RlbnZSZXN1bHR9XG4gKi9cbmVudmpzLmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgLy8gRW5zdXJlIHdlIGhhdmUgYSBjb3B5IG9mIHRoZSBjdXJyZW50IHByb2Nlc3MuZW52LCB0aGVuIHJ1biBkb3RlbnYuXG4gIGNvbnN0IG9wcm9jZXNzZW52ID0gY29weShwcm9jZXNzLmVudik7XG4gIGNvbnN0IHsgcGFyc2VkLCBlcnJvciB9ID0gZG90ZW52LmNvbmZpZygpO1xuXG4gIC8vIFJlc3RvcmUgdGhlIGNsZWFuLCBwcmUtZG90ZW52IHByb2Nlc3MuZW52XG4gIHByb2Nlc3MuZW52ID0gb3Byb2Nlc3NlbnY7XG5cbiAgLy8gTWVyZ2UgcGFyc2VkIGFuZCBlcnJvcnMgaW50byB0aGUgY29udGV4dC5cbiAgbWVtby5jdHguZG90ZW52ID0gY29weShtZW1vLmN0eC5kb3RlbnYsIHBhcnNlZCk7XG4gIGlmIChlcnJvcikge1xuICAgIG1lbW8uY3R4LmVycm9ycyA9IGNvcHkobWVtby5jdHguZXJyb3JzLCB7IGRvdGVudjogeyBlcnJvciB9IH0pO1xuICB9XG5cbiAgcmV0dXJuIHsgZG90ZW52OiBwYXJzZWQsIGVycm9yIH07XG59O1xuXG4vLyBMb2FkIHRoZSBjdXJyZW50IHN0YXRlIG9mIHByb2Nlc3MuZW52anMuXG5lbnZqcy5fY2xlYXJDdHgoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBlbnZqcztcbiJdLCJuYW1lcyI6WyJjb3B5IiwiT2JqZWN0IiwiYXNzaWduIiwiQXJyYXkiLCJmcm9tIiwiYXJndW1lbnRzIiwiZXhpdCIsInByb2Nlc3MiLCJtZW1vIiwiY3R4IiwiZW1wdHlDdHgiLCJkZWZhdWx0cyIsImRvdGVudiIsImNvbnN0YW50cyIsImVycm9ycyIsImNsZWFyQ3R4IiwidmFsdWVzRnJvbSIsIkVudkxpc3QiLCJtaXNzVmFsdWUiLCJuYW1lIiwiX3N0YXRpY1ZhbHVlcyIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwiY2FsbCIsImluY2x1ZGUiLCJnZW5lcmF0ZUZyb21DdHgiLCJwcm90byIsImVudmpzIiwiY3JlYXRlIiwiZGVmYXVsdE9wdGlvbnMiLCJlbnN1cmUiLCJpc09iamVjdExpdGVyYWwiLCJvYmoiLCJjb25zdHJ1Y3RvciIsImlzQXJyYXlMaXRlcmFsIiwidmFsaWRhdGVFbnZPcHRpb25zIiwib3B0aW9ucyIsIkVycm9yIiwiSlNPTiIsInN0cmluZ2lmeSIsIndoaXRlbGlzdGVkRmllbGRzIiwiaW52YWxpZEZpZWxkcyIsInByb3AiLCJpbmNsdWRlcyIsInB1c2giLCJsZW5ndGgiLCJqb2luIiwidmFsdWVzIiwiZXZlcnkiLCJpIiwidXBkYXRlIiwiX2NsZWFyQ3R4IiwiX2dlbmVyYXRlRnJvbUN0eCIsIl9lbXB0eUN0eCIsIl9leGl0IiwiX19tIiwib3B0cyIsImVudiIsImxvYWQiLCJleHBlY3RlZCIsImNoZWNrIiwia2V5cyIsImxvZ09uTWlzcyIsImV4aXRPbk1pc3MiLCJzZXQiLCJ2YWx1ZSIsInJlc2V0IiwiYWN0dWFsIiwidGhyb3dPbk1pc3MiLCJtaXNzaW5nIiwiZm9yRWFjaCIsInYiLCJjb25zb2xlIiwiZXJyb3IiLCJtYXAiLCJvcHJvY2Vzc2VudiIsImNvbmZpZyIsInBhcnNlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUEwQkEsU0FBUyxHQUFHLEVBQUUsT0FBTyxnQkFBZ0I7SUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUM7R0FDMUM7O0VBRUQsTUFBTSxPQUFPLEdBQUcsS0FBSTtFQUNwQixNQUFNLGNBQWMsR0FBRyxnQ0FBK0I7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
