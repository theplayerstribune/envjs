(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('fs'), require('path')) :
  typeof define === 'function' && define.amd ? define(['fs', 'path'], factory) :
  (global = global || self, global.envjs = factory(global.fs, global.path));
}(this, function (fs, path) { 'use strict';

  fs = fs && fs.hasOwnProperty('default') ? fs['default'] : fs;
  path = path && path.hasOwnProperty('default') ? path['default'] : path;

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
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
  function config(options /*: ?DotenvConfigOptions */) /*: DotenvConfigOutput */ {
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

  function copy() {
    return Object.assign.apply(Object, [{}].concat(_toConsumableArray(Array.from(arguments))));
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
      errors: {}
    }
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
  function () {
    function EnvList() {
      var missValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      _classCallCheck(this, EnvList);

      this.missValue = missValue;
    }

    _createClass(EnvList, [{
      key: "include",
      value: function include(name) {
        this._staticValues = copy(valuesFrom(memo.ctx));
        return Object.prototype.hasOwnProperty.call(this._staticValues, name);
      }
    }, {
      key: "includes",
      value: function includes(name) {
        return this.include(name);
      }
    }, {
      key: "get",
      value: function get(name) {
        if (!this.include(name)) {
          return this.missValue;
        }

        return this._staticValues[name];
      }
    }, {
      key: "setMissValue",
      value: function setMissValue() {
        var missValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        this.missValue = missValue;
      }
    }]);

    return EnvList;
  }();
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
    missValue: null
  };

  function isObjectLiteral(obj) {
    return _typeof(obj) === 'object' && obj.constructor === Object;
  }

  function isArrayLiteral(obj) {
    return _typeof(obj) === 'object' && obj.constructor === Array;
  }

  function validateEnvOptions(options) {
    if (!isObjectLiteral(options)) {
      throw new Error("invalid options: expected object literal, received: ".concat(JSON.stringify(options)));
    }

    var whitelistedFields = ['dotenv', 'constants', 'defaults', 'ensure', 'missValue'];
    var invalidFields = [];

    for (var prop in options) {
      if (!whitelistedFields.includes(prop)) {
        invalidFields.push(prop);
      }
    }

    if (invalidFields.length) {
      throw new Error("invalid options: includes invalid fields: ".concat(invalidFields.join(', ')));
    }

    if (options.defaults && (!isObjectLiteral(options.defaults) || !Object.values(options.defaults).every(function (i) {
      return typeof i === 'string';
    }))) {
      throw new Error("invalid option defaults: expected object literal with string keys");
    }

    if (options.constants && (!isObjectLiteral(options.constants) || !Object.values(options.constants).every(function (i) {
      return typeof i === 'string';
    }))) {
      throw new Error("invalid option constants: expected object literal with string keys");
    }

    if (options.ensure && (!isArrayLiteral(options.ensure) || !options.ensure.every(function (i) {
      return typeof i === 'string';
    }))) {
      throw new Error("invalid option ensure: expected array literal with string items");
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
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return envjs.set(options);
  }

  envjs.defaultOptions = defaultOptions;
  envjs.validateEnvOptions = validateEnvOptions;
  envjs.EnvList = EnvList;
  envjs._clearCtx = clearCtx;
  envjs._generateFromCtx = generateFromCtx;
  envjs._emptyCtx = memo.emptyCtx;
  envjs._exit = exit;
  envjs.__m = memo;

  envjs.set = function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
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
        exitOnMiss: true
      });
    }

    return obj;
  };
  /**
   * A basic getter for the internal context "ctx" value.
   * @returns {EnvContext}
   */


  envjs.ctx = function () {
    return copy(memo.ctx);
  };
  /**
   * Clears out the context and regenerates it according to the given
   * options.
   * @param {EnvOptions} [options=envjs.defaultOptions]
   * @returns {EnvList} The reset, newly-generated environmental variables.
   */


  envjs.reset = function (opts) {
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


  envjs.check = function () {
    var expected = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var actual = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
      logOnMiss: false,
      exitOnMiss: false,
      throwOnMiss: false
    };

    if (!isArrayLiteral(expected) || !isArrayLiteral(actual)) {
      throw new Error('invalid values to check');
    }

    var missing = [];
    expected.forEach(function (v) {
      if (!actual.includes(v)) {
        missing.push(v);
      }
    });

    if (missing.length !== 0 && opts.logOnMiss) {
      console.error(missing.map(function (v) {
        return "[ERR] missing required env var {".concat(v, "}");
      }).join('\n'));
    }

    if (missing.length !== 0 && opts.throwOnMiss) {
      throw new Error("missing required env vars: ".concat(missing.join(', ')));
    }

    if (missing.length !== 0 && opts.exitOnMiss) {
      envjs._exit();
    }

    return missing.length === 0;
  };

  envjs.ensure = function (expected) {
    return envjs.check(expected, Object.keys(valuesFrom(memo.ctx)), {
      throwOnMiss: true
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


  envjs.load = function () {
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
          error: error
        }
      });
    }

    return {
      dotenv: parsed,
      error: error
    };
  }; // Load the current state of process.envjs.


  envjs._clearCtx();

  var src = envjs;

  return src;

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJub2RlX21vZHVsZXMvZG90ZW52L2xpYi9tYWluLmpzIiwic3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG4vKjo6XG5cbnR5cGUgRG90ZW52UGFyc2VPcHRpb25zID0ge1xuICBkZWJ1Zz86IGJvb2xlYW5cbn1cblxuLy8ga2V5cyBhbmQgdmFsdWVzIGZyb20gc3JjXG50eXBlIERvdGVudlBhcnNlT3V0cHV0ID0geyBbc3RyaW5nXTogc3RyaW5nIH1cblxudHlwZSBEb3RlbnZDb25maWdPcHRpb25zID0ge1xuICBwYXRoPzogc3RyaW5nLCAvLyBwYXRoIHRvIC5lbnYgZmlsZVxuICBlbmNvZGluZz86IHN0cmluZywgLy8gZW5jb2Rpbmcgb2YgLmVudiBmaWxlXG4gIGRlYnVnPzogc3RyaW5nIC8vIHR1cm4gb24gbG9nZ2luZyBmb3IgZGVidWdnaW5nIHB1cnBvc2VzXG59XG5cbnR5cGUgRG90ZW52Q29uZmlnT3V0cHV0ID0ge1xuICBwYXJzZWQ/OiBEb3RlbnZQYXJzZU91dHB1dCxcbiAgZXJyb3I/OiBFcnJvclxufVxuXG4qL1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcblxuZnVuY3Rpb24gbG9nIChtZXNzYWdlIC8qOiBzdHJpbmcgKi8pIHtcbiAgY29uc29sZS5sb2coYFtkb3RlbnZdW0RFQlVHXSAke21lc3NhZ2V9YClcbn1cblxuY29uc3QgTkVXTElORSA9ICdcXG4nXG5jb25zdCBSRV9JTklfS0VZX1ZBTCA9IC9eXFxzKihbXFx3Li1dKylcXHMqPVxccyooLiopP1xccyokL1xuY29uc3QgUkVfTkVXTElORVMgPSAvXFxcXG4vZ1xuY29uc3QgTkVXTElORVNfTUFUQ0ggPSAvXFxufFxccnxcXHJcXG4vXG5cbi8vIFBhcnNlcyBzcmMgaW50byBhbiBPYmplY3RcbmZ1bmN0aW9uIHBhcnNlIChzcmMgLyo6IHN0cmluZyB8IEJ1ZmZlciAqLywgb3B0aW9ucyAvKjogP0RvdGVudlBhcnNlT3B0aW9ucyAqLykgLyo6IERvdGVudlBhcnNlT3V0cHV0ICovIHtcbiAgY29uc3QgZGVidWcgPSBCb29sZWFuKG9wdGlvbnMgJiYgb3B0aW9ucy5kZWJ1ZylcbiAgY29uc3Qgb2JqID0ge31cblxuICAvLyBjb252ZXJ0IEJ1ZmZlcnMgYmVmb3JlIHNwbGl0dGluZyBpbnRvIGxpbmVzIGFuZCBwcm9jZXNzaW5nXG4gIHNyYy50b1N0cmluZygpLnNwbGl0KE5FV0xJTkVTX01BVENIKS5mb3JFYWNoKGZ1bmN0aW9uIChsaW5lLCBpZHgpIHtcbiAgICAvLyBtYXRjaGluZyBcIktFWScgYW5kICdWQUwnIGluICdLRVk9VkFMJ1xuICAgIGNvbnN0IGtleVZhbHVlQXJyID0gbGluZS5tYXRjaChSRV9JTklfS0VZX1ZBTClcbiAgICAvLyBtYXRjaGVkP1xuICAgIGlmIChrZXlWYWx1ZUFyciAhPSBudWxsKSB7XG4gICAgICBjb25zdCBrZXkgPSBrZXlWYWx1ZUFyclsxXVxuICAgICAgLy8gZGVmYXVsdCB1bmRlZmluZWQgb3IgbWlzc2luZyB2YWx1ZXMgdG8gZW1wdHkgc3RyaW5nXG4gICAgICBsZXQgdmFsID0gKGtleVZhbHVlQXJyWzJdIHx8ICcnKVxuICAgICAgY29uc3QgZW5kID0gdmFsLmxlbmd0aCAtIDFcbiAgICAgIGNvbnN0IGlzRG91YmxlUXVvdGVkID0gdmFsWzBdID09PSAnXCInICYmIHZhbFtlbmRdID09PSAnXCInXG4gICAgICBjb25zdCBpc1NpbmdsZVF1b3RlZCA9IHZhbFswXSA9PT0gXCInXCIgJiYgdmFsW2VuZF0gPT09IFwiJ1wiXG5cbiAgICAgIC8vIGlmIHNpbmdsZSBvciBkb3VibGUgcXVvdGVkLCByZW1vdmUgcXVvdGVzXG4gICAgICBpZiAoaXNTaW5nbGVRdW90ZWQgfHwgaXNEb3VibGVRdW90ZWQpIHtcbiAgICAgICAgdmFsID0gdmFsLnN1YnN0cmluZygxLCBlbmQpXG5cbiAgICAgICAgLy8gaWYgZG91YmxlIHF1b3RlZCwgZXhwYW5kIG5ld2xpbmVzXG4gICAgICAgIGlmIChpc0RvdWJsZVF1b3RlZCkge1xuICAgICAgICAgIHZhbCA9IHZhbC5yZXBsYWNlKFJFX05FV0xJTkVTLCBORVdMSU5FKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZW1vdmUgc3Vycm91bmRpbmcgd2hpdGVzcGFjZVxuICAgICAgICB2YWwgPSB2YWwudHJpbSgpXG4gICAgICB9XG5cbiAgICAgIG9ialtrZXldID0gdmFsXG4gICAgfSBlbHNlIGlmIChkZWJ1Zykge1xuICAgICAgbG9nKGBkaWQgbm90IG1hdGNoIGtleSBhbmQgdmFsdWUgd2hlbiBwYXJzaW5nIGxpbmUgJHtpZHggKyAxfTogJHtsaW5lfWApXG4gICAgfVxuICB9KVxuXG4gIHJldHVybiBvYmpcbn1cblxuLy8gUG9wdWxhdGVzIHByb2Nlc3MuZW52IGZyb20gLmVudiBmaWxlXG5mdW5jdGlvbiBjb25maWcob3B0aW9ucyAvKjogP0RvdGVudkNvbmZpZ09wdGlvbnMgKi8pIC8qOiBEb3RlbnZDb25maWdPdXRwdXQgKi8ge1xuICBsZXQgZG90ZW52UGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnLmVudicpXG4gIGxldCBlbmNvZGluZyAvKjogc3RyaW5nICovID0gJ3V0ZjgnXG4gIGxldCBkZWJ1ZyA9IGZhbHNlXG5cbiAgaWYgKG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5wYXRoICE9IG51bGwpIHtcbiAgICAgIGRvdGVudlBhdGggPSBvcHRpb25zLnBhdGhcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZW5jb2RpbmcgIT0gbnVsbCkge1xuICAgICAgZW5jb2RpbmcgPSBvcHRpb25zLmVuY29kaW5nXG4gICAgfVxuICAgIGlmIChvcHRpb25zLmRlYnVnICE9IG51bGwpIHtcbiAgICAgIGRlYnVnID0gdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gc3BlY2lmeWluZyBhbiBlbmNvZGluZyByZXR1cm5zIGEgc3RyaW5nIGluc3RlYWQgb2YgYSBidWZmZXJcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZShmcy5yZWFkRmlsZVN5bmMoZG90ZW52UGF0aCwgeyBlbmNvZGluZyB9KSwgeyBkZWJ1ZyB9KVxuXG4gICAgT2JqZWN0LmtleXMocGFyc2VkKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb2Nlc3MuZW52LCBrZXkpKSB7XG4gICAgICAgIHByb2Nlc3MuZW52W2tleV0gPSBwYXJzZWRba2V5XVxuICAgICAgfSBlbHNlIGlmIChkZWJ1Zykge1xuICAgICAgICBsb2coYFwiJHtrZXl9XCIgaXMgYWxyZWFkeSBkZWZpbmVkIGluIFxcYHByb2Nlc3MuZW52XFxgIGFuZCB3aWxsIG5vdCBiZSBvdmVyd3JpdHRlbmApXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiB7IHBhcnNlZCB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4geyBlcnJvcjogZSB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMuY29uZmlnID0gY29uZmlnXG5tb2R1bGUuZXhwb3J0cy5wYXJzZSA9IHBhcnNlXG4iLCJjb25zdCBkb3RlbnYgPSByZXF1aXJlKCdkb3RlbnYnKTtcblxuZnVuY3Rpb24gY29weSgpIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIC4uLkFycmF5LmZyb20oYXJndW1lbnRzKSk7XG59XG5cbmZ1bmN0aW9uIGV4aXQoKSB7XG4gIHByb2Nlc3MuZXhpdCgxKTtcbn1cblxuLyoqXG4gKiBBIGRpY3Rpb25hcnkgb2YgZW52aXJvbm1lbnRhbCB2YXJpYWJsZXMuXG4gKiBAdHlwZWRlZiB7T2JqZWN0LjxzdHJpbmcsIHN0cmluZz59IEVudkxpc3RcbiAqXG4gKiBAdG9kbyBVcGdyYWRlIHRvIGEgY2xhc3MgdGhhdCBpbXBsZW1lbnRzIGVudmpzLkxJU1RfUFJPVE8gYmVsb3cuXG4gKi9cblxuLyoqXG4gKiBBIGRlc2NyaXB0aXZlIGVudmlyb25tZW50IGNvbnRleHQgdGhhdCBzdG9yZXMgdGhlIGRlZmluaXRpb25zIGZvclxuICogZW52aXJvbm1lbnRhbCB2YXJpYWJsZXMgYnkgdGhlaXIgc291cmNlLCBhcyB3ZWxsIGFzIGFueSBlcnJvcnMgdGhhdFxuICogaGF2ZSBiZWVuIGdlbmVyYXRlZCB3aGlsZSBjb21waWxpbmcgdGhlbS5cbiAqIEB0eXBlZGVmIHtPYmplY3R9IEVudkNvbnRleHRcbiAqIEBwcm9wZXJ0eSB7RW52TGlzdH0gZGVmYXVsdHMgLSBEZWZhdWx0IGVudmlyb25tZW50YWwgdmFyaWFibGVzIHRoYXRcbiAqICAgICAgICAgICAgICAgICAgICAgYXJlIG92ZXJyaWRlbiBieSBhbGwgb3RoZXIgZXhwbGljaXR5IHNldFxuICogICAgICAgICAgICAgICAgICAgICBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcy5cbiAqIEBwcm9wZXJ0eSB7RW52TGlzdH0gY29uc3RhbnRzIC0gQ29uc3RhbnQgZW52aXJvbm1lbnRhbCB2YXJpYWJsZXMgdGhhdFxuICogICAgICAgICAgICAgICAgICAgICBjYW4gbm90IGJlIG92ZXJyaWRlbi5cbiAqIEBwcm9wZXJ0eSB7RW52TGlzdH0gcHJvY2VzcyAtIFRoZSBjb250ZW50IG9mIHByb2Nlc3MuZW52IGFzIG9mIHRoZSBsYXN0XG4gKiAgICAgICAgICAgICAgICAgICAgIGNhbGwgdG8gY2xlYXJDdHguXG4gKiBAcHJvcGVydHkge0Vudkxpc3R9IGRvdGVudiAtIEFsbCBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcyBsb2FkZWQgYnkgdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgIGRvdGVudiBtb2R1bGUuXG4gKiBAcHJvcGVydHkge09iamVjdH0gIGVycm9ycyAtIEEgZGVwb3NpdG9yeSBmb3IgZXJyb3JzIGdlbmVyYXRlZCB3aGVuXG4gKiAgICAgICAgICAgICAgICAgICAgIGxvYWRpbmcgdGhlIGVudmlyb25tZW50LlxuICovXG5cbi8qKlxuICogVGhlIG1lbW9pemVkIGVudmlyb25tZW50IGNvbnRleHQgdGhhdCB3ZSBtdXRhdGUgYW5kIHNoYXJlLlxuICogQHR5cGUge0VudkNvbnRleHR9XG4gKi9cbmNvbnN0IG1lbW8gPSB7XG4gIGN0eDogbnVsbCxcbiAgZW1wdHlDdHg6IHtcbiAgICBkZWZhdWx0czoge30sXG4gICAgZG90ZW52OiB7fSxcbiAgICBwcm9jZXNzOiB7fSxcbiAgICBjb25zdGFudHM6IHt9LFxuICAgIGVycm9yczoge30sXG4gIH0sXG59O1xuXG4vKipcbiAqIFJlc2V0cyB0aGUgc3RhdGUgb2YgdGhlIGNvbnRleHQuXG4gKiBAcHJvdGVjdGVkXG4gKi9cbmZ1bmN0aW9uIGNsZWFyQ3R4KCkge1xuICBtZW1vLmN0eCA9IHt9O1xuICBtZW1vLmN0eC5kZWZhdWx0cyA9IHt9O1xuICBtZW1vLmN0eC5kb3RlbnYgPSB7fTtcbiAgbWVtby5jdHgucHJvY2VzcyA9IHt9O1xuICBtZW1vLmN0eC5jb25zdGFudHMgPSB7fTtcbiAgbWVtby5jdHguZXJyb3JzID0ge307XG59XG5cbmZ1bmN0aW9uIHZhbHVlc0Zyb20oY3R4KSB7XG4gIHJldHVybiBjb3B5KGN0eC5kZWZhdWx0cywgY3R4LmRvdGVudiwgY3R4LnByb2Nlc3MsIGN0eC5jb25zdGFudHMpO1xufVxuXG4vKipcbiAqIFRoZSBjbGFzcyBmb3IgYWxsIEVudkxpc3Qgb2JqZWN0cy4gQWxsb3dzIHVzIHRvIGRlcmVmZXJlbmNlIHZhcmlhYmxlc1xuICogYnkgbmFtZSBhbmQgY29udHJvbCB0aGUgdmFsdWUgdGhhdCBpcyByZXR1cm5lZCB3aGVuIHRoZSB2YXJpYWJsZSBkb2VzIG5vdFxuICogZXhpc3QuXG4gKlxuICogQHByb3BlcnR5IHtPYmplY3R9IHZhbHVlcyAtIEEgYmFzaWMgb2JqZWN0L2RpY3QgdmVyc2lvbiBvZiB0aGUgRW52TGlzdC5cbiAqIEBwcm9wZXJ0eSB7Kn0gICAgICBtaXNzVmFsdWUgLSBUaGUgdmFsdWUgcmV0dXJuZWQgb24gYSBtaXNzIHdoZW5cbiAqICAgICAgICAgICAgICAgICAgICBjYWxsaW5nIEVudkxpc3QuZ2V0KCkuXG4gKiBAbWV0aG9kIGluY2x1ZGUoPHN0cmluZz4pIC0gQWNjZXNzZXMgdGhlIHZhbHVlcyBkaWN0IGFuZCByZXR1cm5zXG4gKiAgICAgICAgIHdoZXRoZXIgdGhlIGdpdmVuIG5hbWUgaXMgaW4gaXQuXG4gKiBAbWV0aG9kIGluY2x1ZGVzKDxzdHJpbmc+KSDigJMgQW4gYWxpYXMgb2YgaW5jbHVkZSgpLlxuICogQG1ldGhvZCBnZXQoPHN0cmluZz4pIC0gQWNjZXNzZXMgdGhlIHZhbHVlcyBkaWN0IGFuZCByZXR1cm5zIHRoZVxuICogICAgICAgICBkZXJlZmVyZW5jZWQgdmFyaWFibGUsIG9yIHRoZSBtaXNzVmFsdWUgaWYgbm90IGZvdW5kLlxuICogQG1ldGhvZCBzZXRNaXNzVmFsdWUoPCo+KSAtIFNldHMgdGhlIG1pc3NpbmcgcmV0dXJuIHZhbHVlLlxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgY29uc3QgZW52dmFycyA9IGVudih7IGNvbnN0YW50czogeyBVU0VSTkFNRTogJ3N0YXJidWNrJyB9IH0pO1xuICogICAgIGVudnZhcnMuc2V0TWlzc1ZhbHVlKCduL2EnKTtcbiAqICAgICBlbnZ2YXJzLmdldCgnVVNFUk5BTUUnKVxuICogICAgIC8vID0+ICdzdGFyYnVjaydcbiAqICAgICBlbnZ2YXJzLmdldCgnUEFTU1dPUkQnKVxuICogICAgIC8vID0+ICduL2EnXG4gKiAgICAgZW52dmFycy5QQVNTV09SRFxuICogICAgIC8vID0+IG51bGxcbiAqXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5Zb3UgY2FuIHBhc3MgYSBtaXNzaW5nIHJldHVybiB2YWx1ZSBvbiBnZW5lcmF0aW9uOjwvY2FwdGlvbj5cbiAqICAgICBjb25zdCBlbnZ2YXJzID0gZW52KHtcbiAqICAgICAgIGNvbnN0YW50czogeyBVU0VSTkFNRTogJ3N0YXJidWNrJyB9LFxuICogICAgICAgbWlzc1ZhbHVlOiAnbi9hJyxcbiAqICAgICB9KTtcbiAqICAgICBlbnZ2YXJzLmdldCgnUEFTU1dPUkQnKVxuICogICAgIC8vID0+ICduL2EnXG4gKi9cbmNsYXNzIEVudkxpc3Qge1xuICBjb25zdHJ1Y3RvcihtaXNzVmFsdWUgPSBudWxsKSB7XG4gICAgdGhpcy5taXNzVmFsdWUgPSBtaXNzVmFsdWU7XG4gIH1cblxuICBpbmNsdWRlKG5hbWUpIHtcbiAgICB0aGlzLl9zdGF0aWNWYWx1ZXMgPSBjb3B5KHZhbHVlc0Zyb20obWVtby5jdHgpKTtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuX3N0YXRpY1ZhbHVlcywgbmFtZSk7XG4gIH1cblxuICBpbmNsdWRlcyhuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5jbHVkZShuYW1lKTtcbiAgfVxuXG4gIGdldChuYW1lKSB7XG4gICAgaWYgKCF0aGlzLmluY2x1ZGUobmFtZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLm1pc3NWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3N0YXRpY1ZhbHVlc1tuYW1lXTtcbiAgfVxuXG4gIHNldE1pc3NWYWx1ZShtaXNzVmFsdWUgPSBudWxsKSB7XG4gICAgdGhpcy5taXNzVmFsdWUgPSBtaXNzVmFsdWU7XG4gIH1cbn1cblxuLyoqXG4gKiBNZXJnZSB0aGUgZW52aXJvbm1lbnRhbCB2YXJpYWJsZXMgaW4gdGhlIGNvbnRleHQgdG9nZXRoZXIgaW50byBhXG4gKiBzaW5nbGUgZW52aXJvbm1lbnRhbCBvYmplY3QuIEFkZHMgYSBwcm90b3R5cGUgdG8gdGhlIG9iamVjdCB3aXRoIGFcbiAqIGZldyBoZWxwZXIgZnVuY3Rpb25zLlxuICogQHByb3RlY3RlZFxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUZyb21DdHgobWlzc1ZhbHVlKSB7XG4gIGNvbnN0IHByb3RvID0gbmV3IGVudmpzLkVudkxpc3QobWlzc1ZhbHVlKTtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShwcm90byksIHZhbHVlc0Zyb20obWVtby5jdHgpKTtcbn1cblxuLyoqXG4gKiBPcHRpb25zIGZvciBjYWxscyB0byBnZW5lcmF0ZSBhIG5ldyBjb250ZXh0LlxuICogQHR5cGVkZWYge09iamVjdH0gRW52T3B0aW9uc1xuICogQHByb3BlcnR5IHtib29sZWFufSAgZG90ZW52IC0gV2hldGhlciBvciBub3QgdG8gcnVuIGEgZG90ZW52IGNvbmZpZ1xuICogICAgICAgICAgICAgICAgICAgICAgbG9hZC5cbiAqIEBwcm9wZXJ0eSB7RW52TGlzdH0gIGRlZmF1bHRzIC0gQSBsaXN0IG9mIGRlZmF1bHQgZW52aXJvbm1lbnRhbFxuICogICAgICAgICAgICAgICAgICAgICAgdmFyaWFibGVzLlxuICogQHByb3BlcnR5IHtFbnZMaXN0fSAgY29uc3RhbnRzIC0gQSBsaXN0IG9mIGNvbnN0YW50IGVudmlyb25tZW50YWxcbiAqICAgICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlcy5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nW119IGVuc3VyZSAtIEEgbGlzdCBlbnZpcm9ubWVudGFsIHZhcmlhYmxlIG5hbWVzIHRoYXRcbiAqICAgICAgICAgICAgICAgICAgICAgIG11c3QgZXhpc3QgaW4gdGhlIGNvbnRleHQsIG9yIHdlIGV4aXQgdGhlIHByb2dyYW0uXG4gKiBAcHJvcGVydHkgeyp9ICAgICAgICBtaXNzVmFsdWUgLSBUaGUgdmFsdWUgdGhhdCBpcyByZXR1cm5lZCB3aGVuIHdlXG4gKiAgICAgICAgICAgICAgICAgICAgICBjYWxsIEVudkxpc3QuZ2V0KCkgb24gYSBtaXNzaW5nIHZhbHVlLlxuICovXG5jb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgZG90ZW52OiB0cnVlLFxuICBjb25zdGFudHM6IHt9LFxuICBkZWZhdWx0czoge30sXG4gIGVuc3VyZTogW10sXG4gIG1pc3NWYWx1ZTogbnVsbCxcbn07XG5cbmZ1bmN0aW9uIGlzT2JqZWN0TGl0ZXJhbChvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0O1xufVxuXG5mdW5jdGlvbiBpc0FycmF5TGl0ZXJhbChvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gQXJyYXk7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlRW52T3B0aW9ucyhvcHRpb25zKSB7XG4gIGlmICghaXNPYmplY3RMaXRlcmFsKG9wdGlvbnMpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYGludmFsaWQgb3B0aW9uczogZXhwZWN0ZWQgb2JqZWN0IGxpdGVyYWwsIHJlY2VpdmVkOiAke0pTT04uc3RyaW5naWZ5KFxuICAgICAgICBvcHRpb25zXG4gICAgICApfWBcbiAgICApO1xuICB9XG4gIGNvbnN0IHdoaXRlbGlzdGVkRmllbGRzID0gW1xuICAgICdkb3RlbnYnLFxuICAgICdjb25zdGFudHMnLFxuICAgICdkZWZhdWx0cycsXG4gICAgJ2Vuc3VyZScsXG4gICAgJ21pc3NWYWx1ZScsXG4gIF07XG4gIGNvbnN0IGludmFsaWRGaWVsZHMgPSBbXTtcbiAgZm9yIChjb25zdCBwcm9wIGluIG9wdGlvbnMpIHtcbiAgICBpZiAoIXdoaXRlbGlzdGVkRmllbGRzLmluY2x1ZGVzKHByb3ApKSB7XG4gICAgICBpbnZhbGlkRmllbGRzLnB1c2gocHJvcCk7XG4gICAgfVxuICB9XG4gIGlmIChpbnZhbGlkRmllbGRzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBpbnZhbGlkIG9wdGlvbnM6IGluY2x1ZGVzIGludmFsaWQgZmllbGRzOiAke2ludmFsaWRGaWVsZHMuam9pbignLCAnKX1gXG4gICAgKTtcbiAgfVxuXG4gIGlmIChcbiAgICBvcHRpb25zLmRlZmF1bHRzICYmXG4gICAgKCFpc09iamVjdExpdGVyYWwob3B0aW9ucy5kZWZhdWx0cykgfHxcbiAgICAgICFPYmplY3QudmFsdWVzKG9wdGlvbnMuZGVmYXVsdHMpLmV2ZXJ5KGkgPT4gdHlwZW9mIGkgPT09ICdzdHJpbmcnKSlcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYGludmFsaWQgb3B0aW9uIGRlZmF1bHRzOiBleHBlY3RlZCBvYmplY3QgbGl0ZXJhbCB3aXRoIHN0cmluZyBrZXlzYFxuICAgICk7XG4gIH1cblxuICBpZiAoXG4gICAgb3B0aW9ucy5jb25zdGFudHMgJiZcbiAgICAoIWlzT2JqZWN0TGl0ZXJhbChvcHRpb25zLmNvbnN0YW50cykgfHxcbiAgICAgICFPYmplY3QudmFsdWVzKG9wdGlvbnMuY29uc3RhbnRzKS5ldmVyeShpID0+IHR5cGVvZiBpID09PSAnc3RyaW5nJykpXG4gICkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBpbnZhbGlkIG9wdGlvbiBjb25zdGFudHM6IGV4cGVjdGVkIG9iamVjdCBsaXRlcmFsIHdpdGggc3RyaW5nIGtleXNgXG4gICAgKTtcbiAgfVxuXG4gIGlmIChcbiAgICBvcHRpb25zLmVuc3VyZSAmJlxuICAgICghaXNBcnJheUxpdGVyYWwob3B0aW9ucy5lbnN1cmUpIHx8XG4gICAgICAhb3B0aW9ucy5lbnN1cmUuZXZlcnkoaSA9PiB0eXBlb2YgaSA9PT0gJ3N0cmluZycpKVxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgaW52YWxpZCBvcHRpb24gZW5zdXJlOiBleHBlY3RlZCBhcnJheSBsaXRlcmFsIHdpdGggc3RyaW5nIGl0ZW1zYFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgc2V0IG9mIGVudmlyb25tZW50YWwgdmFyaWFibGVzIGZyb20gdGhlIGN1cnJlbnQgY29udGV4dCxcbiAqIGFmdGVyIGFwcGx5aW5nIGFsbCBwYXNzZWQgb3B0aW9ucy4gSWYgYSBzZXQgb2YgbmFtZXMgd2Ugd2FudCB0byBlbnN1cmVcbiAqIGV4aXN0IGFyZSBwYXNzZWQsIHdpbGwgYXBwbHkgdGhlc2UgYWZ0ZXIgdGhlIGxpc3QgaXMgZ2VuZXJhdGVkLlxuICogQHBhcmFtIHtFbnZPcHRpb25zfSBbb3B0aW9ucz1lbnZqcy5kZWZhdWx0T3B0aW9uc11cbiAqIEByZXR1cm5zIHtFbnZMaXN0fSBUaGUgcmVzZXQsIG5ld2x5LWdlbmVyYXRlZCBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcy5cbiAqL1xuZnVuY3Rpb24gZW52anMob3B0aW9ucyA9IHt9KSB7XG4gIHJldHVybiBlbnZqcy5zZXQob3B0aW9ucyk7XG59XG5lbnZqcy5kZWZhdWx0T3B0aW9ucyA9IGRlZmF1bHRPcHRpb25zO1xuZW52anMudmFsaWRhdGVFbnZPcHRpb25zID0gdmFsaWRhdGVFbnZPcHRpb25zO1xuZW52anMuRW52TGlzdCA9IEVudkxpc3Q7XG5lbnZqcy5fY2xlYXJDdHggPSBjbGVhckN0eDtcbmVudmpzLl9nZW5lcmF0ZUZyb21DdHggPSBnZW5lcmF0ZUZyb21DdHg7XG5lbnZqcy5fZW1wdHlDdHggPSBtZW1vLmVtcHR5Q3R4O1xuZW52anMuX2V4aXQgPSBleGl0O1xuZW52anMuX19tID0gbWVtbztcblxuZW52anMuc2V0ID0gZnVuY3Rpb24ob3B0aW9ucyA9IHt9KSB7XG4gIGVudmpzLnZhbGlkYXRlRW52T3B0aW9ucyhvcHRpb25zKTtcbiAgY29uc3Qgb3B0cyA9IGNvcHkoZW52anMuZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gIG1lbW8uY3R4LnByb2Nlc3MgPSBjb3B5KG1lbW8uY3R4LnByb2Nlc3MsIHByb2Nlc3MuZW52KTtcbiAgbWVtby5jdHguZGVmYXVsdHMgPSBjb3B5KG1lbW8uY3R4LmRlZmF1bHRzLCBvcHRzLmRlZmF1bHRzKTtcbiAgbWVtby5jdHguY29uc3RhbnRzID0gY29weShtZW1vLmN0eC5jb25zdGFudHMsIG9wdHMuY29uc3RhbnRzKTtcblxuICBpZiAob3B0cy5kb3RlbnYpIHtcbiAgICBlbnZqcy5sb2FkKCk7IC8vIE5PVEU6IGxvc2VzIGNvbnRyb2wgb2YgdGhyZWFkLiBSYWNlIGNvbmRpdGlvbi5cbiAgfVxuXG4gIGNvbnN0IG9iaiA9IGVudmpzLl9nZW5lcmF0ZUZyb21DdHgob3B0cy5taXNzVmFsdWUpO1xuICBjb25zdCBleHBlY3RlZCA9IG9wdHMuZW5zdXJlO1xuICBpZiAoZXhwZWN0ZWQubGVuZ3RoKSB7XG4gICAgZW52anMuY2hlY2soZXhwZWN0ZWQsIE9iamVjdC5rZXlzKG9iaiksIHtcbiAgICAgIGxvZ09uTWlzczogdHJ1ZSxcbiAgICAgIGV4aXRPbk1pc3M6IHRydWUsXG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn07XG5cbi8qKlxuICogQSBiYXNpYyBnZXR0ZXIgZm9yIHRoZSBpbnRlcm5hbCBjb250ZXh0IFwiY3R4XCIgdmFsdWUuXG4gKiBAcmV0dXJucyB7RW52Q29udGV4dH1cbiAqL1xuZW52anMuY3R4ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBjb3B5KG1lbW8uY3R4KTtcbn07XG5cbi8qKlxuICogQ2xlYXJzIG91dCB0aGUgY29udGV4dCBhbmQgcmVnZW5lcmF0ZXMgaXQgYWNjb3JkaW5nIHRvIHRoZSBnaXZlblxuICogb3B0aW9ucy5cbiAqIEBwYXJhbSB7RW52T3B0aW9uc30gW29wdGlvbnM9ZW52anMuZGVmYXVsdE9wdGlvbnNdXG4gKiBAcmV0dXJucyB7RW52TGlzdH0gVGhlIHJlc2V0LCBuZXdseS1nZW5lcmF0ZWQgZW52aXJvbm1lbnRhbCB2YXJpYWJsZXMuXG4gKi9cbmVudmpzLnJlc2V0ID0gZnVuY3Rpb24ob3B0cykge1xuICBlbnZqcy5fY2xlYXJDdHgoKTtcbiAgcmV0dXJuIGVudmpzLnNldChvcHRzKTtcbn07XG5cbi8qKlxuICogRW5zdXJlcyB0aGF0IHNvbWUgdmFyaWFibGUgb3Igc2V0IG9mIHZhcmlhYmxlcyBhcmUgZGVmaW5lZCBpbiB0aGVcbiAqIGN1cnJlbnQgY29udGV4dC4gQWxsb3dzIGEgbGlzdCBvZiBkZWZpbmVkIHZhcmlhYmxlcyB0byBiZSBwYXNzZWQsIGFzXG4gKiB3ZWxsIGFzIG9wdGlvbnMgdGhhdCBkZWZpbmUgd2hhdCBoYXBwZW5zIHdoZW4gdGhlcmUgaXMgYSBtaXNzaW5nXG4gKiB2YXJpYWJsZS4gQnkgZGVmYXVsdCBhIG1pc3Mgd2lsbCBleGl0IHRoZSBwcm9jZXNzIHdpdGggYW4gZXhpdCB2YWx1ZVxuICogb2YgMS5cbiAqIEBwYXJhbSB7c3RyaW5nW119IFtleHBlY3RlZD1bXV0gLSBUaGUgbGlzdCBvZiB2YXJpYWJsZSBuYW1lcyB3ZSBleHBlY3RcbiAqICAgICAgICAgICAgICAgICAgIHRvIGhhdmUgYmVlbiBkZWZpbmVkLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gYWN0dWFsIC0gSWYgcGFzc2VkLCB0aGlzIGlzIHRoZSBsaXN0IG9mIGRlZmluZWRcbiAqICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlIG5hbWVzIHdlIGNoZWNrIGFnYWluc3QgKGluc3RlYWQgb2YgdGhvc2VcbiAqICAgICAgICAgICAgICAgICAgIGRlZmluZWQgaW4gdGhlIGN1cnJlbnQgY29udGV4dCkuXG4gKiBAcGFyYW0ge09iamVjdH0gICBvcHRzIC0gT3B0aW9ucy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gIFtvcHRzLnNpbGVudD1mYWxzZV0gLSBXaGV0aGVyIG9yIG5vdCB0byBsb2cgbWlzc2luZ1xuICogICAgICAgICAgICAgICAgICAgdmFyaWFibGUgbmFtZXMuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICBbb3B0cy5leGl0T25NaXNzPXRydWVdIC0gV2hldGhlciBvciBub3QgdG8gZXhpdCB0aGVcbiAqICAgICAgICAgICAgICAgICAgIHByb2Nlc3MgaWYgYW55IG5hbWVzIGFyZSBtaXNzaW5nLlxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgYWxsIHRoZSBleHBlY3RlZCB2YXJpYWJsZXMgYXJlIGRlZmluZWQsXG4gKiAgICAgICAgICAgICAgICAgICAgZmFsc2Ugb3RoZXJ3aXNlLiBPbmx5IHJ1bnMgaWYgdHJ1ZSBvciBpZiB0aGVcbiAqICAgICAgICAgICAgICAgICAgICBleGl0T25NaXNzIG9wdGlvbiBpcyBzZXQgdG8gZmFsc2UuXG4gKlxuICogQHRvZG8gQWRkIGFuIG9wdGlvbiB0byB0aHJvd09uTWlzcywgdGhhdCBjb2xsZWN0cyB0aGUgZXJyb3IgbWVzc2FnZXNcbiAqICAgICAgIGFuZCB0aGVuIHRocm93cyBhbiBlcnJvciBhdCB0aGUgZW5kIG9mIHRoZSBmdW5jdGlvbi5cbiAqL1xuZW52anMuY2hlY2sgPSBmdW5jdGlvbihcbiAgZXhwZWN0ZWQgPSBbXSxcbiAgYWN0dWFsID0gW10sXG4gIG9wdHMgPSB7XG4gICAgbG9nT25NaXNzOiBmYWxzZSxcbiAgICBleGl0T25NaXNzOiBmYWxzZSxcbiAgICB0aHJvd09uTWlzczogZmFsc2UsXG4gIH1cbikge1xuICBpZiAoIWlzQXJyYXlMaXRlcmFsKGV4cGVjdGVkKSB8fCAhaXNBcnJheUxpdGVyYWwoYWN0dWFsKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCB2YWx1ZXMgdG8gY2hlY2snKTtcbiAgfVxuXG4gIGNvbnN0IG1pc3NpbmcgPSBbXTtcbiAgZXhwZWN0ZWQuZm9yRWFjaCh2ID0+IHtcbiAgICBpZiAoIWFjdHVhbC5pbmNsdWRlcyh2KSkge1xuICAgICAgbWlzc2luZy5wdXNoKHYpO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKG1pc3NpbmcubGVuZ3RoICE9PSAwICYmIG9wdHMubG9nT25NaXNzKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgIG1pc3NpbmcubWFwKHYgPT4gYFtFUlJdIG1pc3NpbmcgcmVxdWlyZWQgZW52IHZhciB7JHt2fX1gKS5qb2luKCdcXG4nKVxuICAgICk7XG4gIH1cblxuICBpZiAobWlzc2luZy5sZW5ndGggIT09IDAgJiYgb3B0cy50aHJvd09uTWlzcykge1xuICAgIHRocm93IG5ldyBFcnJvcihgbWlzc2luZyByZXF1aXJlZCBlbnYgdmFyczogJHttaXNzaW5nLmpvaW4oJywgJyl9YCk7XG4gIH1cblxuICBpZiAobWlzc2luZy5sZW5ndGggIT09IDAgJiYgb3B0cy5leGl0T25NaXNzKSB7XG4gICAgZW52anMuX2V4aXQoKTtcbiAgfVxuXG4gIHJldHVybiBtaXNzaW5nLmxlbmd0aCA9PT0gMDtcbn07XG5cbmVudmpzLmVuc3VyZSA9IGZ1bmN0aW9uKGV4cGVjdGVkKSB7XG4gIHJldHVybiBlbnZqcy5jaGVjayhleHBlY3RlZCwgT2JqZWN0LmtleXModmFsdWVzRnJvbShtZW1vLmN0eCkpLCB7XG4gICAgdGhyb3dPbk1pc3M6IHRydWUsXG4gIH0pO1xufTtcblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBEb3RlbnZSZXN1bHRcbiAqIEBwcm9wZXJ0eSB7RW52TGlzdH0gZG90ZW52IC0gVGhlIGxpc3Qgb2YgZW52aXJvbm1lbnRhbCB2YXJpYWJsZXNcbiAqICAgICAgICAgICAgICAgICAgICAgbG9hZGVkLCBpZiBhbnksIGZyb20gdGhlIC5lbnYgZmlsZS5cbiAqIEBwcm9wZXJ0eSB7RXJyb3J9ICAgZXJyb3IgLSBBbnkgZXJyb3IgKHVzdWFsbHksIG1pc3NpbmcgLmVudiBmaWxlKVxuICogICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZWQgYnkgcnVubmluZyBkb3RlbnYuY29uZmlnKCkuXG4gKi9cblxuLyoqXG4gKiBMb2FkcyB2YXJpYWJsZXMgZnJvbSBhIC5lbnYgZmlsZS4gVXNlcyB0aGUgc3RhbmRhcmQgbW9kdWxlbiBcImRvdGVudlwiLFxuICogYnV0IGtlZXBzIHRoZSBwcm9jZXNzLmVudiBmcmVlIG9mIHRoZSB2YXJpYWJsZXMgdGhhdCBhcmUgbG9hZGVkLFxuICogYWRkaW5nIHRoZW0gdG8gdGhlIGludGVybmFsIGN0eC5kb3RlbnYgbGlzdC4gQW55IGVycm9ycyB0aGF0IGFyZVxuICogZ2VuZXJhdGVkIGFyZSBhZGRlZCB0byBjdHguZXJyb3JzLmRvdGVudiAoY3VycmVudGx5IHRoZSBvbmx5IHNvdXJjZVxuICogb2YgZXJyb3JzIGluIHRoZSBjb250ZXh0KS5cbiAqIEByZXR1cm5zIHtEb3RlbnZSZXN1bHR9XG4gKi9cbmVudmpzLmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgLy8gRW5zdXJlIHdlIGhhdmUgYSBjb3B5IG9mIHRoZSBjdXJyZW50IHByb2Nlc3MuZW52LCB0aGVuIHJ1biBkb3RlbnYuXG4gIGNvbnN0IG9wcm9jZXNzZW52ID0gY29weShwcm9jZXNzLmVudik7XG4gIGNvbnN0IHsgcGFyc2VkLCBlcnJvciB9ID0gZG90ZW52LmNvbmZpZygpO1xuXG4gIC8vIFJlc3RvcmUgdGhlIGNsZWFuLCBwcmUtZG90ZW52IHByb2Nlc3MuZW52XG4gIHByb2Nlc3MuZW52ID0gb3Byb2Nlc3NlbnY7XG5cbiAgLy8gTWVyZ2UgcGFyc2VkIGFuZCBlcnJvcnMgaW50byB0aGUgY29udGV4dC5cbiAgbWVtby5jdHguZG90ZW52ID0gY29weShtZW1vLmN0eC5kb3RlbnYsIHBhcnNlZCk7XG4gIGlmIChlcnJvcikge1xuICAgIG1lbW8uY3R4LmVycm9ycyA9IGNvcHkobWVtby5jdHguZXJyb3JzLCB7IGRvdGVudjogeyBlcnJvciB9IH0pO1xuICB9XG5cbiAgcmV0dXJuIHsgZG90ZW52OiBwYXJzZWQsIGVycm9yIH07XG59O1xuXG4vLyBMb2FkIHRoZSBjdXJyZW50IHN0YXRlIG9mIHByb2Nlc3MuZW52anMuXG5lbnZqcy5fY2xlYXJDdHgoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBlbnZqcztcbiJdLCJuYW1lcyI6WyJjb3B5IiwiT2JqZWN0IiwiYXNzaWduIiwiQXJyYXkiLCJmcm9tIiwiYXJndW1lbnRzIiwiZXhpdCIsInByb2Nlc3MiLCJtZW1vIiwiY3R4IiwiZW1wdHlDdHgiLCJkZWZhdWx0cyIsImRvdGVudiIsImNvbnN0YW50cyIsImVycm9ycyIsImNsZWFyQ3R4IiwidmFsdWVzRnJvbSIsIkVudkxpc3QiLCJtaXNzVmFsdWUiLCJuYW1lIiwiX3N0YXRpY1ZhbHVlcyIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwiY2FsbCIsImluY2x1ZGUiLCJnZW5lcmF0ZUZyb21DdHgiLCJwcm90byIsImVudmpzIiwiY3JlYXRlIiwiZGVmYXVsdE9wdGlvbnMiLCJlbnN1cmUiLCJpc09iamVjdExpdGVyYWwiLCJvYmoiLCJjb25zdHJ1Y3RvciIsImlzQXJyYXlMaXRlcmFsIiwidmFsaWRhdGVFbnZPcHRpb25zIiwib3B0aW9ucyIsIkVycm9yIiwiSlNPTiIsInN0cmluZ2lmeSIsIndoaXRlbGlzdGVkRmllbGRzIiwiaW52YWxpZEZpZWxkcyIsInByb3AiLCJpbmNsdWRlcyIsInB1c2giLCJsZW5ndGgiLCJqb2luIiwidmFsdWVzIiwiZXZlcnkiLCJpIiwic2V0IiwiX2NsZWFyQ3R4IiwiX2dlbmVyYXRlRnJvbUN0eCIsIl9lbXB0eUN0eCIsIl9leGl0IiwiX19tIiwib3B0cyIsImVudiIsImxvYWQiLCJleHBlY3RlZCIsImNoZWNrIiwia2V5cyIsImxvZ09uTWlzcyIsImV4aXRPbk1pc3MiLCJyZXNldCIsImFjdHVhbCIsInRocm93T25NaXNzIiwibWlzc2luZyIsImZvckVhY2giLCJ2IiwiY29uc29sZSIsImVycm9yIiwibWFwIiwib3Byb2Nlc3NlbnYiLCJjb25maWciLCJwYXJzZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBMEJBLFNBQVMsR0FBRyxFQUFFLE9BQU8sZ0JBQWdCO0lBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFDO0dBQzFDOztFQUVELE1BQU0sT0FBTyxHQUFHLEtBQUk7RUFDcEIsTUFBTSxjQUFjLEdBQUcsZ0NBQStCO0VBQ3RELE1BQU0sV0FBVyxHQUFHLE9BQU07RUFDMUIsTUFBTSxjQUFjLEdBQUcsYUFBWTs7O0VBR25DLFNBQVMsS0FBSyxFQUFFLEdBQUcseUJBQXlCLE9BQU8sc0RBQXNEO0lBQ3ZHLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLEtBQUssRUFBQztJQUMvQyxNQUFNLEdBQUcsR0FBRyxHQUFFOzs7SUFHZCxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLGNB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
