import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#modules/user/models/user'
import Role from '#modules/role/models/role'
import IRole from '#modules/role/interfaces/role_interface'
import db from '@adonisjs/lucid/services/db'
import mail from '@adonisjs/mail/services/main'

test.group('Sessions sign up', (group) => {
  group.each.setup(() => {
    mail.restore()
    mail.fake()
    return testUtils.db().withGlobalTransaction()
  })

  group.each.teardown(() => {
    mail.restore()
  })

  test('should create a new user with valid data', async ({ client, assert }) => {
    const userData = {
      full_name: 'Jane Doe',
      email: 'jane@example.com',
      username: 'janedoe',
      password: 'password123',
      password_confirmation: 'password123',
    }

    const response = await client.post('/api/v1/sessions/sign-up').json(userData)

    if (response.status() !== 201) {
      console.log('Response status:', response.status())
      console.log('Response body:', response.body())
    }

    response.assertStatus(201)
    response.assertBodyContains({
      auth: {
        access_token: response.body().auth?.access_token,
        refresh_token: response.body().auth?.refresh_token,
      },
      email: userData.email,
      username: userData.username,
      full_name: userData.full_name,
    })

    assert.isDefined(response.body().auth?.access_token)
    assert.isDefined(response.body().auth?.refresh_token)

    const user = await User.findBy('email', userData.email)
    assert.isNotNull(user)
  })

  test('should fail with duplicate email', async ({ client }) => {
    await User.create({
      full_name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: 'hashedpassword',
    })

    const response = await client.post('/api/v1/sessions/sign-up').json({
      full_name: 'Jane Doe',
      email: 'john@example.com',
      username: 'janedoe',
      password: 'password123',
      password_confirmation: 'password123',
    })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'email',
          rule: 'database.unique',
        },
      ],
    })
  })

  test('should fail with duplicate username', async ({ client }) => {
    await User.create({
      full_name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: 'hashedpassword',
    })

    const response = await client.post('/api/v1/sessions/sign-up').json({
      full_name: 'Jane Doe',
      email: 'jane@example.com',
      username: 'johndoe',
      password: 'password123',
      password_confirmation: 'password123',
    })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'username',
          rule: 'database.unique',
        },
      ],
    })
  })

  test('should validate required fields', async ({ client }) => {
    const response = await client.post('/api/v1/sessions/sign-up').json({})

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'full_name',
          rule: 'required',
          message: 'The full_name field must be defined',
        },
        {
          field: 'email',
          rule: 'required',
          message: 'The email field must be defined',
        },
        {
          field: 'password',
          rule: 'required',
          message: 'The password field must be defined',
        },
      ],
    })
  })

  test('should validate email format', async ({ client }) => {
    const response = await client.post('/api/v1/sessions/sign-up').json({
      full_name: 'Jane Doe',
      email: 'invalid-email',
      username: 'janedoe',
      password: 'password123',
      password_confirmation: 'password123',
    })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'email',
          rule: 'email',
        },
      ],
    })
  })

  test('should validate password minimum length', async ({ client }) => {
    const response = await client.post('/api/v1/sessions/sign-up').json({
      full_name: 'Jane Doe',
      email: 'jane@example.com',
      username: 'janedoe',
      password: '12345',
      password_confirmation: '12345',
    })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'password',
          rule: 'minLength',
        },
      ],
    })
  })

  test('should assign default user role', async ({ client, assert }) => {
    // Create the 'user' role first
    await Role.firstOrCreate(
      { slug: IRole.Slugs.USER },
      {
        name: 'User',
        slug: IRole.Slugs.USER,
        description: 'Regular user role',
      }
    )

    const userData = {
      full_name: 'Jane Doe',
      email: 'janeuser@example.com',
      username: 'janeuser',
      password: 'password123',
      password_confirmation: 'password123',
    }

    const response = await client.post('/api/v1/sessions/sign-up').json(userData)

    response.assertStatus(201)

    const user = await User.findBy('email', userData.email)
    assert.isNotNull(user)

    const userRoles = await db
      .from('user_roles')
      .where('user_id', user!.id)
      .join('roles', 'roles.id', '=', 'user_roles.role_id')
      .select('roles.slug')

    assert.lengthOf(userRoles, 1)
    assert.equal(userRoles[0].slug, 'user')
  })
})
