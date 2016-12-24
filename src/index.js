import Debug from 'debug'
import { Strategy as AnonymousStrategy } from 'passport-anonymous'

const debug = Debug('feathers-authentication-anonymous')
const defaults = {
  name: 'anonymous'
}

export default function init (options = {}) {
  return function anonymousAuth () {
    const app = this
    const _super = app.setup

    if (!app.passport) {
      throw new Error(`Can not find app.passport. Did you initialize feathers-authentication before feathers-authentication-anonymous?`)
    }
    const anonymousSettings = Object.assign({}, defaults, options)

    app.setup = function () {
      let result = _super.apply(this, arguments)
      // Register 'local' strategy with passport
      debug('Registering anonymous authentication strategy with option:', anonymousSettings)
      app.passport.use(anonymousSettings.name, new AnonymousStrategy())
      app.passport.options(anonymousSettings.name, anonymousSettings)

      return result
    }
  }
}

// Exposed Modules
Object.assign(init, {
  defaults
})
