import feathers from 'feathers'
import memory from 'feathers-memory'
import authentication from 'feathers-authentication'
import jwt from 'feathers-authentication-jwt'
import anonymous from '../src'
import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('feathers-authentication-anonymous', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../lib')).to.equal('function')
  })

  it('basic functionality', () => {
    expect(typeof anonymous).to.equal('function')
  })

  describe('initialization', () => {
    let app
    beforeEach(() => {
      app = feathers()
      app.use('/users', memory())
      app.configure(authentication({ secret: 'supersecret' }))
      app.configure(jwt())
    })

    it('throws an error if passport has not been registered', () => {
      expect(() => {
        feathers().configure(anonymous())
      }).to.throw()
    })

    it('registers the anonymous passport strategy', () => {
      sinon.spy(app.passport, 'use')
      app.configure(anonymous())
      app.setup()
      expect(app.passport.use).to.have.been.calledWith('anonymous')
      app.passport.use.restore()
    })
  })
})
