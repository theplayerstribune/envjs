const fs = require('fs');
const util = require('util');
jest.mock('fs');

const assert = require('assert');

const envjs = require('.');

const START_ENV = process.env;
const START_CWD = process.cwd;

function i(val) {
  return util.inspect(val, false, null, true);
}

// A simpler way to match the state of the context by enumerating what
// parts are different from an empty context, with the option to just
// ignore the errors field that is populated by dotenv.
expect.extend({
  toMatchContextWith(
    actual,
    expectedPartial,
    options = { ignoreErrors: true }
  ) {
    const expected = Object.assign({}, envjs._emptyCtx, expectedPartial);

    if (options.ignoreErrors) {
      delete actual.errors;
      delete expected.errors;
    }

    const pass = this.equals(actual, expected);

    if (pass) {
      return {
        pass: true,
        message: () =>
          `expected\n  ${i(expected)}\n not to match\n  ${i(actual)}`,
      };
    } else {
      return {
        pass: false,
        message: () => `expected\n  ${i(expected)}\n to match\n  ${i(actual)}`,
      };
    }
  },
});

beforeEach(() => {
  jest.resetModules();
  jest.restoreAllMocks();
  process.env = {};
  process.cwd = jest.fn(() => '/current');
  envjs._clearCtx();
  fs.reset();
  fs.mkdirSync('/current');
  fs._cwd = '/current';
});

afterEach(() => {
  process.env = START_ENV;
  process.cwd = START_CWD;
});

describe('the default export', () => {
  test('is a function with methods on it', () => {
    expect(typeof envjs).toBe('function');
    expect(typeof envjs.ctx).toBe('function');
    expect(typeof envjs.update).toBe('function');
    expect(typeof envjs.reset).toBe('function');
    expect(typeof envjs.check).toBe('function');
    expect(typeof envjs.ensure).toBe('function');
    expect(typeof envjs.load).toBe('function');
  });

  test('includes a direct reference to then context for debugging', () => {
    expect(envjs.__m.ctx).toEqual(envjs._emptyCtx);
    process.env = { ONE: 'one' };
    fs.writeFileSync('/current/.env', 'TWO=two');
    envjs();
    expect(envjs.__m.ctx).toMatchContextWith({
      process: { ONE: 'one' },
      dotenv: { TWO: 'two' },
    });
  });

  test('wraps update()', () => {
    const envjsset = jest
      .spyOn(envjs, 'update')
      .mockImplementation(() => 'returned');
    const options = { default: { EXAMPLE: 'one' } };
    expect(envjs(options)).toBe('returned');
    expect(envjsset).toHaveBeenCalledWith(options);
  });
});

describe('ctx()', () => {
  test('returns an empty context to begin with', () => {
    expect(envjs.ctx()).toEqual(envjs._emptyCtx);
  });
  test('returns a copy of the shared context object', () => {
    expect(envjs.ctx()).not.toBe(envjs.ctx());
    expect(envjs.ctx()).toEqual(envjs.ctx());
  });
});

describe('update()', () => {
  test('updates the memoized, shared context', () => {
    process.env = { ONE: 'one' };
    expect(envjs.ctx()).toEqual(envjs._emptyCtx);
    envjs.update();
    expect(envjs.ctx()).toMatchContextWith({ process: { ONE: 'one' } });
  });

  describe('returns an EnvList object', () => {
    test('with the values from the process.env statically set on it', () => {
      process.env = {
        ONE: 'one',
        TWO: 'two',
        THREE: 'three',
      };

      const envvars = envjs.update();

      expect(envvars).toBeInstanceOf(envjs.EnvList);
      for (const envvar in process.env) {
        expect(envvars).toHaveProperty(envvar, process.env[envvar]);
      }
    });

    test('with the .get, .include/.includes, and .setMissValue methods', () => {
      const envvars = envjs.update();
      expect(typeof envvars.get).toEqual('function');
      expect(typeof envvars.include).toEqual('function');
      expect(typeof envvars.includes).toEqual('function');
      expect(typeof envvars.setMissValue).toEqual('function');
    });

    test('with methods/props on the prototype, for iteration, &c', () => {
      process.env = {
        ONE: 'one',
        TWO: 'two',
        THREE: 'three',
      };
      expect(envjs.update()).toEqual({
        ONE: 'one',
        TWO: 'two',
        THREE: 'three',
      });
    });
  });

  describe('accepts an EnvOptions object', () => {
    test('such that defaults are set on the returned EnvList', () => {
      process.env = {
        ONE: 'one',
      };
      const envvars = envjs.update({
        defaults: {
          TWO: 'two',
        },
      });
      expect(envvars).toEqual({
        ONE: 'one',
        TWO: 'two',
      });
    });

    test('such that defaults are overriden by process.env', () => {
      process.env = {
        ONE: 'one',
      };
      const envvars = envjs.update({
        defaults: {
          ONE: 'wunwun',
          TWO: 'two',
        },
      });
      expect(envvars).toEqual({
        ONE: 'one',
        TWO: 'two',
      });
    });

    test('such that defaults are overriden by dotenv', () => {
      fs.writeFileSync('/current/.env', 'ONE=one');
      const envvars = envjs.update({
        defaults: {
          ONE: 'wunwun',
          TWO: 'two',
        },
      });
      expect(envvars).toEqual({
        ONE: 'one',
        TWO: 'two',
      });
    });

    test('such that constants are set on the returned EnvList', () => {
      const envvars = envjs.update({
        constants: {
          ONE: 'one',
        },
      });
      expect(envvars).toEqual({ ONE: 'one' });
    });

    test('such that constants cannot be overriden', () => {
      fs.writeFileSync('/current/.env', 'TWO=two');
      process.env = {
        ONE: 'one',
      };
      const envvars = envjs.update({
        defaults: {
          ONE: 'wunwun',
        },
        constants: {
          ONE: 'bumbum',
          TWO: 'booboo',
        },
      });
      expect(envvars).toEqual({ ONE: 'bumbum', TWO: 'booboo' });
    });

    test('such that missValue sets the EnvLists default missValue', () => {
      const envvars = envjs.update({
        missValue: 0,
      });
      expect(envvars.get('TEST')).toBe(0);
    });

    test('such that the ensure option calls the check() method with context and options', () => {
      const envjscheck = jest
        .spyOn(envjs, 'check')
        .mockImplementation(() => true);
      fs.writeFileSync('/current/.env', 'FOUR=four');
      process.env = {
        ONE: 'one',
      };
      envjs.update({
        defaults: { TWO: 'two' },
        constants: { THREE: 'three' },
        ensure: ['ONE', 'TWO', 'THREE', 'FOUR'],
      });
      expect(envjscheck).toHaveBeenCalledWith(
        ['ONE', 'TWO', 'THREE', 'FOUR'],
        ['TWO', 'FOUR', 'ONE', 'THREE'],
        { logOnMiss: true, exitOnMiss: true }
      );
    });

    test('such that dotenv options calls the load() method by default', () => {
      const envjsload = jest
        .spyOn(envjs, 'load')
        .mockImplementation(() => ({}));
      envjs.update();
      expect(envjsload).toHaveBeenCalled();
    });

    test('such that a dotenv option of false precludes load()', () => {
      fs.writeFileSync('/current/.env', 'ONE=one');
      process.env = { TWO: 'two' };
      const envvars = envjs.update({ dotenv: false });
      expect(envvars).toEqual({ TWO: 'two' });
    });

    test('that does not mutate process.env', () => {
      fs.writeFileSync('/current/.env', 'ONE=won');
      process.env = {
        ONE: 'one',
      };
      envjs.update({
        defaults: {
          ONE: 'wunwun',
        },
        constants: {
          ONE: 'bumbum',
        },
      });
      expect(process.env).toEqual({ ONE: 'one' });
    });

    test('that allows process.env values to take precedence over dotenv', () => {
      fs.writeFileSync('/current/.env', 'ONE=wunwun');
      process.env = { ONE: 'one' };
      const envvars = envjs.update();
      expect(envvars).toEqual({ ONE: 'one' });
    });

    test('that updates the shared, memoized context for all options', () => {
      fs.writeFileSync('/current/.env', 'ONE=one');
      process.env = { TWO: 'two' };
      envjs.update({
        defaults: {
          THREE: 'three',
        },
        constants: {
          FOUR: 'four',
        },
      });
      expect(envjs.ctx()).toMatchContextWith({
        dotenv: { ONE: 'one' },
        process: { TWO: 'two' },
        defaults: { THREE: 'three' },
        constants: { FOUR: 'four' },
      });
    });
  });

  test('validates EnvOptions', () => {
    const envjsvalidateEnvOptions = jest.spyOn(envjs, 'validateEnvOptions');
    const options = { defaults: { TEST: 'me' } };
    envjs(options);
    expect(envjsvalidateEnvOptions).toHaveBeenCalledWith(options);
  });

  test('on subsequent calls, cumulatively merges on to the context', () => {
    fs.writeFileSync('/current/.env', 'OMEGA=omega\nPI=pi');
    process.env = { ZERO: 'zero', ONE: 'one' };
    envjs.update({
      defaults: {
        ALPHA: 'alpha',
        TWO: 'two',
      },
      constants: {
        BETA: 'beta',
        THREE: 'three',
      },
    });
    fs.writeFileSync('/current/.env', 'OMEGA=omegaomega\nCHI=chichi');
    process.env = { ONE: 'oneone', SIX: 'sixsix' };
    const envvars = envjs.update({
      defaults: {
        TWO: 'twotwo',
        FOUR: 'fourfour',
      },
      constants: {
        THREE: 'threethree',
        FIVE: 'fivefive',
      },
    });
    expect(envjs.ctx()).toMatchContextWith({
      process: { ZERO: 'zero', ONE: 'oneone', SIX: 'sixsix' },
      dotenv: { OMEGA: 'omegaomega', PI: 'pi', CHI: 'chichi' },
      defaults: {
        ALPHA: 'alpha',
        TWO: 'twotwo',
        FOUR: 'fourfour',
      },
      constants: {
        BETA: 'beta',
        THREE: 'threethree',
        FIVE: 'fivefive',
      },
    });
    expect(envvars).toEqual({
      ALPHA: 'alpha',
      BETA: 'beta',
      ZERO: 'zero',
      ONE: 'oneone',
      TWO: 'twotwo',
      FOUR: 'fourfour',
      THREE: 'threethree',
      FIVE: 'fivefive',
      SIX: 'sixsix',
      OMEGA: 'omegaomega',
      PI: 'pi',
      CHI: 'chichi',
    });
  });
});

describe('reset()', () => {
  test('wraps update()', () => {
    const envjsset = jest
      .spyOn(envjs, 'update')
      .mockImplementation(() => 'returned');
    const options = { default: { EXAMPLE: 'one' } };
    expect(envjs.reset(options)).toBe('returned');
    expect(envjsset).toHaveBeenCalledWith(options);
  });
  test('but clears out the context before updating', () => {
    fs.writeFileSync('/current/.env', 'OMEGA=omega\nPI=pi');
    process.env = { ZERO: 'zero', ONE: 'one' };
    envjs.update({
      defaults: {
        ALPHA: 'alpha',
        TWO: 'two',
      },
      constants: {
        BETA: 'beta',
        THREE: 'three',
      },
    });
    fs.writeFileSync('/current/.env', 'OMEGA=omegaomega\nCHI=chichi');
    process.env = { ONE: 'oneone', SIX: 'sixsix' };
    const envvars = envjs.reset({
      defaults: {
        TWO: 'twotwo',
        FOUR: 'fourfour',
      },
      constants: {
        THREE: 'threethree',
        FIVE: 'fivefive',
      },
    });
    expect(envjs.ctx()).toMatchContextWith({
      process: { ONE: 'oneone', SIX: 'sixsix' },
      dotenv: { OMEGA: 'omegaomega', CHI: 'chichi' },
      defaults: {
        TWO: 'twotwo',
        FOUR: 'fourfour',
      },
      constants: {
        THREE: 'threethree',
        FIVE: 'fivefive',
      },
    });
    expect(envvars).toEqual({
      ONE: 'oneone',
      TWO: 'twotwo',
      FOUR: 'fourfour',
      THREE: 'threethree',
      FIVE: 'fivefive',
      SIX: 'sixsix',
      OMEGA: 'omegaomega',
      CHI: 'chichi',
    });
  });
});

describe('check()', () => {
  test('defaults to empty arrays for each', () => {
    expect(envjs.check()).toBe(true);
    expect(envjs.check([])).toBe(true);
  });
  test('returns whether or not all expected (first param) exist in actual (second param)', () => {
    expect(envjs.check(['ONE'], ['ONE'])).toBe(true);
    expect(envjs.check(['ONE', 'TWO', 'THREE'], ['ONE'])).toBe(false);
  });
  test('throws when an expected or actual is passed not as an array of strings', () => {
    expect(() => envjs.check('ONE')).toThrow();
    expect(() => envjs.check([], 'ONE')).toThrow();
  });
  test('when option logOnMiss is passed missing are printed to stderr', () => {
    const consoleerror = jest.spyOn(console, 'error').mockImplementation(() => {
      /* noop */
    });
    envjs.check(['ONE', 'TWO', 'THREE'], ['ONE'], { logOnMiss: true });
    expect(consoleerror).toHaveBeenCalledWith(
      `
[ERR] missing required env var {TWO}
[ERR] missing required env var {THREE}
    `.trim()
    );
  });
  test('when option exitOnMiss is passed we call out to _exit, ie process.exit', () => {
    const envjs_exit = jest.spyOn(envjs, '_exit').mockImplementation(() => {
      /* noop */
    });
    envjs.check(['ONE', 'TWO', 'THREE'], ['ONE'], { exitOnMiss: true });
    expect(envjs_exit).toHaveBeenCalled();
  });
  test('when option throwOnMiss is passed missing are thrown', () => {
    expect(() =>
      envjs.check(['ONE', 'TWO', 'THREE'], ['ONE'], { throwOnMiss: true })
    ).toThrowError('missing required env vars: TWO, THREE');
  });
});

describe('ensure()', () => {
  test('wraps check(), passing it the values from the context and throws', () => {
    const envjscheck = jest
      .spyOn(envjs, 'check')
      .mockImplementation(() => true);
    const expected = ['ONE', 'TWO'];
    process.env = { ONE: 'one' };
    envjs({
      defaults: { TWO: 'two' },
      constants: { THREE: 'three' },
    });
    envjs.ensure(expected);
    expect(envjscheck).toHaveBeenCalledWith(expected, ['TWO', 'ONE', 'THREE'], {
      throwOnMiss: true,
    });
  });
});

describe('load()', () => {
  test('returns an object with the values in a dotenv', () => {
    fs.writeFileSync('/current/.env', 'ONE=wunwun\nTWO=desmond-tutu\nTHREE=3');
    expect(envjs.load()).toEqual({
      dotenv: { ONE: 'wunwun', TWO: 'desmond-tutu', THREE: '3' },
    });
  });
  test('returns an object with any error from running dotenv', () => {
    expect(envjs.load()).toEqual(
      expect.objectContaining({
        error: expect.any(Object),
      })
    );
  });
  test('merges the dotenv values and error into the context', () => {
    const { error } = envjs.load();
    expect(envjs.ctx()).toEqual(
      expect.objectContaining({
        errors: { dotenv: { error } },
      })
    );
    envjs.reset();
    fs.writeFileSync('/current/.env', 'ONE=wunwun');
    const { dotenv } = envjs.load();
    expect(envjs.ctx()).toEqual(
      expect.objectContaining({
        dotenv,
      })
    );
  });
  test('does not mutate process.env', () => {
    process.env = { ONE: 'one' };
    fs.writeFileSync('/current/.env', 'ONE=wunwun\nTWO=desmond-tutu\nTHREE=3');
    envjs.load();
    expect(process.env).toEqual({ ONE: 'one' });
  });
});

describe('validateEnvOptions()', () => {
  test('throws when options is not a literal object', () => {
    function TestClass() {
      /* noop */
    }
    expect(() => envjs.validateEnvOptions()).toThrow();
    expect(() => envjs.validateEnvOptions('string')).toThrow();
    expect(() => envjs.validateEnvOptions(new TestClass())).toThrow();
    expect(() => envjs.validateEnvOptions({})).not.toThrow();
  });
  test('throws when any option other than allowed, with all unallowed', () => {
    expect(() =>
      envjs.validateEnvOptions({
        defaults: {},
        constant: {},
        dtenv: false,
        ensures: [],
      })
    ).toThrowError(/constant.+dtenv.+ensures/);
  });
  test('throws when the defaults option is not a literal object with string keys', () => {
    expect(() => envjs.validateEnvOptions({ defaults: {} })).not.toThrow();
    expect(() => envjs.validateEnvOptions({ defaults: 'string' })).toThrow();
    expect(() => envjs.validateEnvOptions({ defaults: { KEY: [] } })).toThrow();
  });
  test('throws when the constants option is not a literal object with string keys', () => {
    expect(() => envjs.validateEnvOptions({ constants: {} })).not.toThrow();
    expect(() => envjs.validateEnvOptions({ constants: 'string' })).toThrow();
    expect(() =>
      envjs.validateEnvOptions({ constants: { KEY: [] } })
    ).toThrow();
  });
  test('throws when the ensure option is not a literal array of strings', () => {
    expect(() => envjs.validateEnvOptions({ ensure: [] })).not.toThrow();
    expect(() => envjs.validateEnvOptions({ ensure: 'string' })).toThrow();
    expect(() => envjs.validateEnvOptions({ ensure: [[]] })).toThrow();
  });
});

describe('EnvLists', () => {
  test('include a static ctx representation as properties', () => {
    process.env = { ONE: 'one' };
    const envvars = envjs();
    expect(envvars.ONE).toEqual('one');
  });

  test('dynamically query the ctx with .get()', () => {
    process.env = { ONE: 'one', TWO: 'two' };
    const envvars = envjs();
    expect(envvars.ONE).toEqual('one');
    expect(envvars.get('ONE')).toEqual('one');
    expect(envvars.TWO).toEqual('two');
    expect(envvars.get('TWO')).toEqual('two');
    expect(envvars.THREE).toBeUndefined();
    expect(envvars.get('THREE')).toBeNull();

    process.env = { ONE: 'won', THREE: 'three' };
    envjs.reset();
    expect(envvars.ONE).toEqual('one');
    expect(envvars.get('ONE')).toEqual('won');
    expect(envvars.TWO).toEqual('two');
    expect(envvars.get('TWO')).toBeNull();
    expect(envvars.THREE).toBeUndefined();
    expect(envvars.get('THREE')).toEqual('three');
  });

  test('dynamically query in a mockable way for testing', () => {
    process.env = { ONE: 'one', TWO: 'two' };
    const envvars = envjs();
    envjs.__m.ctx.process.ONE = 'wunwun';
    envjs.__m.ctx.process.THREE = 'three';

    expect(envvars.get('ONE')).toEqual('wunwun');
    expect(envvars.get('THREE')).toEqual('three');
  });

  test('dynamically query the ctx with .include()', () => {
    process.env = { ONE: 'one', TWO: 'two' };

    const envvars = envjs();
    expect(envvars.include('ONE')).toBe(true);
    expect(envvars.include('TWO')).toBe(true);
    expect(envvars.include('THREE')).toBe(false);

    process.env = { ONE: 'won', THREE: 'three' };
    envjs.reset();
    expect(envvars.include('ONE')).toBe(true);
    expect(envvars.include('TWO')).toBe(false);
    expect(envvars.include('THREE')).toBe(true);
  });

  test('allow for setting (and changing) a default return value for missing names', () => {
    let envvars = envjs();
    expect(envvars.get('ONE')).toEqual(null);

    envvars = envjs({
      missValue: 'n/a',
    });
    expect(envvars.get('ONE')).toEqual('n/a');

    envvars.setMissValue(0);
    expect(envvars.get('ONE')).toEqual(0);
  });
});
