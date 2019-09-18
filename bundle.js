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
      errors: {},
      missValue: null
    }
  };
  /**
   * Resets the state of the context.
   * @protected
   */

  function clearCtx() {
    memo.ctx = copy(envjs._emptyCtx);
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
    memo.ctx.constants = copy(memo.ctx.constants, opts.constants); // if (opts.dotenv) {
    //   envjs.dotenv(); // NOTE: loses control of thread. Race condition.
    // }

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
  // envjs.dotenv = function() {
  //   // Ensure we have a copy of the current process.env, then run dotenv.
  //   memo.ctx.process = copy(process.env);
  //   const { parsed, error } = dotenv.config();
  //   // Identify what vars (if any) were appended by dotenv, and add to ctx.
  //   if (parsed) {
  //     Object.keys(parsed).forEach(prop => {
  //       if (!Object.prototype.hasOwnProperty.call(memo.ctx.process, prop)) {
  //         memo.ctx.dotenv[prop] = parsed[prop];
  //       }
  //     });
  //   }
  //   // Merge in any errors
  //   if (error) {
  //     memo.ctx.errors = Object.assign(memo.ctx.errors, { dotenv: { error } });
  //   }
  //   // Restore the clean, pre-dotenv process.env
  //   process.env = copy(memo.ctx.process);
  //   return { dotenv: memo.ctx.dotenv, error: error };
  // };
  // Load the current state of process.envjs.


  envjs._clearCtx();

  var src = envjs;

  return src;

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJzcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZG90ZW52ID0gcmVxdWlyZSgnZG90ZW52Jyk7XG5cbmZ1bmN0aW9uIGNvcHkoKSB7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCAuLi5BcnJheS5mcm9tKGFyZ3VtZW50cykpO1xufVxuXG5mdW5jdGlvbiBleGl0KCkge1xuICBwcm9jZXNzLmV4aXQoMSk7XG59XG5cbi8qKlxuICogQSBkaWN0aW9uYXJ5IG9mIGVudmlyb25tZW50YWwgdmFyaWFibGVzLlxuICogQHR5cGVkZWYge09iamVjdC48c3RyaW5nLCBzdHJpbmc+fSBFbnZMaXN0XG4gKlxuICogQHRvZG8gVXBncmFkZSB0byBhIGNsYXNzIHRoYXQgaW1wbGVtZW50cyBlbnZqcy5MSVNUX1BST1RPIGJlbG93LlxuICovXG5cbi8qKlxuICogQSBkZXNjcmlwdGl2ZSBlbnZpcm9ubWVudCBjb250ZXh0IHRoYXQgc3RvcmVzIHRoZSBkZWZpbml0aW9ucyBmb3JcbiAqIGVudmlyb25tZW50YWwgdmFyaWFibGVzIGJ5IHRoZWlyIHNvdXJjZSwgYXMgd2VsbCBhcyBhbnkgZXJyb3JzIHRoYXRcbiAqIGhhdmUgYmVlbiBnZW5lcmF0ZWQgd2hpbGUgY29tcGlsaW5nIHRoZW0uXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBFbnZDb250ZXh0XG4gKiBAcHJvcGVydHkge0Vudkxpc3R9IGRlZmF1bHRzIC0gRGVmYXVsdCBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcyB0aGF0XG4gKiAgICAgICAgICAgICAgICAgICAgIGFyZSBvdmVycmlkZW4gYnkgYWxsIG90aGVyIGV4cGxpY2l0eSBzZXRcbiAqICAgICAgICAgICAgICAgICAgICAgZW52aXJvbm1lbnRhbCB2YXJpYWJsZXMuXG4gKiBAcHJvcGVydHkge0Vudkxpc3R9IGNvbnN0YW50cyAtIENvbnN0YW50IGVudmlyb25tZW50YWwgdmFyaWFibGVzIHRoYXRcbiAqICAgICAgICAgICAgICAgICAgICAgY2FuIG5vdCBiZSBvdmVycmlkZW4uXG4gKiBAcHJvcGVydHkge0Vudkxpc3R9IHByb2Nlc3MgLSBUaGUgY29udGVudCBvZiBwcm9jZXNzLmVudiBhcyBvZiB0aGUgbGFzdFxuICogICAgICAgICAgICAgICAgICAgICBjYWxsIHRvIGNsZWFyQ3R4LlxuICogQHByb3BlcnR5IHtFbnZMaXN0fSBkb3RlbnYgLSBBbGwgZW52aXJvbm1lbnRhbCB2YXJpYWJsZXMgbG9hZGVkIGJ5IHRoZVxuICogICAgICAgICAgICAgICAgICAgICBkb3RlbnYgbW9kdWxlLlxuICogQHByb3BlcnR5IHtPYmplY3R9ICBlcnJvcnMgLSBBIGRlcG9zaXRvcnkgZm9yIGVycm9ycyBnZW5lcmF0ZWQgd2hlblxuICogICAgICAgICAgICAgICAgICAgICBsb2FkaW5nIHRoZSBlbnZpcm9ubWVudC5cbiAqL1xuXG4vKipcbiAqIFRoZSBtZW1vaXplZCBlbnZpcm9ubWVudCBjb250ZXh0IHRoYXQgd2UgbXV0YXRlIGFuZCBzaGFyZS5cbiAqIEB0eXBlIHtFbnZDb250ZXh0fVxuICovXG5jb25zdCBtZW1vID0ge1xuICBjdHg6IG51bGwsXG4gIGVtcHR5Q3R4OiB7XG4gICAgZGVmYXVsdHM6IHt9LFxuICAgIGRvdGVudjoge30sXG4gICAgcHJvY2Vzczoge30sXG4gICAgY29uc3RhbnRzOiB7fSxcbiAgICBlcnJvcnM6IHt9LFxuICAgIG1pc3NWYWx1ZTogbnVsbCxcbiAgfSxcbn07XG5cbi8qKlxuICogUmVzZXRzIHRoZSBzdGF0ZSBvZiB0aGUgY29udGV4dC5cbiAqIEBwcm90ZWN0ZWRcbiAqL1xuZnVuY3Rpb24gY2xlYXJDdHgoKSB7XG4gIG1lbW8uY3R4ID0gY29weShlbnZqcy5fZW1wdHlDdHgpO1xufVxuXG5mdW5jdGlvbiB2YWx1ZXNGcm9tKGN0eCkge1xuICByZXR1cm4gY29weShjdHguZGVmYXVsdHMsIGN0eC5kb3RlbnYsIGN0eC5wcm9jZXNzLCBjdHguY29uc3RhbnRzKTtcbn1cblxuLyoqXG4gKiBUaGUgY2xhc3MgZm9yIGFsbCBFbnZMaXN0IG9iamVjdHMuIEFsbG93cyB1cyB0byBkZXJlZmVyZW5jZSB2YXJpYWJsZXNcbiAqIGJ5IG5hbWUgYW5kIGNvbnRyb2wgdGhlIHZhbHVlIHRoYXQgaXMgcmV0dXJuZWQgd2hlbiB0aGUgdmFyaWFibGUgZG9lcyBub3RcbiAqIGV4aXN0LlxuICpcbiAqIEBwcm9wZXJ0eSB7T2JqZWN0fSB2YWx1ZXMgLSBBIGJhc2ljIG9iamVjdC9kaWN0IHZlcnNpb24gb2YgdGhlIEVudkxpc3QuXG4gKiBAcHJvcGVydHkgeyp9ICAgICAgbWlzc1ZhbHVlIC0gVGhlIHZhbHVlIHJldHVybmVkIG9uIGEgbWlzcyB3aGVuXG4gKiAgICAgICAgICAgICAgICAgICAgY2FsbGluZyBFbnZMaXN0LmdldCgpLlxuICogQG1ldGhvZCBpbmNsdWRlKDxzdHJpbmc+KSAtIEFjY2Vzc2VzIHRoZSB2YWx1ZXMgZGljdCBhbmQgcmV0dXJuc1xuICogICAgICAgICB3aGV0aGVyIHRoZSBnaXZlbiBuYW1lIGlzIGluIGl0LlxuICogQG1ldGhvZCBpbmNsdWRlcyg8c3RyaW5nPikg4oCTIEFuIGFsaWFzIG9mIGluY2x1ZGUoKS5cbiAqIEBtZXRob2QgZ2V0KDxzdHJpbmc+KSAtIEFjY2Vzc2VzIHRoZSB2YWx1ZXMgZGljdCBhbmQgcmV0dXJucyB0aGVcbiAqICAgICAgICAgZGVyZWZlcmVuY2VkIHZhcmlhYmxlLCBvciB0aGUgbWlzc1ZhbHVlIGlmIG5vdCBmb3VuZC5cbiAqIEBtZXRob2Qgc2V0TWlzc1ZhbHVlKDwqPikgLSBTZXRzIHRoZSBtaXNzaW5nIHJldHVybiB2YWx1ZS5cbiAqXG4gKiBAZXhhbXBsZVxuICogICAgIGNvbnN0IGVudnZhcnMgPSBlbnYoeyBjb25zdGFudHM6IHsgVVNFUk5BTUU6ICdzdGFyYnVjaycgfSB9KTtcbiAqICAgICBlbnZ2YXJzLnNldE1pc3NWYWx1ZSgnbi9hJyk7XG4gKiAgICAgZW52dmFycy5nZXQoJ1VTRVJOQU1FJylcbiAqICAgICAvLyA9PiAnc3RhcmJ1Y2snXG4gKiAgICAgZW52dmFycy5nZXQoJ1BBU1NXT1JEJylcbiAqICAgICAvLyA9PiAnbi9hJ1xuICogICAgIGVudnZhcnMuUEFTU1dPUkRcbiAqICAgICAvLyA9PiBudWxsXG4gKlxuICogQGV4YW1wbGUgPGNhcHRpb24+WW91IGNhbiBwYXNzIGEgbWlzc2luZyByZXR1cm4gdmFsdWUgb24gZ2VuZXJhdGlvbjo8L2NhcHRpb24+XG4gKiAgICAgY29uc3QgZW52dmFycyA9IGVudih7XG4gKiAgICAgICBjb25zdGFudHM6IHsgVVNFUk5BTUU6ICdzdGFyYnVjaycgfSxcbiAqICAgICAgIG1pc3NWYWx1ZTogJ24vYScsXG4gKiAgICAgfSk7XG4gKiAgICAgZW52dmFycy5nZXQoJ1BBU1NXT1JEJylcbiAqICAgICAvLyA9PiAnbi9hJ1xuICovXG5jbGFzcyBFbnZMaXN0IHtcbiAgY29uc3RydWN0b3IobWlzc1ZhbHVlID0gbnVsbCkge1xuICAgIHRoaXMubWlzc1ZhbHVlID0gbWlzc1ZhbHVlO1xuICB9XG5cbiAgaW5jbHVkZShuYW1lKSB7XG4gICAgdGhpcy5fc3RhdGljVmFsdWVzID0gY29weSh2YWx1ZXNGcm9tKG1lbW8uY3R4KSk7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLl9zdGF0aWNWYWx1ZXMsIG5hbWUpO1xuICB9XG5cbiAgaW5jbHVkZXMobmFtZSkge1xuICAgIHJldHVybiB0aGlzLmluY2x1ZGUobmFtZSk7XG4gIH1cblxuICBnZXQobmFtZSkge1xuICAgIGlmICghdGhpcy5pbmNsdWRlKG5hbWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5taXNzVmFsdWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9zdGF0aWNWYWx1ZXNbbmFtZV07XG4gIH1cblxuICBzZXRNaXNzVmFsdWUobWlzc1ZhbHVlID0gbnVsbCkge1xuICAgIHRoaXMubWlzc1ZhbHVlID0gbWlzc1ZhbHVlO1xuICB9XG59XG5cbi8qKlxuICogTWVyZ2UgdGhlIGVudmlyb25tZW50YWwgdmFyaWFibGVzIGluIHRoZSBjb250ZXh0IHRvZ2V0aGVyIGludG8gYVxuICogc2luZ2xlIGVudmlyb25tZW50YWwgb2JqZWN0LiBBZGRzIGEgcHJvdG90eXBlIHRvIHRoZSBvYmplY3Qgd2l0aCBhXG4gKiBmZXcgaGVscGVyIGZ1bmN0aW9ucy5cbiAqIEBwcm90ZWN0ZWRcbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVGcm9tQ3R4KG1pc3NWYWx1ZSkge1xuICBjb25zdCBwcm90byA9IG5ldyBlbnZqcy5FbnZMaXN0KG1pc3NWYWx1ZSk7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUocHJvdG8pLCB2YWx1ZXNGcm9tKG1lbW8uY3R4KSk7XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgY2FsbHMgdG8gZ2VuZXJhdGUgYSBuZXcgY29udGV4dC5cbiAqIEB0eXBlZGVmIHtPYmplY3R9IEVudk9wdGlvbnNcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gIGRvdGVudiAtIFdoZXRoZXIgb3Igbm90IHRvIHJ1biBhIGRvdGVudiBjb25maWdcbiAqICAgICAgICAgICAgICAgICAgICAgIGxvYWQuXG4gKiBAcHJvcGVydHkge0Vudkxpc3R9ICBkZWZhdWx0cyAtIEEgbGlzdCBvZiBkZWZhdWx0IGVudmlyb25tZW50YWxcbiAqICAgICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlcy5cbiAqIEBwcm9wZXJ0eSB7RW52TGlzdH0gIGNvbnN0YW50cyAtIEEgbGlzdCBvZiBjb25zdGFudCBlbnZpcm9ubWVudGFsXG4gKiAgICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZXMuXG4gKiBAcHJvcGVydHkge3N0cmluZ1tdfSBlbnN1cmUgLSBBIGxpc3QgZW52aXJvbm1lbnRhbCB2YXJpYWJsZSBuYW1lcyB0aGF0XG4gKiAgICAgICAgICAgICAgICAgICAgICBtdXN0IGV4aXN0IGluIHRoZSBjb250ZXh0LCBvciB3ZSBleGl0IHRoZSBwcm9ncmFtLlxuICogQHByb3BlcnR5IHsqfSAgICAgICAgbWlzc1ZhbHVlIC0gVGhlIHZhbHVlIHRoYXQgaXMgcmV0dXJuZWQgd2hlbiB3ZVxuICogICAgICAgICAgICAgICAgICAgICAgY2FsbCBFbnZMaXN0LmdldCgpIG9uIGEgbWlzc2luZyB2YWx1ZS5cbiAqL1xuY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XG4gIGRvdGVudjogdHJ1ZSxcbiAgY29uc3RhbnRzOiB7fSxcbiAgZGVmYXVsdHM6IHt9LFxuICBlbnN1cmU6IFtdLFxuICBtaXNzVmFsdWU6IG51bGwsXG59O1xuXG5mdW5jdGlvbiBpc09iamVjdExpdGVyYWwob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBvYmouY29uc3RydWN0b3IgPT09IE9iamVjdDtcbn1cblxuZnVuY3Rpb24gaXNBcnJheUxpdGVyYWwob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBvYmouY29uc3RydWN0b3IgPT09IEFycmF5O1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUVudk9wdGlvbnMob3B0aW9ucykge1xuICBpZiAoIWlzT2JqZWN0TGl0ZXJhbChvcHRpb25zKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBpbnZhbGlkIG9wdGlvbnM6IGV4cGVjdGVkIG9iamVjdCBsaXRlcmFsLCByZWNlaXZlZDogJHtKU09OLnN0cmluZ2lmeShcbiAgICAgICAgb3B0aW9uc1xuICAgICAgKX1gXG4gICAgKTtcbiAgfVxuICBjb25zdCB3aGl0ZWxpc3RlZEZpZWxkcyA9IFtcbiAgICAnZG90ZW52JyxcbiAgICAnY29uc3RhbnRzJyxcbiAgICAnZGVmYXVsdHMnLFxuICAgICdlbnN1cmUnLFxuICAgICdtaXNzVmFsdWUnLFxuICBdO1xuICBjb25zdCBpbnZhbGlkRmllbGRzID0gW107XG4gIGZvciAoY29uc3QgcHJvcCBpbiBvcHRpb25zKSB7XG4gICAgaWYgKCF3aGl0ZWxpc3RlZEZpZWxkcy5pbmNsdWRlcyhwcm9wKSkge1xuICAgICAgaW52YWxpZEZpZWxkcy5wdXNoKHByb3ApO1xuICAgIH1cbiAgfVxuICBpZiAoaW52YWxpZEZpZWxkcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgaW52YWxpZCBvcHRpb25zOiBpbmNsdWRlcyBpbnZhbGlkIGZpZWxkczogJHtpbnZhbGlkRmllbGRzLmpvaW4oJywgJyl9YFxuICAgICk7XG4gIH1cblxuICBpZiAoXG4gICAgb3B0aW9ucy5kZWZhdWx0cyAmJlxuICAgICghaXNPYmplY3RMaXRlcmFsKG9wdGlvbnMuZGVmYXVsdHMpIHx8XG4gICAgICAhT2JqZWN0LnZhbHVlcyhvcHRpb25zLmRlZmF1bHRzKS5ldmVyeShpID0+IHR5cGVvZiBpID09PSAnc3RyaW5nJykpXG4gICkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBpbnZhbGlkIG9wdGlvbiBkZWZhdWx0czogZXhwZWN0ZWQgb2JqZWN0IGxpdGVyYWwgd2l0aCBzdHJpbmcga2V5c2BcbiAgICApO1xuICB9XG5cbiAgaWYgKFxuICAgIG9wdGlvbnMuY29uc3RhbnRzICYmXG4gICAgKCFpc09iamVjdExpdGVyYWwob3B0aW9ucy5jb25zdGFudHMpIHx8XG4gICAgICAhT2JqZWN0LnZhbHVlcyhvcHRpb25zLmNvbnN0YW50cykuZXZlcnkoaSA9PiB0eXBlb2YgaSA9PT0gJ3N0cmluZycpKVxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgaW52YWxpZCBvcHRpb24gY29uc3RhbnRzOiBleHBlY3RlZCBvYmplY3QgbGl0ZXJhbCB3aXRoIHN0cmluZyBrZXlzYFxuICAgICk7XG4gIH1cblxuICBpZiAoXG4gICAgb3B0aW9ucy5lbnN1cmUgJiZcbiAgICAoIWlzQXJyYXlMaXRlcmFsKG9wdGlvbnMuZW5zdXJlKSB8fFxuICAgICAgIW9wdGlvbnMuZW5zdXJlLmV2ZXJ5KGkgPT4gdHlwZW9mIGkgPT09ICdzdHJpbmcnKSlcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYGludmFsaWQgb3B0aW9uIGVuc3VyZTogZXhwZWN0ZWQgYXJyYXkgbGl0ZXJhbCB3aXRoIHN0cmluZyBpdGVtc2BcbiAgICApO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHNldCBvZiBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcyBmcm9tIHRoZSBjdXJyZW50IGNvbnRleHQsXG4gKiBhZnRlciBhcHBseWluZyBhbGwgcGFzc2VkIG9wdGlvbnMuIElmIGEgc2V0IG9mIG5hbWVzIHdlIHdhbnQgdG8gZW5zdXJlXG4gKiBleGlzdCBhcmUgcGFzc2VkLCB3aWxsIGFwcGx5IHRoZXNlIGFmdGVyIHRoZSBsaXN0IGlzIGdlbmVyYXRlZC5cbiAqIEBwYXJhbSB7RW52T3B0aW9uc30gW29wdGlvbnM9ZW52anMuZGVmYXVsdE9wdGlvbnNdXG4gKiBAcmV0dXJucyB7RW52TGlzdH0gVGhlIHJlc2V0LCBuZXdseS1nZW5lcmF0ZWQgZW52aXJvbm1lbnRhbCB2YXJpYWJsZXMuXG4gKi9cbmZ1bmN0aW9uIGVudmpzKG9wdGlvbnMgPSB7fSkge1xuICByZXR1cm4gZW52anMuc2V0KG9wdGlvbnMpO1xufVxuZW52anMuZGVmYXVsdE9wdGlvbnMgPSBkZWZhdWx0T3B0aW9ucztcbmVudmpzLnZhbGlkYXRlRW52T3B0aW9ucyA9IHZhbGlkYXRlRW52T3B0aW9ucztcbmVudmpzLkVudkxpc3QgPSBFbnZMaXN0O1xuZW52anMuX2NsZWFyQ3R4ID0gY2xlYXJDdHg7XG5lbnZqcy5fZ2VuZXJhdGVGcm9tQ3R4ID0gZ2VuZXJhdGVGcm9tQ3R4O1xuZW52anMuX2VtcHR5Q3R4ID0gbWVtby5lbXB0eUN0eDtcbmVudmpzLl9leGl0ID0gZXhpdDtcblxuZW52anMuc2V0ID0gZnVuY3Rpb24ob3B0aW9ucyA9IHt9KSB7XG4gIGVudmpzLnZhbGlkYXRlRW52T3B0aW9ucyhvcHRpb25zKTtcbiAgY29uc3Qgb3B0cyA9IGNvcHkoZW52anMuZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gIG1lbW8uY3R4LnByb2Nlc3MgPSBjb3B5KG1lbW8uY3R4LnByb2Nlc3MsIHByb2Nlc3MuZW52KTtcbiAgbWVtby5jdHguZGVmYXVsdHMgPSBjb3B5KG1lbW8uY3R4LmRlZmF1bHRzLCBvcHRzLmRlZmF1bHRzKTtcbiAgbWVtby5jdHguY29uc3RhbnRzID0gY29weShtZW1vLmN0eC5jb25zdGFudHMsIG9wdHMuY29uc3RhbnRzKTtcblxuICAvLyBpZiAob3B0cy5kb3RlbnYpIHtcbiAgLy8gICBlbnZqcy5kb3RlbnYoKTsgLy8gTk9URTogbG9zZXMgY29udHJvbCBvZiB0aHJlYWQuIFJhY2UgY29uZGl0aW9uLlxuICAvLyB9XG5cbiAgY29uc3Qgb2JqID0gZW52anMuX2dlbmVyYXRlRnJvbUN0eChvcHRzLm1pc3NWYWx1ZSk7XG4gIGNvbnN0IGV4cGVjdGVkID0gb3B0cy5lbnN1cmU7XG4gIGlmIChleHBlY3RlZC5sZW5ndGgpIHtcbiAgICBlbnZqcy5jaGVjayhleHBlY3RlZCwgT2JqZWN0LmtleXMob2JqKSwge1xuICAgICAgbG9nT25NaXNzOiB0cnVlLFxuICAgICAgZXhpdE9uTWlzczogdHJ1ZSxcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gb2JqO1xufTtcblxuLyoqXG4gKiBBIGJhc2ljIGdldHRlciBmb3IgdGhlIGludGVybmFsIGNvbnRleHQgXCJjdHhcIiB2YWx1ZS5cbiAqIEByZXR1cm5zIHtFbnZDb250ZXh0fVxuICovXG5lbnZqcy5jdHggPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGNvcHkobWVtby5jdHgpO1xufTtcblxuLyoqXG4gKiBDbGVhcnMgb3V0IHRoZSBjb250ZXh0IGFuZCByZWdlbmVyYXRlcyBpdCBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuXG4gKiBvcHRpb25zLlxuICogQHBhcmFtIHtFbnZPcHRpb25zfSBbb3B0aW9ucz1lbnZqcy5kZWZhdWx0T3B0aW9uc11cbiAqIEByZXR1cm5zIHtFbnZMaXN0fSBUaGUgcmVzZXQsIG5ld2x5LWdlbmVyYXRlZCBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcy5cbiAqL1xuZW52anMucmVzZXQgPSBmdW5jdGlvbihvcHRzKSB7XG4gIGVudmpzLl9jbGVhckN0eCgpO1xuICByZXR1cm4gZW52anMuc2V0KG9wdHMpO1xufTtcblxuLyoqXG4gKiBFbnN1cmVzIHRoYXQgc29tZSB2YXJpYWJsZSBvciBzZXQgb2YgdmFyaWFibGVzIGFyZSBkZWZpbmVkIGluIHRoZVxuICogY3VycmVudCBjb250ZXh0LiBBbGxvd3MgYSBsaXN0IG9mIGRlZmluZWQgdmFyaWFibGVzIHRvIGJlIHBhc3NlZCwgYXNcbiAqIHdlbGwgYXMgb3B0aW9ucyB0aGF0IGRlZmluZSB3aGF0IGhhcHBlbnMgd2hlbiB0aGVyZSBpcyBhIG1pc3NpbmdcbiAqIHZhcmlhYmxlLiBCeSBkZWZhdWx0IGEgbWlzcyB3aWxsIGV4aXQgdGhlIHByb2Nlc3Mgd2l0aCBhbiBleGl0IHZhbHVlXG4gKiBvZiAxLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gW2V4cGVjdGVkPVtdXSAtIFRoZSBsaXN0IG9mIHZhcmlhYmxlIG5hbWVzIHdlIGV4cGVjdFxuICogICAgICAgICAgICAgICAgICAgdG8gaGF2ZSBiZWVuIGRlZmluZWQuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBhY3R1YWwgLSBJZiBwYXNzZWQsIHRoaXMgaXMgdGhlIGxpc3Qgb2YgZGVmaW5lZFxuICogICAgICAgICAgICAgICAgICAgdmFyaWFibGUgbmFtZXMgd2UgY2hlY2sgYWdhaW5zdCAoaW5zdGVhZCBvZiB0aG9zZVxuICogICAgICAgICAgICAgICAgICAgZGVmaW5lZCBpbiB0aGUgY3VycmVudCBjb250ZXh0KS5cbiAqIEBwYXJhbSB7T2JqZWN0fSAgIG9wdHMgLSBPcHRpb25zLlxuICogQHBhcmFtIHtib29sZWFufSAgW29wdHMuc2lsZW50PWZhbHNlXSAtIFdoZXRoZXIgb3Igbm90IHRvIGxvZyBtaXNzaW5nXG4gKiAgICAgICAgICAgICAgICAgICB2YXJpYWJsZSBuYW1lcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gIFtvcHRzLmV4aXRPbk1pc3M9dHJ1ZV0gLSBXaGV0aGVyIG9yIG5vdCB0byBleGl0IHRoZVxuICogICAgICAgICAgICAgICAgICAgcHJvY2VzcyBpZiBhbnkgbmFtZXMgYXJlIG1pc3NpbmcuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBhbGwgdGhlIGV4cGVjdGVkIHZhcmlhYmxlcyBhcmUgZGVmaW5lZCxcbiAqICAgICAgICAgICAgICAgICAgICBmYWxzZSBvdGhlcndpc2UuIE9ubHkgcnVucyBpZiB0cnVlIG9yIGlmIHRoZVxuICogICAgICAgICAgICAgICAgICAgIGV4aXRPbk1pc3Mgb3B0aW9uIGlzIHNldCB0byBmYWxzZS5cbiAqXG4gKiBAdG9kbyBBZGQgYW4gb3B0aW9uIHRvIHRocm93T25NaXNzLCB0aGF0IGNvbGxlY3RzIHRoZSBlcnJvciBtZXNzYWdlc1xuICogICAgICAgYW5kIHRoZW4gdGhyb3dzIGFuIGVycm9yIGF0IHRoZSBlbmQgb2YgdGhlIGZ1bmN0aW9uLlxuICovXG5lbnZqcy5jaGVjayA9IGZ1bmN0aW9uKFxuICBleHBlY3RlZCA9IFtdLFxuICBhY3R1YWwgPSBbXSxcbiAgb3B0cyA9IHtcbiAgICBsb2dPbk1pc3M6IGZhbHNlLFxuICAgIGV4aXRPbk1pc3M6IGZhbHNlLFxuICAgIHRocm93T25NaXNzOiBmYWxzZSxcbiAgfVxuKSB7XG4gIGlmICghaXNBcnJheUxpdGVyYWwoZXhwZWN0ZWQpIHx8ICFpc0FycmF5TGl0ZXJhbChhY3R1YWwpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHZhbHVlcyB0byBjaGVjaycpO1xuICB9XG5cbiAgY29uc3QgbWlzc2luZyA9IFtdO1xuICBleHBlY3RlZC5mb3JFYWNoKHYgPT4ge1xuICAgIGlmICghYWN0dWFsLmluY2x1ZGVzKHYpKSB7XG4gICAgICBtaXNzaW5nLnB1c2godik7XG4gICAgfVxuICB9KTtcblxuICBpZiAobWlzc2luZy5sZW5ndGggIT09IDAgJiYgb3B0cy5sb2dPbk1pc3MpIHtcbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgbWlzc2luZy5tYXAodiA9PiBgW0VSUl0gbWlzc2luZyByZXF1aXJlZCBlbnYgdmFyIHske3Z9fWApLmpvaW4oJ1xcbicpXG4gICAgKTtcbiAgfVxuXG4gIGlmIChtaXNzaW5nLmxlbmd0aCAhPT0gMCAmJiBvcHRzLnRocm93T25NaXNzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBtaXNzaW5nIHJlcXVpcmVkIGVudiB2YXJzOiAke21pc3Npbmcuam9pbignLCAnKX1gKTtcbiAgfVxuXG4gIGlmIChtaXNzaW5nLmxlbmd0aCAhPT0gMCAmJiBvcHRzLmV4aXRPbk1pc3MpIHtcbiAgICBlbnZqcy5fZXhpdCgpO1xuICB9XG5cbiAgcmV0dXJuIG1pc3NpbmcubGVuZ3RoID09PSAwO1xufTtcblxuZW52anMuZW5zdXJlID0gZnVuY3Rpb24oZXhwZWN0ZWQpIHtcbiAgcmV0dXJuIGVudmpzLmNoZWNrKGV4cGVjdGVkLCBPYmplY3Qua2V5cyh2YWx1ZXNGcm9tKG1lbW8uY3R4KSksIHtcbiAgICB0aHJvd09uTWlzczogdHJ1ZSxcbiAgfSk7XG59O1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IERvdGVudlJlc3VsdFxuICogQHByb3BlcnR5IHtFbnZMaXN0fSBkb3RlbnYgLSBUaGUgbGlzdCBvZiBlbnZpcm9ubWVudGFsIHZhcmlhYmxlc1xuICogICAgICAgICAgICAgICAgICAgICBsb2FkZWQsIGlmIGFueSwgZnJvbSB0aGUgLmVudiBmaWxlLlxuICogQHByb3BlcnR5IHtFcnJvcn0gICBlcnJvciAtIEFueSBlcnJvciAodXN1YWxseSwgbWlzc2luZyAuZW52IGZpbGUpXG4gKiAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlZCBieSBydW5uaW5nIGRvdGVudi5jb25maWcoKS5cbiAqL1xuXG4vKipcbiAqIExvYWRzIHZhcmlhYmxlcyBmcm9tIGEgLmVudiBmaWxlLiBVc2VzIHRoZSBzdGFuZGFyZCBtb2R1bGVuIFwiZG90ZW52XCIsXG4gKiBidXQga2VlcHMgdGhlIHByb2Nlc3MuZW52IGZyZWUgb2YgdGhlIHZhcmlhYmxlcyB0aGF0IGFyZSBsb2FkZWQsXG4gKiBhZGRpbmcgdGhlbSB0byB0aGUgaW50ZXJuYWwgY3R4LmRvdGVudiBsaXN0LiBBbnkgZXJyb3JzIHRoYXQgYXJlXG4gKiBnZW5lcmF0ZWQgYXJlIGFkZGVkIHRvIGN0eC5lcnJvcnMuZG90ZW52IChjdXJyZW50bHkgdGhlIG9ubHkgc291cmNlXG4gKiBvZiBlcnJvcnMgaW4gdGhlIGNvbnRleHQpLlxuICogQHJldHVybnMge0RvdGVudlJlc3VsdH1cbiAqL1xuLy8gZW52anMuZG90ZW52ID0gZnVuY3Rpb24oKSB7XG4vLyAgIC8vIEVuc3VyZSB3ZSBoYXZlIGEgY29weSBvZiB0aGUgY3VycmVudCBwcm9jZXNzLmVudiwgdGhlbiBydW4gZG90ZW52LlxuLy8gICBtZW1vLmN0eC5wcm9jZXNzID0gY29weShwcm9jZXNzLmVudik7XG4vLyAgIGNvbnN0IHsgcGFyc2VkLCBlcnJvciB9ID0gZG90ZW52LmNvbmZpZygpO1xuXG4vLyAgIC8vIElkZW50aWZ5IHdoYXQgdmFycyAoaWYgYW55KSB3ZXJlIGFwcGVuZGVkIGJ5IGRvdGVudiwgYW5kIGFkZCB0byBjdHguXG4vLyAgIGlmIChwYXJzZWQpIHtcbi8vICAgICBPYmplY3Qua2V5cyhwYXJzZWQpLmZvckVhY2gocHJvcCA9PiB7XG4vLyAgICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtZW1vLmN0eC5wcm9jZXNzLCBwcm9wKSkge1xuLy8gICAgICAgICBtZW1vLmN0eC5kb3RlbnZbcHJvcF0gPSBwYXJzZWRbcHJvcF07XG4vLyAgICAgICB9XG4vLyAgICAgfSk7XG4vLyAgIH1cblxuLy8gICAvLyBNZXJnZSBpbiBhbnkgZXJyb3JzXG4vLyAgIGlmIChlcnJvcikge1xuLy8gICAgIG1lbW8uY3R4LmVycm9ycyA9IE9iamVjdC5hc3NpZ24obWVtby5jdHguZXJyb3JzLCB7IGRvdGVudjogeyBlcnJvciB9IH0pO1xuLy8gICB9XG5cbi8vICAgLy8gUmVzdG9yZSB0aGUgY2xlYW4sIHByZS1kb3RlbnYgcHJvY2Vzcy5lbnZcbi8vICAgcHJvY2Vzcy5lbnYgPSBjb3B5KG1lbW8uY3R4LnByb2Nlc3MpO1xuLy8gICByZXR1cm4geyBkb3RlbnY6IG1lbW8uY3R4LmRvdGVudiwgZXJyb3I6IGVycm9yIH07XG4vLyB9O1xuXG4vLyBMb2FkIHRoZSBjdXJyZW50IHN0YXRlIG9mIHByb2Nlc3MuZW52anMuXG5lbnZqcy5fY2xlYXJDdHgoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBlbnZqcztcbiJdLCJuYW1lcyI6WyJjb3B5IiwiT2JqZWN0IiwiYXNzaWduIiwiQXJyYXkiLCJmcm9tIiwiYXJndW1lbnRzIiwiZXhpdCIsInByb2Nlc3MiLCJtZW1vIiwiY3R4IiwiZW1wdHlDdHgiLCJkZWZhdWx0cyIsImRvdGVudiIsImNvbnN0YW50cyIsImVycm9ycyIsIm1pc3NWYWx1ZSIsImNsZWFyQ3R4IiwiZW52anMiLCJfZW1wdHlDdHgiLCJ2YWx1ZXNGcm9tIiwiRW52TGlzdCIsIm5hbWUiLCJfc3RhdGljVmFsdWVzIiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiaW5jbHVkZSIsImdlbmVyYXRlRnJvbUN0eCIsInByb3RvIiwiY3JlYXRlIiwiZGVmYXVsdE9wdGlvbnMiLCJlbnN1cmUiLCJpc09iamVjdExpdGVyYWwiLCJvYmoiLCJjb25zdHJ1Y3RvciIsImlzQXJyYXlMaXRlcmFsIiwidmFsaWRhdGVFbnZPcHRpb25zIiwib3B0aW9ucyIsIkVycm9yIiwiSlNPTiIsInN0cmluZ2lmeSIsIndoaXRlbGlzdGVkRmllbGRzIiwiaW52YWxpZEZpZWxkcyIsInByb3AiLCJpbmNsdWRlcyIsInB1c2giLCJsZW5ndGgiLCJqb2luIiwidmFsdWVzIiwiZXZlcnkiLCJpIiwic2V0IiwiX2NsZWFyQ3R4IiwiX2dlbmVyYXRlRnJvbUN0eCIsIl9leGl0Iiwib3B0cyIsImVudiIsImV4cGVjdGVkIiwiY2hlY2siLCJrZXlzIiwibG9nT25NaXNzIiwiZXhpdE9uTWlzcyIsInJlc2V0IiwiYWN0dWFsIiwidGhyb3dPbk1pc3MiLCJtaXNzaW5nIiwiZm9yRWFjaCIsInYiLCJjb25zb2xlIiwiZXJyb3IiLCJtYXAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBRUEsU0FBU0EsSUFBVCxHQUFnQjtFQUNkLFNBQU9DLE1BQU0sQ0FBQ0MsTUFBUCxPQUFBRCxNQUFNLEdBQVEsRUFBUiw0QkFBZUUsS0FBSyxDQUFDQyxJQUFOLENBQVdDLFNBQVgsQ0FBZixHQUFiO0VBQ0Q7O0VBRUQsU0FBU0MsSUFBVCxHQUFnQjtFQUNkQyxFQUFBQSxPQUFPLENBQUNELElBQVIsQ0FBYSxDQUFiO0VBQ0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBK0JELElBQU1FLElBQUksR0FBRztFQUNYQyxFQUFBQSxHQUFHLEVBQUUsSUFETTtFQUVYQyxFQUFBQSxRQUFRLEVBQUU7RUFDUkMsSUFBQUEsUUFBUSxFQUFFLEVBREY7RUFFUkMsSUFBQUEsTUFBTSxFQUFFLEVBRkE7RUFHUkwsSUFBQUEsT0FBTyxFQUFFLEVBSEQ7RUFJUk0sSUFBQUEsU0FBUyxFQUFFLEVBSkg7RUFLUkMsSUFBQUEsTUFBTSxFQUFFLEVBTEE7RUFNUkMsSUFBQUEsU0FBUyxFQUFFO0VBTkg7RUFGQyxDQUFiOzs7Ozs7RUFnQkEsU0FBU0MsUUFBVCxHQUFvQjtFQUNsQlIsRUFBQUEsSUFBSSxDQUFDQyxHQUFMLEdBQVdULElBQUksQ0FBQ2lCLEtBQUssQ0FBQ0MsU0FBUCxDQUFmO0VBQ0Q7O0VBRUQsU0FBU0MsVUFBVCxDQUFvQlYsR0FBcEIsRUFBeUI7RUFDdkIsU0FBT1QsSUFBSSxDQUFDUyxHQUFHLENBQUNFLFFBQUwsRUFBZUYsR0FBRyxDQUFDRyxNQUFuQixFQUEyQkgsR0FBRyxDQUFDRixPQUEvQixFQUF3Q0UsR0FBRyxDQUFDSSxTQUE1QyxDQUFYO0VBQ0Q7Ozs7Ozs7Ozs7Ozs7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
