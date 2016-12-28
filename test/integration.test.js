import feathers from 'feathers'
import authentication from 'feathers-authentication'
import memory from 'feathers-memory'
import hooks from 'feathers-hooks'
import jwt from 'feathers-authentication-jwt'
import anonymous from '../src'
import { expect } from 'chai'
import omit from 'lodash.omit'

describe('integration', () => {
  let app
  let user
  const User = {
    email: 'admin@feathersjs.com',
    password: 'password'
  }
  beforeEach((done) => {
    const afterCreateJWT = () => {
      return hook => {
        const app = hook.app
        const id = hook.result.id
        return app.passport.createJWT({ userId: id }, app.get('auth')).then(accessToken => {
          hook.result.accessToken = accessToken
          return Promise.resolve(hook)
        })
      }
    }

    const exposeAuthInfo = () => {
      return hook => {
        const { provider, authenticated, user } = hook.params
        if (!provider) { return hook }
        hook.result.AuthInfo = { authenticated, user }
        if (!authenticated) {
          hook.result = omit(hook.result, 'password')
        }
        return hook
      }
    }

    app = feathers()
    app.configure(hooks())
      .use('/users', memory())
      .configure(authentication({ secret: 'supersecret' }))
      .configure(jwt())
      .configure(anonymous())

    app.service('/users').hooks({
      before: {
        get: [
          authentication.hooks.authenticate(['jwt', 'anonymous'])
        ]
      },
      after: {
        get: exposeAuthInfo(),
        create: afterCreateJWT()
      }
    })

    app.setup()

    app.service('users').create(User).then(result => {
      user = result
      done()
    })
  })

  it('verifies', () => {
    const req = {
      query: {},
      body: {},
      headers: {
        'authorization': user.accessToken
      },
      cookies: {}
    }
    req.headers = { 'authorization': user.accessToken }
    return app.authenticate('jwt')(req).then(result => {
      expect(result.success).to.equal(true)
      expect(result.data.user.email).to.equal(User.email)
      expect(result.data.user.password).to.not.equal(undefined)
    })
  })

  it('verifies hook without token', () => {
    const params = {
      provider: 'rest',
      query: {},
      body: {},
      headers: {},
      cookies: {}
    }
    return app.service('users').get(user.id, params).then(result => {
      expect(result.email).to.equal(User.email)
      expect(result.password).to.be.undefined
      expect(result.AuthInfo.authenticated).to.be.undefined
      expect(result.AuthInfo.user).to.be.undefined
    })
  })

  it('verifies hook with token', () => {
    const params = {
      provider: 'rest',
      query: {},
      headers: {
        'authorization': user.accessToken
      }
    }
    return app.service('users').get(user.id, params).then(result => {
      expect(result.email).to.equal(User.email)
      expect(result.password).to.not.equal(undefined)
      expect(result.AuthInfo.authenticated).to.be.true
      expect(result.AuthInfo.user.email).to.equal(User.email)
    })
  })
})
