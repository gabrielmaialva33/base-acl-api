import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#modules/user/models/user'
import Role from '#modules/role/models/role'
import IRole from '#modules/role/interfaces/role_interface'

test.group('Sessions sign in', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('should sign in with valid credentials', async ({ client, assert }) => {
    const password = 'password123'

    const user = await User.create({
      full_name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: password,
    })

    const response = await client.post('/api/v1/sessions/sign-in').json({
      uid: 'john@example.com',
      password: password,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      auth: {
        access_token: response.body().auth?.access_token,
        refresh_token: response.body().auth?.refresh_token,
      },
      id: user.id,
      email: user.email,
      username: user.username,
    })

    assert.isDefined(response.body().auth?.access_token)
    assert.isDefined(response.body().auth?.refresh_token)
  })

  test('should fail with invalid email', async ({ client }) => {
    const response = await client.post('/api/v1/sessions/sign-in').json({
      uid: 'nonexistent@example.com',
      password: 'password123',
    })

    response.assertStatus(400)
    response.assertBodyContains({
      errors: [
        {
          message: 'Invalid user credentials',
        },
      ],
    })
  })

  test('should fail with invalid password', async ({ client }) => {
    const password = 'password123'

    await User.create({
      full_name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: password,
    })

    const response = await client.post('/api/v1/sessions/sign-in').json({
      uid: 'john@example.com',
      password: 'wrongpassword',
    })

    response.assertStatus(400)
    response.assertBodyContains({
      errors: [
        {
          message: 'Invalid user credentials',
        },
      ],
    })
  })

  test('should validate required fields', async ({ client }) => {
    const response = await client.post('/api/v1/sessions/sign-in').json({})

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'uid',
          rule: 'required',
        },
        {
          field: 'password',
          rule: 'required',
        },
      ],
    })
  })

  test('should include user roles in response', async ({ client }) => {
    const password = 'password123'

    const user = await User.create({
      full_name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: password,
    })

    const role = await Role.firstOrCreate(
      { slug: IRole.Slugs.ADMIN },
      {
        name: 'Admin',
        slug: IRole.Slugs.ADMIN,
        description: 'Administrator role',
      }
    )

    await user.related('roles').sync([role.id])

    const response = await client.post('/api/v1/sessions/sign-in').json({
      uid: 'john@example.com',
      password: password,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      roles: [
        {
          id: role.id,
          name: role.name,
          slug: role.slug,
        },
      ],
    })
  })
})
