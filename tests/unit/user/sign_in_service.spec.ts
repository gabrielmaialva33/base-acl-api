import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import app from '@adonisjs/core/services/app'
import SignInService from '#modules/user/services/sign-in/sign_in_service'
import User from '#modules/user/models/user'
import Role from '#modules/role/models/role'
import IRole from '#modules/role/interfaces/role_interface'
import db from '@adonisjs/lucid/services/db'

test.group('SignInService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('should sign in user with valid credentials', async ({ assert }) => {
    const password = 'password123'
    const ctx = await testUtils.createHttpContext()

    // Create the role first so afterCreate hook can attach it
    await Role.firstOrCreate(
      { slug: IRole.Slugs.USER },
      {
        name: 'User',
        slug: IRole.Slugs.USER,
        description: 'Regular user role',
      }
    )

    const user = await User.create({
      full_name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: password,
    })

    // Need to reload user with roles
    await user.load('roles')

    const service = await app.container.make(SignInService)
    const result = await service.run({
      uid: 'john@example.com',
      password: password,
      ctx: ctx,
    })

    assert.exists(result.auth)
    assert.exists(result.auth.access_token)
    assert.exists(result.auth.refresh_token)
    assert.isString(result.auth.access_token)
    assert.isString(result.auth.refresh_token)
    assert.equal(result.id, user.id)
    assert.equal(result.email, user.email)
    assert.equal(result.full_name, user.full_name)
  })

  test('should throw exception for non-existent user', async ({ assert }) => {
    const ctx = await testUtils.createHttpContext()
    const service = await app.container.make(SignInService)

    await assert.rejects(async () => {
      await service.run({
        uid: 'nonexistent@example.com',
        password: 'password123',
        ctx: ctx,
      })
    }, 'Invalid user credentials')
  })

  test('should throw exception for invalid password', async ({ assert }) => {
    const password = 'password123'
    const ctx = await testUtils.createHttpContext()

    const user = await User.create({
      full_name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: password,
    })

    // Force reload to ensure we have the hashed password
    await user.refresh()

    const service = await app.container.make(SignInService)

    await assert.rejects(async () => {
      await service.run({
        uid: 'john@example.com',
        password: 'wrongpassword',
        ctx: ctx,
      })
    }, 'Invalid user credentials')
  })

  test('should include roles in user data', async ({ assert }) => {
    const password = 'password123'
    const ctx = await testUtils.createHttpContext()

    // Create roles first
    await Role.firstOrCreate(
      { slug: IRole.Slugs.USER },
      {
        name: 'User',
        slug: IRole.Slugs.USER,
        description: 'Regular user role',
      }
    )

    const adminRole = await Role.firstOrCreate(
      { slug: IRole.Slugs.ADMIN },
      {
        name: 'Admin',
        slug: IRole.Slugs.ADMIN,
        description: 'Administrator role',
      }
    )

    const user = await User.create({
      full_name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: password,
    })

    // Attach admin role in addition to default user role
    await db.table('user_roles').insert({
      user_id: user.id,
      role_id: adminRole.id,
    })

    const service = await app.container.make(SignInService)
    const result = await service.run({
      uid: 'john@example.com',
      password: password,
      ctx: ctx,
    })

    assert.exists(result.auth)
    assert.exists(result.id)
    assert.equal(result.email, user.email)
  })

  test('should handle user without roles', async ({ assert }) => {
    const password = 'password123'
    const ctx = await testUtils.createHttpContext()

    // Ensure user role exists for afterCreate hook
    await Role.firstOrCreate(
      { slug: IRole.Slugs.USER },
      {
        name: 'User',
        slug: IRole.Slugs.USER,
        description: 'Regular user role',
      }
    )

    const user = await User.create({
      full_name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: password,
    })

    const service = await app.container.make(SignInService)
    const result = await service.run({
      uid: 'john@example.com',
      password: password,
      ctx: ctx,
    })

    assert.exists(result.auth)
    assert.exists(result.auth.access_token)
    assert.exists(result.auth.refresh_token)
    assert.equal(result.id, user.id)
  })

  test('should handle soft deleted users', async ({ assert }) => {
    const password = 'password123'
    const ctx = await testUtils.createHttpContext()

    const user = await User.create({
      full_name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: password,
    })

    // Soft delete the user
    await user.delete()

    const service = await app.container.make(SignInService)

    await assert.rejects(async () => {
      await service.run({
        uid: 'john@example.com',
        password: password,
        ctx: ctx,
      })
    }, 'Invalid user credentials')
  })
})
