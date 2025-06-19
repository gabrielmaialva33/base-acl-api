import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#modules/user/models/user'
import Role from '#modules/role/models/role'
import db from '@adonisjs/lucid/services/db'

test.group('Users list', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('should list users with authentication', async ({ client }) => {
    const userRole = await Role.firstOrCreate(
      { slug: 'user' },
      {
        name: 'User',
        slug: 'user',
        description: 'Regular user role',
      }
    )

    const user = await User.create({
      full_name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: 'password123',
    })

    await db.table('user_roles').insert({
      user_id: user.id,
      role_id: userRole.id,
    })

    const response = await client.get('/api/v1/users').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      meta: {
        total: 1,
        per_page: 10,
        current_page: 1,
      },
    })
  })

  test('should fail without authentication', async ({ client }) => {
    const response = await client.get('/api/v1/users')

    response.assertStatus(401)
  })

  test('should paginate results', async ({ client }) => {
    const userRole = await Role.firstOrCreate(
      { slug: 'user' },
      {
        name: 'User',
        slug: 'user',
        description: 'Regular user role',
      }
    )

    const authUser = await User.create({
      full_name: 'Auth User',
      email: 'auth@example.com',
      username: 'authuser',
      password: 'password123',
    })

    await db.table('user_roles').insert({
      user_id: authUser.id,
      role_id: userRole.id,
    })

    // Create 15 additional users
    for (let i = 1; i <= 15; i++) {
      await User.create({
        full_name: `User${i} Test`,
        email: `user${i}@example.com`,
        username: `user${i}`,
        password: 'password123',
      })
    }

    const response = await client.get('/api/v1/users').qs({ page: 2, limit: 10 }).loginAs(authUser)

    response.assertStatus(200)
    response.assertBodyContains({
      meta: {
        total: 16,
        per_page: 10,
        current_page: 2,
      },
    })

    const data = response.body().data
    response.assert.lengthOf(data, 6) // 16 total - 10 on first page = 6 on second page
  })

  test('should filter users by search query', async ({ client }) => {
    const userRole = await Role.firstOrCreate(
      { slug: 'user' },
      {
        name: 'User',
        slug: 'user',
        description: 'Regular user role',
      }
    )

    const authUser = await User.create({
      full_name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: 'password123',
    })

    await db.table('user_roles').insert({
      user_id: authUser.id,
      role_id: userRole.id,
    })

    await User.create({
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      username: 'janesmith',
      password: 'password123',
    })

    await User.create({
      full_name: 'Bob Johnson',
      email: 'bob@example.com',
      username: 'bobjohnson',
      password: 'password123',
    })

    const response = await client.get('/api/v1/users').qs({ search: 'jane' }).loginAs(authUser)

    response.assertStatus(200)
    const data = response.body().data
    response.assert.lengthOf(data, 1)
    response.assertBodyContains({
      data: [
        {
          email: 'jane@example.com',
          username: 'janesmith',
        },
      ],
    })
  })

  test('should sort users by different fields', async ({ client }) => {
    const userRole = await Role.firstOrCreate(
      { slug: 'user' },
      {
        name: 'User',
        slug: 'user',
        description: 'Regular user role',
      }
    )

    const authUser = await User.create({
      full_name: 'Auth User',
      email: 'auth@example.com',
      username: 'authuser',
      password: 'password123',
    })

    await db.table('user_roles').insert({
      user_id: authUser.id,
      role_id: userRole.id,
    })

    await User.create({
      full_name: 'Charlie Brown',
      email: 'charlie@example.com',
      username: 'charliebrown',
      password: 'password123',
    })

    await User.create({
      full_name: 'Alice Wonder',
      email: 'alice@example.com',
      username: 'alicewonder',
      password: 'password123',
    })

    const response = await client
      .get('/api/v1/users')
      .qs({ sortBy: 'full_name', order: 'asc' })
      .loginAs(authUser)

    response.assertStatus(200)
    const data = response.body().data
    response.assert!.equal(data[0].full_name, 'Alice Wonder')
    response.assert!.equal(data[1].full_name, 'Auth User')
    response.assert!.equal(data[2].full_name, 'Charlie Brown')
  })

  test('should include user roles in response', async ({ client }) => {
    const userRole = await Role.firstOrCreate(
      { slug: 'user' },
      {
        name: 'User',
        slug: 'user',
        description: 'Regular user role',
      }
    )

    const adminRole = await Role.firstOrCreate(
      { slug: 'admin' },
      {
        name: 'Admin',
        slug: 'admin',
        description: 'Administrator role',
      }
    )

    const user = await User.create({
      full_name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: 'password123',
    })

    await db.table('user_roles').insert([
      {
        user_id: user.id,
        role_id: userRole.id,
      },
      {
        user_id: user.id,
        role_id: adminRole.id,
      },
    ])

    const response = await client.get('/api/v1/users').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      data: [
        {
          id: user.id,
          roles: [
            {
              slug: 'user',
            },
            {
              slug: 'admin',
            },
          ],
        },
      ],
    })
  })
})
