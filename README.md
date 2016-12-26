# feathers-authentication-anonymous

### not published yet

> Anonymous authentication strategy for feathers-authentication using Passport

## Installation

```
npm install feathers-authentication-anonymous --save
```

## API

### Main Initialization

In most cases initializing the `feathers-authentication-anonymous` module is as simple as doing this:

```js
const anonymous = require('feathers-authentication-anonymous')
...
app.configure(authentication(settings));
app.configure(anonymous());
```

This will pull from your global `auth` object in your config file. It will also mix in the following defaults, which can be customized.

#### Default Options

```js
{
    name: 'anonymous', // the name to use when invoking the authentication Strategy
}
```
just one config
```js
app.configure(anonymous({name: 'anon'}));

// use in hook
auth.hooks.authenticate(['jwt', 'anon'])
// use middleware
app.post('/users', auth.express.authenticate(['jwt', 'anon']), function(req, res) {
  if (req.user) {
    ...
  } else {
    ...
  }
});
```
Additional [passport-anonymous](https://github.com/jaredhanson/passport-anonymous) options can be provided.

## Hooks
This usefull for endpoint, return difference results
```js

function afterGetUsers () {
  return function(hook) {
    const { authenticated } = hook.params
    if (!authenticated) {
      // delete phone field
      const { phone, ...others } = hook.result
      hook.result = others
    }
    return hook
  }
}

app.service('users').hooks({
  before: {
    get: [
      // You can chain multiple strategies
      // it while pass if jwt auth error
      // but params.user is undefined
      // and params.authenticated is undefined
      auth.hooks.authenticate(['jwt', 'anonymous']),
    ],
    remove: [
      auth.hooks.authenticate('jwt')
    ]
  }
  after: {
    get: [
      afterGetUsers()
    ]
  }
});
```

## Complete Example

Here's a basic example of a Feathers server that uses `feathers-authentication-anonymous`. You can see a fully working example in the [example/](./example/) directory.

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const memory = require('feathers-memory');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const auth = require('feathers-authentication');
const jwt = require('feathers-authentication-jwt');
const anonymous = require('feathers-authentication-anonymous')

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Configure feathers-authentication
  .configure(auth({ secret: 'super secret' }))
  .configure(jwt())
  .configure(anonymous())
  .use('/users', memory())
  .use(errorHandler());

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
