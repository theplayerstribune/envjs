# `envjs`

A drop-in for `dotenv` that allows us to semantically, simply, and openly
declare environmental variables and constants for a JavaScript package
or application. Compiles to UMD so it can be used in Browser-based apps
(using an object placed in the global namespace as an "environment-
injection" point for the server).

_This is a **work in progress**._

To Do:

- [ ] remove `dotenv` dependency;
- [ ] structure the `debug` dependency so that rollup pulls in the UMD 
      package;
- [ ] export as an ESM module and UMD (in `/dist`);
- [ ] add tests;
- [ ] pull context from an object, so that resetting the context in one
      call affects all extant envvars;
- [ ] better installation docs;
- [ ] add clear instructions (and functions if necessary) for mocking 
      env in tests;
- [ ] better generated docs from jsdoc;
- [ ] add TypeScript declarations file;
- [ ] get to work in the browser;
- [ ] add debug points.

## Documentation

### Constants

<dl>
<dt><a href="#ctx">ctx</a> : <code><a href="#EnvContext">EnvContext</a></code></dt>
<dd><p>The memoized environment context that we mutate and share.</p>
</dd>
</dl>

### Functions

<dl>
<dt><a href="#env">env([options])</a> ⇒ <code><a href="#EnvList">EnvList</a></code></dt>
<dd><p>Generates a set of environmental variables from the current context,
after applying all passed options. If a set of names we want to ensure
exist are passed, will apply these after the list is generated.</p>
</dd>
<dt><a href="#get(<string>) - Accesses the values dict (essentially a copy
        of the EnvList) and returns the dereferenced variable, or the
        _missValue if not found.">get(<string>) - Accesses the values dict (essentially a copy
        of the EnvList) and returns the dereferenced variable, or the
        _missValue if not found.()</a></dt>
<dd><p>The prototype for all EnvList objects. Allows us to dereference variables
by name and control the value that is returned when the variable does not
exist.</p>
</dd>
</dl>

### Typedefs

<dl>
<dt><a href="#EnvList">EnvList</a> : <code>Object.&lt;string, string&gt;</code></dt>
<dd><p>A dictionary of environmental variables.</p>
</dd>
<dt><a href="#EnvContext">EnvContext</a> : <code>Object</code></dt>
<dd><p>A descriptive environment context that stores the definitions for
environmental variables by their source, as well as any errors that
have been generated while compiling them.</p>
</dd>
<dt><a href="#EnvOptions">EnvOptions</a> : <code>Object</code></dt>
<dd><p>Options for calls to generate a new context.</p>
</dd>
<dt><a href="#DotenvResult">DotenvResult</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="ctx"></a>

### ctx : [<code>EnvContext</code>](#EnvContext)
The memoized environment context that we mutate and share.

**Kind**: global constant  
<a name="env"></a>

### env([options]) ⇒ [<code>EnvList</code>](#EnvList)
Generates a set of environmental variables from the current context,
after applying all passed options. If a set of names we want to ensure
exist are passed, will apply these after the list is generated.

**Kind**: global function  
**Returns**: [<code>EnvList</code>](#EnvList) - The reset, newly-generated environmental variables.  

| Param | Type | Default |
| --- | --- | --- |
| [options] | [<code>EnvOptions</code>](#EnvOptions) | <code>env.DEFAULT_OPTS</code> | 


* [env([options])](#env) ⇒ [<code>EnvList</code>](#EnvList)
    * [.DEFAULT_OPTS](#env.DEFAULT_OPTS) : [<code>EnvOptions</code>](#EnvOptions)
    * [.dotenv()](#env.dotenv) ⇒ [<code>DotenvResult</code>](#DotenvResult)
    * [.defaults(defaults)](#env.defaults) ⇒ [<code>EnvList</code>](#EnvList)
    * [.constants(constants)](#env.constants) ⇒ [<code>EnvList</code>](#EnvList)
    * [.reset([options])](#env.reset) ⇒ [<code>EnvList</code>](#EnvList)
    * [.ensure([expected], actual, opts)](#env.ensure) ⇒ <code>boolean</code>
    * [.check([expected])](#env.check) ⇒ <code>boolean</code>
    * [.ctx()](#env.ctx) ⇒ [<code>EnvContext</code>](#EnvContext)
    * [._resetCtx()](#env._resetCtx)
    * [._generateFromCtx()](#env._generateFromCtx)

<a name="env.DEFAULT_OPTS"></a>

#### env.DEFAULT\_OPTS : [<code>EnvOptions</code>](#EnvOptions)
The default options passed to calls that generate a new context.

**Kind**: static constant of [<code>env</code>](#env)  
**Default**: <code>{&quot;dotenv&quot;:true,&quot;constants&quot;:&quot;&quot;,&quot;defaults&quot;:&quot;&quot;,&quot;ensure&quot;:&quot;&quot;,&quot;missingReturnValue&quot;:&quot;&quot;}</code>  
<a name="env.dotenv"></a>

#### env.dotenv() ⇒ [<code>DotenvResult</code>](#DotenvResult)
Loads variables from a .env file. Uses the standard modulen "dotenv",
but keeps the process.env free of the variables that are loaded,
adding them to the internal ctx.dotenv list. Any errors that are
generated are added to ctx.errors.dotenv (currently the only source
of errors in the context).

**Kind**: static method of [<code>env</code>](#env)  
<a name="env.defaults"></a>

#### env.defaults(defaults) ⇒ [<code>EnvList</code>](#EnvList)
Set the context's default environmental variables.

**Kind**: static method of [<code>env</code>](#env)  
**Returns**: [<code>EnvList</code>](#EnvList) - The updated, complete list of default environmental
                  variables.  

| Param | Type | Description |
| --- | --- | --- |
| defaults | [<code>EnvList</code>](#EnvList) | The new default environmental variables to                  add/update. |

<a name="env.constants"></a>

#### env.constants(constants) ⇒ [<code>EnvList</code>](#EnvList)
Set the context's constant environmental variables.

**Kind**: static method of [<code>env</code>](#env)  
**Returns**: [<code>EnvList</code>](#EnvList) - The updated, complete list of constant environmental
                  variables.  

| Param | Type | Description |
| --- | --- | --- |
| constants | [<code>EnvList</code>](#EnvList) | The new constant environmental variables                  to add/update. |

<a name="env.reset"></a>

#### env.reset([options]) ⇒ [<code>EnvList</code>](#EnvList)
Clears out the context and regenerates it according to the given
options.

**Kind**: static method of [<code>env</code>](#env)  
**Returns**: [<code>EnvList</code>](#EnvList) - The reset, newly-generated environmental variables.  

| Param | Type | Default |
| --- | --- | --- |
| [options] | [<code>EnvOptions</code>](#EnvOptions) | <code>env.DEFAULT_OPTS</code> | 

<a name="env.ensure"></a>

#### env.ensure([expected], actual, opts) ⇒ <code>boolean</code>
Ensures that some variable or set of variables are defined in the
current context. Allows a list of defined variables to be passed, as
well as options that define what happens when there is a missing
variable. By default a miss will exit the process with an exit value
of 1.

**Kind**: static method of [<code>env</code>](#env)  
**Returns**: <code>boolean</code> - True if all the expected variables are defined,
                   false otherwise. Only runs if true or if the
                   exitOnMiss option is set to false.  
**Todo**

- [ ] Add an option to throwOnMiss, that collects the error messages
      and then throws an error at the end of the function.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [expected] | <code>Array.&lt;string&gt;</code> | <code>[]</code> | The list of variable names we expect                   to have been defined. |
| actual | <code>Array.&lt;string&gt;</code> |  | If passed, this is the list of defined                   variable names we check against (instead of those                   defined in the current context). |
| opts | <code>Object</code> |  | Options. |
| [opts.silent] | <code>boolean</code> | <code>false</code> | Whether or not to log missing                   variable names. |
| [opts.exitOnMiss] | <code>boolean</code> | <code>true</code> | Whether or not to exit the                   process if any names are missing. |

<a name="env.check"></a>

#### env.check([expected]) ⇒ <code>boolean</code>
A thin wrapper around env.ensure() that silences output and forces a
return value.

**Kind**: static method of [<code>env</code>](#env)  
**Returns**: <code>boolean</code> - True if all the expected variables are defined,
                   false otherwise.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [expected] | <code>Array.&lt;string&gt;</code> | <code>[]</code> | The list of variable names we expect                   to have been defined. |

<a name="env.ctx"></a>

#### env.ctx() ⇒ [<code>EnvContext</code>](#EnvContext)
A basic getter for the internal context "ctx" value.

**Kind**: static method of [<code>env</code>](#env)  
<a name="env._resetCtx"></a>

#### env.\_resetCtx()
Resets the state of the context.

**Kind**: static method of [<code>env</code>](#env)  
**Access**: protected  
<a name="env._generateFromCtx"></a>

#### env.\_generateFromCtx()
Merge the environmental variables in the context together into a
single environmental object. Adds a prototype to the object with a
few helper functions (TODO).

**Kind**: static method of [<code>env</code>](#env)  
**Access**: protected  
<a name="get(<string>) - Accesses the values dict (essentially a copy
        of the EnvList) and returns the dereferenced variable, or the
        _missValue if not found."></a>

### get(<string>) - Accesses the values dict (essentially a copy
        of the EnvList) and returns the dereferenced variable, or the
        \_missValue if not found.()
The prototype for all EnvList objects. Allows us to dereference variables
by name and control the value that is returned when the variable does not
exist.

**Kind**: global function  
**Todo**

- [ ] Turn this into a class definition for EnvList (replace typedef
      above).

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| _values | <code>Object</code> | A basic object/dict version of the EnvList. |
| _missValue | <code>\*</code> | The value returned on a miss when                    calling EnvList.get(). |

**Example**  
```js
const envvars = env({ constants: { USERNAME: 'starbuck' } });
    envvars.missingReturnValue('n/a');
    envvars.get('USERNAME')
    // => 'starbuck'
    envvars.get('PASSWORD')
    // => 'n/a'
    envvars.PASSWORD
    // => undefined
```
**Example** *(You can pass a missing return value on generation:)*  
```js
    const envvars = env({
      constants: { USERNAME: 'starbuck' },
      missingReturnValue: 'n/a',
    });
    envvars.get('PASSWORD')
    // => 'n/a'
```
<a name="EnvList"></a>

### EnvList : <code>Object.&lt;string, string&gt;</code>
A dictionary of environmental variables.

**Kind**: global typedef  
**Todo**

- [ ] Upgrade to a class that implements env.LIST_PROTO below.

<a name="EnvContext"></a>

### EnvContext : <code>Object</code>
A descriptive environment context that stores the definitions for
environmental variables by their source, as well as any errors that
have been generated while compiling them.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| defaults | [<code>EnvList</code>](#EnvList) | Default environmental variables that                     are overriden by all other explicity set                     environmental variables. |
| constants | [<code>EnvList</code>](#EnvList) | Constant environmental variables that                     can not be overriden. |
| process | [<code>EnvList</code>](#EnvList) | The content of process.env as of the last                     call to _resetCtx. |
| dotenv | [<code>EnvList</code>](#EnvList) | All environmental variables loaded by the                     dotenv module. |
| errors | <code>Object</code> | A depository for errors generated when                     loading the environment. |

<a name="EnvOptions"></a>

### EnvOptions : <code>Object</code>
Options for calls to generate a new context.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| dotenv | <code>boolean</code> | Whether or not to run a dotenv config                      load. |
| defaults | [<code>EnvList</code>](#EnvList) | A list of default environmental                      variables. |
| constants | [<code>EnvList</code>](#EnvList) | A list of constant environmental                      variables. |
| ensure | <code>Array.&lt;string&gt;</code> | A list environmental variable names that                      must exist in the context, or we exit the program. |
| missingReturnValue | <code>\*</code> | The value that is returned                      when we call EnvList.get() on a missing value. |

<a name="DotenvResult"></a>

### DotenvResult : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| dotenv | [<code>EnvList</code>](#EnvList) | The list of environmental variables                     loaded, if any, from the .env file. |
| error | <code>Error</code> | Any error (usually, missing .env file)                     generated by running dotenv.config(). |
