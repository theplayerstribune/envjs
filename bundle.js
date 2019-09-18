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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJub2RlX21vZHVsZXMvZG90ZW52L2xpYi9tYWluLmpzIiwic3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG4vKjo6XG5cbnR5cGUgRG90ZW52UGFyc2VPcHRpb25zID0ge1xuICBkZWJ1Zz86IGJvb2xlYW5cbn1cblxuLy8ga2V5cyBhbmQgdmFsdWVzIGZyb20gc3JjXG50eXBlIERvdGVudlBhcnNlT3V0cHV0ID0geyBbc3RyaW5nXTogc3RyaW5nIH1cblxudHlwZSBEb3RlbnZDb25maWdPcHRpb25zID0ge1xuICBwYXRoPzogc3RyaW5nLCAvLyBwYXRoIHRvIC5lbnYgZmlsZVxuICBlbmNvZGluZz86IHN0cmluZywgLy8gZW5jb2Rpbmcgb2YgLmVudiBmaWxlXG4gIGRlYnVnPzogc3RyaW5nIC8vIHR1cm4gb24gbG9nZ2luZyBmb3IgZGVidWdnaW5nIHB1cnBvc2VzXG59XG5cbnR5cGUgRG90ZW52Q29uZmlnT3V0cHV0ID0ge1xuICBwYXJzZWQ/OiBEb3RlbnZQYXJzZU91dHB1dCxcbiAgZXJyb3I/OiBFcnJvclxufVxuXG4qL1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcblxuZnVuY3Rpb24gbG9nIChtZXNzYWdlIC8qOiBzdHJpbmcgKi8pIHtcbiAgY29uc29sZS5sb2coYFtkb3RlbnZdW0RFQlVHXSAke21lc3NhZ2V9YClcbn1cblxuY29uc3QgTkVXTElORSA9ICdcXG4nXG5jb25zdCBSRV9JTklfS0VZX1ZBTCA9IC9eXFxzKihbXFx3Li1dKylcXHMqPVxccyooLiopP1xccyokL1xuY29uc3QgUkVfTkVXTElORVMgPSAvXFxcXG4vZ1xuY29uc3QgTkVXTElORVNfTUFUQ0ggPSAvXFxufFxccnxcXHJcXG4vXG5cbi8vIFBhcnNlcyBzcmMgaW50byBhbiBPYmplY3RcbmZ1bmN0aW9uIHBhcnNlIChzcmMgLyo6IHN0cmluZyB8IEJ1ZmZlciAqLywgb3B0aW9ucyAvKjogP0RvdGVudlBhcnNlT3B0aW9ucyAqLykgLyo6IERvdGVudlBhcnNlT3V0cHV0ICovIHtcbiAgY29uc3QgZGVidWcgPSBCb29sZWFuKG9wdGlvbnMgJiYgb3B0aW9ucy5kZWJ1ZylcbiAgY29uc3Qgb2JqID0ge31cblxuICAvLyBjb252ZXJ0IEJ1ZmZlcnMgYmVmb3JlIHNwbGl0dGluZyBpbnRvIGxpbmVzIGFuZCBwcm9jZXNzaW5nXG4gIHNyYy50b1N0cmluZygpLnNwbGl0KE5FV0xJTkVTX01BVENIKS5mb3JFYWNoKGZ1bmN0aW9uIChsaW5lLCBpZHgpIHtcbiAgICAvLyBtYXRjaGluZyBcIktFWScgYW5kICdWQUwnIGluICdLRVk9VkFMJ1xuICAgIGNvbnN0IGtleVZhbHVlQXJyID0gbGluZS5tYXRjaChSRV9JTklfS0VZX1ZBTClcbiAgICAvLyBtYXRjaGVkP1xuICAgIGlmIChrZXlWYWx1ZUFyciAhPSBudWxsKSB7XG4gICAgICBjb25zdCBrZXkgPSBrZXlWYWx1ZUFyclsxXVxuICAgICAgLy8gZGVmYXVsdCB1bmRlZmluZWQgb3IgbWlzc2luZyB2YWx1ZXMgdG8gZW1wdHkgc3RyaW5nXG4gICAgICBsZXQgdmFsID0gKGtleVZhbHVlQXJyWzJdIHx8ICcnKVxuICAgICAgY29uc3QgZW5kID0gdmFsLmxlbmd0aCAtIDFcbiAgICAgIGNvbnN0IGlzRG91YmxlUXVvdGVkID0gdmFsWzBdID09PSAnXCInICYmIHZhbFtlbmRdID09PSAnXCInXG4gICAgICBjb25zdCBpc1NpbmdsZVF1b3RlZCA9IHZhbFswXSA9PT0gXCInXCIgJiYgdmFsW2VuZF0gPT09IFwiJ1wiXG5cbiAgICAgIC8vIGlmIHNpbmdsZSBvciBkb3VibGUgcXVvdGVkLCByZW1vdmUgcXVvdGVzXG4gICAgICBpZiAoaXNTaW5nbGVRdW90ZWQgfHwgaXNEb3VibGVRdW90ZWQpIHtcbiAgICAgICAgdmFsID0gdmFsLnN1YnN0cmluZygxLCBlbmQpXG5cbiAgICAgICAgLy8gaWYgZG91YmxlIHF1b3RlZCwgZXhwYW5kIG5ld2xpbmVzXG4gICAgICAgIGlmIChpc0RvdWJsZVF1b3RlZCkge1xuICAgICAgICAgIHZhbCA9IHZhbC5yZXBsYWNlKFJFX05FV0xJTkVTLCBORVdMSU5FKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZW1vdmUgc3Vycm91bmRpbmcgd2hpdGVzcGFjZVxuICAgICAgICB2YWwgPSB2YWwudHJpbSgpXG4gICAgICB9XG5cbiAgICAgIG9ialtrZXldID0gdmFsXG4gICAgfSBlbHNlIGlmIChkZWJ1Zykge1xuICAgICAgbG9nKGBkaWQgbm90IG1hdGNoIGtleSBhbmQgdmFsdWUgd2hlbiBwYXJzaW5nIGxpbmUgJHtpZHggKyAxfTogJHtsaW5lfWApXG4gICAgfVxuICB9KVxuXG4gIHJldHVybiBvYmpcbn1cblxuLy8gUG9wdWxhdGVzIHByb2Nlc3MuZW52IGZyb20gLmVudiBmaWxlXG5mdW5jdGlvbiBjb25maWcob3B0aW9ucyAvKjogP0RvdGVudkNvbmZpZ09wdGlvbnMgKi8pIC8qOiBEb3RlbnZDb25maWdPdXRwdXQgKi8ge1xuICBsZXQgZG90ZW52UGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnLmVudicpXG4gIGxldCBlbmNvZGluZyAvKjogc3RyaW5nICovID0gJ3V0ZjgnXG4gIGxldCBkZWJ1ZyA9IGZhbHNlXG5cbiAgaWYgKG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5wYXRoICE9IG51bGwpIHtcbiAgICAgIGRvdGVudlBhdGggPSBvcHRpb25zLnBhdGhcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZW5jb2RpbmcgIT0gbnVsbCkge1xuICAgICAgZW5jb2RpbmcgPSBvcHRpb25zLmVuY29kaW5nXG4gICAgfVxuICAgIGlmIChvcHRpb25zLmRlYnVnICE9IG51bGwpIHtcbiAgICAgIGRlYnVnID0gdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gc3BlY2lmeWluZyBhbiBlbmNvZGluZyByZXR1cm5zIGEgc3RyaW5nIGluc3RlYWQgb2YgYSBidWZmZXJcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZShmcy5yZWFkRmlsZVN5bmMoZG90ZW52UGF0aCwgeyBlbmNvZGluZyB9KSwgeyBkZWJ1ZyB9KVxuXG4gICAgT2JqZWN0LmtleXMocGFyc2VkKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb2Nlc3MuZW52LCBrZXkpKSB7XG4gICAgICAgIHByb2Nlc3MuZW52W2tleV0gPSBwYXJzZWRba2V5XVxuICAgICAgfSBlbHNlIGlmIChkZWJ1Zykge1xuICAgICAgICBsb2coYFwiJHtrZXl9XCIgaXMgYWxyZWFkeSBkZWZpbmVkIGluIFxcYHByb2Nlc3MuZW52XFxgIGFuZCB3aWxsIG5vdCBiZSBvdmVyd3JpdHRlbmApXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiB7IHBhcnNlZCB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4geyBlcnJvcjogZSB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMuY29uZmlnID0gY29uZmlnXG5tb2R1bGUuZXhwb3J0cy5wYXJzZSA9IHBhcnNlXG4iLCJjb25zdCBkb3RlbnYgPSByZXF1aXJlKCdkb3RlbnYnKTtcblxuZnVuY3Rpb24gY29weSgpIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIC4uLkFycmF5LmZyb20oYXJndW1lbnRzKSk7XG59XG5cbmZ1bmN0aW9uIGV4aXQoKSB7XG4gIHByb2Nlc3MuZXhpdCgxKTtcbn1cblxuLyoqXG4gKiBBIGRpY3Rpb25hcnkgb2YgZW52aXJvbm1lbnRhbCB2YXJpYWJsZXMuXG4gKiBAdHlwZWRlZiB7T2JqZWN0LjxzdHJpbmcsIHN0cmluZz59IEVudkxpc3RcbiAqXG4gKiBAdG9kbyBVcGdyYWRlIHRvIGEgY2xhc3MgdGhhdCBpbXBsZW1lbnRzIGVudmpzLkxJU1RfUFJPVE8gYmVsb3cuXG4gKi9cblxuLyoqXG4gKiBBIGRlc2NyaXB0aXZlIGVudmlyb25tZW50IGNvbnRleHQgdGhhdCBzdG9yZXMgdGhlIGRlZmluaXRpb25zIGZvclxuICogZW52aXJvbm1lbnRhbCB2YXJpYWJsZXMgYnkgdGhlaXIgc291cmNlLCBhcyB3ZWxsIGFzIGFueSBlcnJvcnMgdGhhdFxuICogaGF2ZSBiZWVuIGdlbmVyYXRlZCB3aGlsZSBjb21waWxpbmcgdGhlbS5cbiAqIEB0eXBlZGVmIHtPYmplY3R9IEVudkNvbnRleHRcbiAqIEBwcm9wZXJ0eSB7RW52TGlzdH0gZGVmYXVsdHMgLSBEZWZhdWx0IGVudmlyb25tZW50YWwgdmFyaWFibGVzIHRoYXRcbiAqICAgICAgICAgICAgICAgICAgICAgYXJlIG92ZXJyaWRlbiBieSBhbGwgb3RoZXIgZXhwbGljaXR5IHNldFxuICogICAgICAgICAgICAgICAgICAgICBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcy5cbiAqIEBwcm9wZXJ0eSB7RW52TGlzdH0gY29uc3RhbnRzIC0gQ29uc3RhbnQgZW52aXJvbm1lbnRhbCB2YXJpYWJsZXMgdGhhdFxuICogICAgICAgICAgICAgICAgICAgICBjYW4gbm90IGJlIG92ZXJyaWRlbi5cbiAqIEBwcm9wZXJ0eSB7RW52TGlzdH0gcHJvY2VzcyAtIFRoZSBjb250ZW50IG9mIHByb2Nlc3MuZW52IGFzIG9mIHRoZSBsYXN0XG4gKiAgICAgICAgICAgICAgICAgICAgIGNhbGwgdG8gY2xlYXJDdHguXG4gKiBAcHJvcGVydHkge0Vudkxpc3R9IGRvdGVudiAtIEFsbCBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcyBsb2FkZWQgYnkgdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgIGRvdGVudiBtb2R1bGUuXG4gKiBAcHJvcGVydHkge09iamVjdH0gIGVycm9ycyAtIEEgZGVwb3NpdG9yeSBmb3IgZXJyb3JzIGdlbmVyYXRlZCB3aGVuXG4gKiAgICAgICAgICAgICAgICAgICAgIGxvYWRpbmcgdGhlIGVudmlyb25tZW50LlxuICovXG5cbi8qKlxuICogVGhlIG1lbW9pemVkIGVudmlyb25tZW50IGNvbnRleHQgdGhhdCB3ZSBtdXRhdGUgYW5kIHNoYXJlLlxuICogQHR5cGUge0VudkNvbnRleHR9XG4gKi9cbmNvbnN0IG1lbW8gPSB7XG4gIGN0eDogbnVsbCxcbiAgZW1wdHlDdHg6IHtcbiAgICBkZWZhdWx0czoge30sXG4gICAgZG90ZW52OiB7fSxcbiAgICBwcm9jZXNzOiB7fSxcbiAgICBjb25zdGFudHM6IHt9LFxuICAgIGVycm9yczoge30sXG4gIH0sXG59O1xuXG4vKipcbiAqIFJlc2V0cyB0aGUgc3RhdGUgb2YgdGhlIGNvbnRleHQuXG4gKiBAcHJvdGVjdGVkXG4gKi9cbmZ1bmN0aW9uIGNsZWFyQ3R4KCkge1xuICBtZW1vLmN0eCA9IHt9O1xuICBtZW1vLmN0eC5kZWZhdWx0cyA9IHt9O1xuICBtZW1vLmN0eC5kb3RlbnYgPSB7fTtcbiAgbWVtby5jdHgucHJvY2VzcyA9IHt9O1xuICBtZW1vLmN0eC5jb25zdGFudHMgPSB7fTtcbiAgbWVtby5jdHguZXJyb3JzID0ge307XG59XG5cbmZ1bmN0aW9uIHZhbHVlc0Zyb20oY3R4KSB7XG4gIHJldHVybiBjb3B5KGN0eC5kZWZhdWx0cywgY3R4LmRvdGVudiwgY3R4LnByb2Nlc3MsIGN0eC5jb25zdGFudHMpO1xufVxuXG4vKipcbiAqIFRoZSBjbGFzcyBmb3IgYWxsIEVudkxpc3Qgb2JqZWN0cy4gQWxsb3dzIHVzIHRvIGRlcmVmZXJlbmNlIHZhcmlhYmxlc1xuICogYnkgbmFtZSBhbmQgY29udHJvbCB0aGUgdmFsdWUgdGhhdCBpcyByZXR1cm5lZCB3aGVuIHRoZSB2YXJpYWJsZSBkb2VzIG5vdFxuICogZXhpc3QuXG4gKlxuICogQHByb3BlcnR5IHtPYmplY3R9IHZhbHVlcyAtIEEgYmFzaWMgb2JqZWN0L2RpY3QgdmVyc2lvbiBvZiB0aGUgRW52TGlzdC5cbiAqIEBwcm9wZXJ0eSB7Kn0gICAgICBtaXNzVmFsdWUgLSBUaGUgdmFsdWUgcmV0dXJuZWQgb24gYSBtaXNzIHdoZW5cbiAqICAgICAgICAgICAgICAgICAgICBjYWxsaW5nIEVudkxpc3QuZ2V0KCkuXG4gKiBAbWV0aG9kIGluY2x1ZGUoPHN0cmluZz4pIC0gQWNjZXNzZXMgdGhlIHZhbHVlcyBkaWN0IGFuZCByZXR1cm5zXG4gKiAgICAgICAgIHdoZXRoZXIgdGhlIGdpdmVuIG5hbWUgaXMgaW4gaXQuXG4gKiBAbWV0aG9kIGluY2x1ZGVzKDxzdHJpbmc+KSDigJMgQW4gYWxpYXMgb2YgaW5jbHVkZSgpLlxuICogQG1ldGhvZCBnZXQoPHN0cmluZz4pIC0gQWNjZXNzZXMgdGhlIHZhbHVlcyBkaWN0IGFuZCByZXR1cm5zIHRoZVxuICogICAgICAgICBkZXJlZmVyZW5jZWQgdmFyaWFibGUsIG9yIHRoZSBtaXNzVmFsdWUgaWYgbm90IGZvdW5kLlxuICogQG1ldGhvZCBzZXRNaXNzVmFsdWUoPCo+KSAtIFNldHMgdGhlIG1pc3NpbmcgcmV0dXJuIHZhbHVlLlxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgY29uc3QgZW52dmFycyA9IGVudih7IGNvbnN0YW50czogeyBVU0VSTkFNRTogJ3N0YXJidWNrJyB9IH0pO1xuICogICAgIGVudnZhcnMuc2V0TWlzc1ZhbHVlKCduL2EnKTtcbiAqICAgICBlbnZ2YXJzLmdldCgnVVNFUk5BTUUnKVxuICogICAgIC8vID0+ICdzdGFyYnVjaydcbiAqICAgICBlbnZ2YXJzLmdldCgnUEFTU1dPUkQnKVxuICogICAgIC8vID0+ICduL2EnXG4gKiAgICAgZW52dmFycy5QQVNTV09SRFxuICogICAgIC8vID0+IG51bGxcbiAqXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5Zb3UgY2FuIHBhc3MgYSBtaXNzaW5nIHJldHVybiB2YWx1ZSBvbiBnZW5lcmF0aW9uOjwvY2FwdGlvbj5cbiAqICAgICBjb25zdCBlbnZ2YXJzID0gZW52KHtcbiAqICAgICAgIGNvbnN0YW50czogeyBVU0VSTkFNRTogJ3N0YXJidWNrJyB9LFxuICogICAgICAgbWlzc1ZhbHVlOiAnbi9hJyxcbiAqICAgICB9KTtcbiAqICAgICBlbnZ2YXJzLmdldCgnUEFTU1dPUkQnKVxuICogICAgIC8vID0+ICduL2EnXG4gKi9cbmNsYXNzIEVudkxpc3Qge1xuICBjb25zdHJ1Y3RvcihtaXNzVmFsdWUgPSBudWxsKSB7XG4gICAgdGhpcy5taXNzVmFsdWUgPSBtaXNzVmFsdWU7XG4gIH1cblxuICBpbmNsdWRlKG5hbWUpIHtcbiAgICB0aGlzLl9zdGF0aWNWYWx1ZXMgPSBjb3B5KHZhbHVlc0Zyb20obWVtby5jdHgpKTtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuX3N0YXRpY1ZhbHVlcywgbmFtZSk7XG4gIH1cblxuICBpbmNsdWRlcyhuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5jbHVkZShuYW1lKTtcbiAgfVxuXG4gIGdldChuYW1lKSB7XG4gICAgaWYgKCF0aGlzLmluY2x1ZGUobmFtZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLm1pc3NWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3N0YXRpY1ZhbHVlc1tuYW1lXTtcbiAgfVxuXG4gIHNldE1pc3NWYWx1ZShtaXNzVmFsdWUgPSBudWxsKSB7XG4gICAgdGhpcy5taXNzVmFsdWUgPSBtaXNzVmFsdWU7XG4gIH1cbn1cblxuLyoqXG4gKiBNZXJnZSB0aGUgZW52aXJvbm1lbnRhbCB2YXJpYWJsZXMgaW4gdGhlIGNvbnRleHQgdG9nZXRoZXIgaW50byBhXG4gKiBzaW5nbGUgZW52aXJvbm1lbnRhbCBvYmplY3QuIEFkZHMgYSBwcm90b3R5cGUgdG8gdGhlIG9iamVjdCB3aXRoIGFcbiAqIGZldyBoZWxwZXIgZnVuY3Rpb25zLlxuICogQHByb3RlY3RlZFxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUZyb21DdHgobWlzc1ZhbHVlKSB7XG4gIGNvbnN0IHByb3RvID0gbmV3IGVudmpzLkVudkxpc3QobWlzc1ZhbHVlKTtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShwcm90byksIHZhbHVlc0Zyb20obWVtby5jdHgpKTtcbn1cblxuLyoqXG4gKiBPcHRpb25zIGZvciBjYWxscyB0byBnZW5lcmF0ZSBhIG5ldyBjb250ZXh0LlxuICogQHR5cGVkZWYge09iamVjdH0gRW52T3B0aW9uc1xuICogQHByb3BlcnR5IHtib29sZWFufSAgZG90ZW52IC0gV2hldGhlciBvciBub3QgdG8gcnVuIGEgZG90ZW52IGNvbmZpZ1xuICogICAgICAgICAgICAgICAgICAgICAgbG9hZC5cbiAqIEBwcm9wZXJ0eSB7RW52TGlzdH0gIGRlZmF1bHRzIC0gQSBsaXN0IG9mIGRlZmF1bHQgZW52aXJvbm1lbnRhbFxuICogICAgICAgICAgICAgICAgICAgICAgdmFyaWFibGVzLlxuICogQHByb3BlcnR5IHtFbnZMaXN0fSAgY29uc3RhbnRzIC0gQSBsaXN0IG9mIGNvbnN0YW50IGVudmlyb25tZW50YWxcbiAqICAgICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlcy5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nW119IGVuc3VyZSAtIEEgbGlzdCBlbnZpcm9ubWVudGFsIHZhcmlhYmxlIG5hbWVzIHRoYXRcbiAqICAgICAgICAgICAgICAgICAgICAgIG11c3QgZXhpc3QgaW4gdGhlIGNvbnRleHQsIG9yIHdlIGV4aXQgdGhlIHByb2dyYW0uXG4gKiBAcHJvcGVydHkgeyp9ICAgICAgICBtaXNzVmFsdWUgLSBUaGUgdmFsdWUgdGhhdCBpcyByZXR1cm5lZCB3aGVuIHdlXG4gKiAgICAgICAgICAgICAgICAgICAgICBjYWxsIEVudkxpc3QuZ2V0KCkgb24gYSBtaXNzaW5nIHZhbHVlLlxuICovXG5jb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgZG90ZW52OiB0cnVlLFxuICBjb25zdGFudHM6IHt9LFxuICBkZWZhdWx0czoge30sXG4gIGVuc3VyZTogW10sXG4gIG1pc3NWYWx1ZTogbnVsbCxcbn07XG5cbmZ1bmN0aW9uIGlzT2JqZWN0TGl0ZXJhbChvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0O1xufVxuXG5mdW5jdGlvbiBpc0FycmF5TGl0ZXJhbChvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gQXJyYXk7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlRW52T3B0aW9ucyhvcHRpb25zKSB7XG4gIGlmICghaXNPYmplY3RMaXRlcmFsKG9wdGlvbnMpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYGludmFsaWQgb3B0aW9uczogZXhwZWN0ZWQgb2JqZWN0IGxpdGVyYWwsIHJlY2VpdmVkOiAke0pTT04uc3RyaW5naWZ5KFxuICAgICAgICBvcHRpb25zXG4gICAgICApfWBcbiAgICApO1xuICB9XG4gIGNvbnN0IHdoaXRlbGlzdGVkRmllbGRzID0gW1xuICAgICdkb3RlbnYnLFxuICAgICdjb25zdGFudHMnLFxuICAgICdkZWZhdWx0cycsXG4gICAgJ2Vuc3VyZScsXG4gICAgJ21pc3NWYWx1ZScsXG4gIF07XG4gIGNvbnN0IGludmFsaWRGaWVsZHMgPSBbXTtcbiAgZm9yIChjb25zdCBwcm9wIGluIG9wdGlvbnMpIHtcbiAgICBpZiAoIXdoaXRlbGlzdGVkRmllbGRzLmluY2x1ZGVzKHByb3ApKSB7XG4gICAgICBpbnZhbGlkRmllbGRzLnB1c2gocHJvcCk7XG4gICAgfVxuICB9XG4gIGlmIChpbnZhbGlkRmllbGRzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBpbnZhbGlkIG9wdGlvbnM6IGluY2x1ZGVzIGludmFsaWQgZmllbGRzOiAke2ludmFsaWRGaWVsZHMuam9pbignLCAnKX1gXG4gICAgKTtcbiAgfVxuXG4gIGlmIChcbiAgICBvcHRpb25zLmRlZmF1bHRzICYmXG4gICAgKCFpc09iamVjdExpdGVyYWwob3B0aW9ucy5kZWZhdWx0cykgfHxcbiAgICAgICFPYmplY3QudmFsdWVzKG9wdGlvbnMuZGVmYXVsdHMpLmV2ZXJ5KGkgPT4gdHlwZW9mIGkgPT09ICdzdHJpbmcnKSlcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYGludmFsaWQgb3B0aW9uIGRlZmF1bHRzOiBleHBlY3RlZCBvYmplY3QgbGl0ZXJhbCB3aXRoIHN0cmluZyBrZXlzYFxuICAgICk7XG4gIH1cblxuICBpZiAoXG4gICAgb3B0aW9ucy5jb25zdGFudHMgJiZcbiAgICAoIWlzT2JqZWN0TGl0ZXJhbChvcHRpb25zLmNvbnN0YW50cykgfHxcbiAgICAgICFPYmplY3QudmFsdWVzKG9wdGlvbnMuY29uc3RhbnRzKS5ldmVyeShpID0+IHR5cGVvZiBpID09PSAnc3RyaW5nJykpXG4gICkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBpbnZhbGlkIG9wdGlvbiBjb25zdGFudHM6IGV4cGVjdGVkIG9iamVjdCBsaXRlcmFsIHdpdGggc3RyaW5nIGtleXNgXG4gICAgKTtcbiAgfVxuXG4gIGlmIChcbiAgICBvcHRpb25zLmVuc3VyZSAmJlxuICAgICghaXNBcnJheUxpdGVyYWwob3B0aW9ucy5lbnN1cmUpIHx8XG4gICAgICAhb3B0aW9ucy5lbnN1cmUuZXZlcnkoaSA9PiB0eXBlb2YgaSA9PT0gJ3N0cmluZycpKVxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgaW52YWxpZCBvcHRpb24gZW5zdXJlOiBleHBlY3RlZCBhcnJheSBsaXRlcmFsIHdpdGggc3RyaW5nIGl0ZW1zYFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgc2V0IG9mIGVudmlyb25tZW50YWwgdmFyaWFibGVzIGZyb20gdGhlIGN1cnJlbnQgY29udGV4dCxcbiAqIGFmdGVyIGFwcGx5aW5nIGFsbCBwYXNzZWQgb3B0aW9ucy4gSWYgYSBzZXQgb2YgbmFtZXMgd2Ugd2FudCB0byBlbnN1cmVcbiAqIGV4aXN0IGFyZSBwYXNzZWQsIHdpbGwgYXBwbHkgdGhlc2UgYWZ0ZXIgdGhlIGxpc3QgaXMgZ2VuZXJhdGVkLlxuICogQHBhcmFtIHtFbnZPcHRpb25zfSBbb3B0aW9ucz1lbnZqcy5kZWZhdWx0T3B0aW9uc11cbiAqIEByZXR1cm5zIHtFbnZMaXN0fSBUaGUgcmVzZXQsIG5ld2x5LWdlbmVyYXRlZCBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcy5cbiAqL1xuZnVuY3Rpb24gZW52anMob3B0aW9ucyA9IHt9KSB7XG4gIHJldHVybiBlbnZqcy5zZXQob3B0aW9ucyk7XG59XG5lbnZqcy5kZWZhdWx0T3B0aW9ucyA9IGRlZmF1bHRPcHRpb25zO1xuZW52anMudmFsaWRhdGVFbnZPcHRpb25zID0gdmFsaWRhdGVFbnZPcHRpb25zO1xuZW52anMuRW52TGlzdCA9IEVudkxpc3Q7XG5lbnZqcy5fY2xlYXJDdHggPSBjbGVhckN0eDtcbmVudmpzLl9nZW5lcmF0ZUZyb21DdHggPSBnZW5lcmF0ZUZyb21DdHg7XG5lbnZqcy5fZW1wdHlDdHggPSBtZW1vLmVtcHR5Q3R4O1xuZW52anMuX2V4aXQgPSBleGl0O1xuXG5lbnZqcy5zZXQgPSBmdW5jdGlvbihvcHRpb25zID0ge30pIHtcbiAgZW52anMudmFsaWRhdGVFbnZPcHRpb25zKG9wdGlvbnMpO1xuICBjb25zdCBvcHRzID0gY29weShlbnZqcy5kZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgbWVtby5jdHgucHJvY2VzcyA9IGNvcHkobWVtby5jdHgucHJvY2VzcywgcHJvY2Vzcy5lbnYpO1xuICBtZW1vLmN0eC5kZWZhdWx0cyA9IGNvcHkobWVtby5jdHguZGVmYXVsdHMsIG9wdHMuZGVmYXVsdHMpO1xuICBtZW1vLmN0eC5jb25zdGFudHMgPSBjb3B5KG1lbW8uY3R4LmNvbnN0YW50cywgb3B0cy5jb25zdGFudHMpO1xuXG4gIGlmIChvcHRzLmRvdGVudikge1xuICAgIGVudmpzLmxvYWQoKTsgLy8gTk9URTogbG9zZXMgY29udHJvbCBvZiB0aHJlYWQuIFJhY2UgY29uZGl0aW9uLlxuICB9XG5cbiAgY29uc3Qgb2JqID0gZW52anMuX2dlbmVyYXRlRnJvbUN0eChvcHRzLm1pc3NWYWx1ZSk7XG4gIGNvbnN0IGV4cGVjdGVkID0gb3B0cy5lbnN1cmU7XG4gIGlmIChleHBlY3RlZC5sZW5ndGgpIHtcbiAgICBlbnZqcy5jaGVjayhleHBlY3RlZCwgT2JqZWN0LmtleXMob2JqKSwge1xuICAgICAgbG9nT25NaXNzOiB0cnVlLFxuICAgICAgZXhpdE9uTWlzczogdHJ1ZSxcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gb2JqO1xufTtcblxuLyoqXG4gKiBBIGJhc2ljIGdldHRlciBmb3IgdGhlIGludGVybmFsIGNvbnRleHQgXCJjdHhcIiB2YWx1ZS5cbiAqIEByZXR1cm5zIHtFbnZDb250ZXh0fVxuICovXG5lbnZqcy5jdHggPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGNvcHkobWVtby5jdHgpO1xufTtcblxuLyoqXG4gKiBDbGVhcnMgb3V0IHRoZSBjb250ZXh0IGFuZCByZWdlbmVyYXRlcyBpdCBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuXG4gKiBvcHRpb25zLlxuICogQHBhcmFtIHtFbnZPcHRpb25zfSBbb3B0aW9ucz1lbnZqcy5kZWZhdWx0T3B0aW9uc11cbiAqIEByZXR1cm5zIHtFbnZMaXN0fSBUaGUgcmVzZXQsIG5ld2x5LWdlbmVyYXRlZCBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcy5cbiAqL1xuZW52anMucmVzZXQgPSBmdW5jdGlvbihvcHRzKSB7XG4gIGVudmpzLl9jbGVhckN0eCgpO1xuICByZXR1cm4gZW52anMuc2V0KG9wdHMpO1xufTtcblxuLyoqXG4gKiBFbnN1cmVzIHRoYXQgc29tZSB2YXJpYWJsZSBvciBzZXQgb2YgdmFyaWFibGVzIGFyZSBkZWZpbmVkIGluIHRoZVxuICogY3VycmVudCBjb250ZXh0LiBBbGxvd3MgYSBsaXN0IG9mIGRlZmluZWQgdmFyaWFibGVzIHRvIGJlIHBhc3NlZCwgYXNcbiAqIHdlbGwgYXMgb3B0aW9ucyB0aGF0IGRlZmluZSB3aGF0IGhhcHBlbnMgd2hlbiB0aGVyZSBpcyBhIG1pc3NpbmdcbiAqIHZhcmlhYmxlLiBCeSBkZWZhdWx0IGEgbWlzcyB3aWxsIGV4aXQgdGhlIHByb2Nlc3Mgd2l0aCBhbiBleGl0IHZhbHVlXG4gKiBvZiAxLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gW2V4cGVjdGVkPVtdXSAtIFRoZSBsaXN0IG9mIHZhcmlhYmxlIG5hbWVzIHdlIGV4cGVjdFxuICogICAgICAgICAgICAgICAgICAgdG8gaGF2ZSBiZWVuIGRlZmluZWQuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBhY3R1YWwgLSBJZiBwYXNzZWQsIHRoaXMgaXMgdGhlIGxpc3Qgb2YgZGVmaW5lZFxuICogICAgICAgICAgICAgICAgICAgdmFyaWFibGUgbmFtZXMgd2UgY2hlY2sgYWdhaW5zdCAoaW5zdGVhZCBvZiB0aG9zZVxuICogICAgICAgICAgICAgICAgICAgZGVmaW5lZCBpbiB0aGUgY3VycmVudCBjb250ZXh0KS5cbiAqIEBwYXJhbSB7T2JqZWN0fSAgIG9wdHMgLSBPcHRpb25zLlxuICogQHBhcmFtIHtib29sZWFufSAgW29wdHMuc2lsZW50PWZhbHNlXSAtIFdoZXRoZXIgb3Igbm90IHRvIGxvZyBtaXNzaW5nXG4gKiAgICAgICAgICAgICAgICAgICB2YXJpYWJsZSBuYW1lcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gIFtvcHRzLmV4aXRPbk1pc3M9dHJ1ZV0gLSBXaGV0aGVyIG9yIG5vdCB0byBleGl0IHRoZVxuICogICAgICAgICAgICAgICAgICAgcHJvY2VzcyBpZiBhbnkgbmFtZXMgYXJlIG1pc3NpbmcuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBhbGwgdGhlIGV4cGVjdGVkIHZhcmlhYmxlcyBhcmUgZGVmaW5lZCxcbiAqICAgICAgICAgICAgICAgICAgICBmYWxzZSBvdGhlcndpc2UuIE9ubHkgcnVucyBpZiB0cnVlIG9yIGlmIHRoZVxuICogICAgICAgICAgICAgICAgICAgIGV4aXRPbk1pc3Mgb3B0aW9uIGlzIHNldCB0byBmYWxzZS5cbiAqXG4gKiBAdG9kbyBBZGQgYW4gb3B0aW9uIHRvIHRocm93T25NaXNzLCB0aGF0IGNvbGxlY3RzIHRoZSBlcnJvciBtZXNzYWdlc1xuICogICAgICAgYW5kIHRoZW4gdGhyb3dzIGFuIGVycm9yIGF0IHRoZSBlbmQgb2YgdGhlIGZ1bmN0aW9uLlxuICovXG5lbnZqcy5jaGVjayA9IGZ1bmN0aW9uKFxuICBleHBlY3RlZCA9IFtdLFxuICBhY3R1YWwgPSBbXSxcbiAgb3B0cyA9IHtcbiAgICBsb2dPbk1pc3M6IGZhbHNlLFxuICAgIGV4aXRPbk1pc3M6IGZhbHNlLFxuICAgIHRocm93T25NaXNzOiBmYWxzZSxcbiAgfVxuKSB7XG4gIGlmICghaXNBcnJheUxpdGVyYWwoZXhwZWN0ZWQpIHx8ICFpc0FycmF5TGl0ZXJhbChhY3R1YWwpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHZhbHVlcyB0byBjaGVjaycpO1xuICB9XG5cbiAgY29uc3QgbWlzc2luZyA9IFtdO1xuICBleHBlY3RlZC5mb3JFYWNoKHYgPT4ge1xuICAgIGlmICghYWN0dWFsLmluY2x1ZGVzKHYpKSB7XG4gICAgICBtaXNzaW5nLnB1c2godik7XG4gICAgfVxuICB9KTtcblxuICBpZiAobWlzc2luZy5sZW5ndGggIT09IDAgJiYgb3B0cy5sb2dPbk1pc3MpIHtcbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgbWlzc2luZy5tYXAodiA9PiBgW0VSUl0gbWlzc2luZyByZXF1aXJlZCBlbnYgdmFyIHske3Z9fWApLmpvaW4oJ1xcbicpXG4gICAgKTtcbiAgfVxuXG4gIGlmIChtaXNzaW5nLmxlbmd0aCAhPT0gMCAmJiBvcHRzLnRocm93T25NaXNzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBtaXNzaW5nIHJlcXVpcmVkIGVudiB2YXJzOiAke21pc3Npbmcuam9pbignLCAnKX1gKTtcbiAgfVxuXG4gIGlmIChtaXNzaW5nLmxlbmd0aCAhPT0gMCAmJiBvcHRzLmV4aXRPbk1pc3MpIHtcbiAgICBlbnZqcy5fZXhpdCgpO1xuICB9XG5cbiAgcmV0dXJuIG1pc3NpbmcubGVuZ3RoID09PSAwO1xufTtcblxuZW52anMuZW5zdXJlID0gZnVuY3Rpb24oZXhwZWN0ZWQpIHtcbiAgcmV0dXJuIGVudmpzLmNoZWNrKGV4cGVjdGVkLCBPYmplY3Qua2V5cyh2YWx1ZXNGcm9tKG1lbW8uY3R4KSksIHtcbiAgICB0aHJvd09uTWlzczogdHJ1ZSxcbiAgfSk7XG59O1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IERvdGVudlJlc3VsdFxuICogQHByb3BlcnR5IHtFbnZMaXN0fSBkb3RlbnYgLSBUaGUgbGlzdCBvZiBlbnZpcm9ubWVudGFsIHZhcmlhYmxlc1xuICogICAgICAgICAgICAgICAgICAgICBsb2FkZWQsIGlmIGFueSwgZnJvbSB0aGUgLmVudiBmaWxlLlxuICogQHByb3BlcnR5IHtFcnJvcn0gICBlcnJvciAtIEFueSBlcnJvciAodXN1YWxseSwgbWlzc2luZyAuZW52IGZpbGUpXG4gKiAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlZCBieSBydW5uaW5nIGRvdGVudi5jb25maWcoKS5cbiAqL1xuXG4vKipcbiAqIExvYWRzIHZhcmlhYmxlcyBmcm9tIGEgLmVudiBmaWxlLiBVc2VzIHRoZSBzdGFuZGFyZCBtb2R1bGVuIFwiZG90ZW52XCIsXG4gKiBidXQga2VlcHMgdGhlIHByb2Nlc3MuZW52IGZyZWUgb2YgdGhlIHZhcmlhYmxlcyB0aGF0IGFyZSBsb2FkZWQsXG4gKiBhZGRpbmcgdGhlbSB0byB0aGUgaW50ZXJuYWwgY3R4LmRvdGVudiBsaXN0LiBBbnkgZXJyb3JzIHRoYXQgYXJlXG4gKiBnZW5lcmF0ZWQgYXJlIGFkZGVkIHRvIGN0eC5lcnJvcnMuZG90ZW52IChjdXJyZW50bHkgdGhlIG9ubHkgc291cmNlXG4gKiBvZiBlcnJvcnMgaW4gdGhlIGNvbnRleHQpLlxuICogQHJldHVybnMge0RvdGVudlJlc3VsdH1cbiAqL1xuZW52anMubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAvLyBFbnN1cmUgd2UgaGF2ZSBhIGNvcHkgb2YgdGhlIGN1cnJlbnQgcHJvY2Vzcy5lbnYsIHRoZW4gcnVuIGRvdGVudi5cbiAgY29uc3Qgb3Byb2Nlc3NlbnYgPSBjb3B5KHByb2Nlc3MuZW52KTtcbiAgY29uc3QgeyBwYXJzZWQsIGVycm9yIH0gPSBkb3RlbnYuY29uZmlnKCk7XG5cbiAgLy8gUmVzdG9yZSB0aGUgY2xlYW4sIHByZS1kb3RlbnYgcHJvY2Vzcy5lbnZcbiAgcHJvY2Vzcy5lbnYgPSBvcHJvY2Vzc2VudjtcblxuICAvLyBNZXJnZSBwYXJzZWQgYW5kIGVycm9ycyBpbnRvIHRoZSBjb250ZXh0LlxuICBtZW1vLmN0eC5kb3RlbnYgPSBjb3B5KG1lbW8uY3R4LmRvdGVudiwgcGFyc2VkKTtcbiAgaWYgKGVycm9yKSB7XG4gICAgbWVtby5jdHguZXJyb3JzID0gY29weShtZW1vLmN0eC5lcnJvcnMsIHsgZG90ZW52OiB7IGVycm9yIH0gfSk7XG4gIH1cblxuICByZXR1cm4geyBkb3RlbnY6IHBhcnNlZCwgZXJyb3IgfTtcbn07XG5cbi8vIExvYWQgdGhlIGN1cnJlbnQgc3RhdGUgb2YgcHJvY2Vzcy5lbnZqcy5cbmVudmpzLl9jbGVhckN0eCgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVudmpzO1xuIl0sIm5hbWVzIjpbImNvcHkiLCJPYmplY3QiLCJhc3NpZ24iLCJBcnJheSIsImZyb20iLCJhcmd1bWVudHMiLCJleGl0IiwicHJvY2VzcyIsIm1lbW8iLCJjdHgiLCJlbXB0eUN0eCIsImRlZmF1bHRzIiwiZG90ZW52IiwiY29uc3RhbnRzIiwiZXJyb3JzIiwiY2xlYXJDdHgiLCJ2YWx1ZXNGcm9tIiwiRW52TGlzdCIsIm1pc3NWYWx1ZSIsIm5hbWUiLCJfc3RhdGljVmFsdWVzIiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiaW5jbHVkZSIsImdlbmVyYXRlRnJvbUN0eCIsInByb3RvIiwiZW52anMiLCJjcmVhdGUiLCJkZWZhdWx0T3B0aW9ucyIsImVuc3VyZSIsImlzT2JqZWN0TGl0ZXJhbCIsIm9iaiIsImNvbnN0cnVjdG9yIiwiaXNBcnJheUxpdGVyYWwiLCJ2YWxpZGF0ZUVudk9wdGlvbnMiLCJvcHRpb25zIiwiRXJyb3IiLCJKU09OIiwic3RyaW5naWZ5Iiwid2hpdGVsaXN0ZWRGaWVsZHMiLCJpbnZhbGlkRmllbGRzIiwicHJvcCIsImluY2x1ZGVzIiwicHVzaCIsImxlbmd0aCIsImpvaW4iLCJ2YWx1ZXMiLCJldmVyeSIsImkiLCJzZXQiLCJfY2xlYXJDdHgiLCJfZ2VuZXJhdGVGcm9tQ3R4IiwiX2VtcHR5Q3R4IiwiX2V4aXQiLCJvcHRzIiwiZW52IiwibG9hZCIsImV4cGVjdGVkIiwiY2hlY2siLCJrZXlzIiwibG9nT25NaXNzIiwiZXhpdE9uTWlzcyIsInJlc2V0IiwiYWN0dWFsIiwidGhyb3dPbk1pc3MiLCJtaXNzaW5nIiwiZm9yRWFjaCIsInYiLCJjb25zb2xlIiwiZXJyb3IiLCJtYXAiLCJvcHJvY2Vzc2VudiIsImNvbmZpZyIsInBhcnNlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUEwQkEsU0FBUyxHQUFHLEVBQUUsT0FBTyxnQkFBZ0I7SUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUM7R0FDMUM7O0VBRUQsTUFBTSxPQUFPLEdBQUcsS0FBSTtFQUNwQixNQUFNLGNBQWMsR0FBRyxnQ0FBK0I7RUFDdEQsTUFBTSxXQUFXLEdBQUcsT0FBTTtFQUMxQixNQUFNLGNBQWMsR0FBRyxhQUFZOzs7RUFHbkMsU0FBUyxLQUFLLEVBQUUsR0FBRyx5QkFBeUIsT0FBTyxzREFBc0Q7SUFDdkcsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFDO0lBQy9DLE1BQU0sR0FBRyxHQUFHLEdBQUU7OztJQUdkLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDLFVB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
