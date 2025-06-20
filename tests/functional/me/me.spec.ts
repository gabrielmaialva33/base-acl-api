import { test } from '@japa/runner'
import User from '#modules/user/models/user'
import Role from '#modules/role/models/role'
import Permission from '#modules/permission/models/permission'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Me endpoints', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('GET /me should return current user profile', async ({ client, assert }) => {
    // Create user with role
    const user = await User.create({
      full_name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    })

    const role = await Role.findByOrFail('name', 'USER')
    await user.related('roles').attach([role.id])

    const response = await client.get('/api/v1/me').loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().email, 'test@example.com')
    assert.equal(response.body().username, 'testuser')
    assert.isArray(response.body().roles)
    assert.equal(response.body().roles[0].name, 'USER')
  })

  test('GET /me/permissions should return user permissions', async ({ client, assert }) => {
    // Create user with role
    const user = await User.create({
      full_name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    })

    const role = await Role.findByOrFail('name', 'USER')
    await user.related('roles').attach([role.id])

    // Add direct permission
    const permission = await Permission.findByOrFail('name', 'users.read')
    await user.related('permissions').attach({
      [permission.id]: {
        granted: true,
      },
    })

    const response = await client.get('/api/v1/me/permissions').loginAs(user)

    response.assertStatus(200)
    assert.isNumber(response.body().total)
    assert.isArray(response.body().permissions)
    assert.isObject(response.body().grouped)

    // Check if permission exists in response
    const hasUsersRead = response.body().permissions.some((p: any) => p.name === 'users.read')
    assert.isTrue(hasUsersRead)
  })

  test('GET /me/roles should return user roles', async ({ client, assert }) => {
    // Create user with multiple roles
    const user = await User.create({
      full_name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    })

    const userRole = await Role.findByOrFail('name', 'USER')
    const editorRole = await Role.findByOrFail('name', 'EDITOR')

    await user.related('roles').attach([userRole.id, editorRole.id])

    const response = await client.get('/api/v1/me/roles').loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().total, 2)
    assert.isArray(response.body().roles)

    const roleNames = response.body().roles.map((r: any) => r.name)
    assert.includeMembers(roleNames, ['USER', 'EDITOR'])
  })

  test('should require authentication for all /me endpoints', async ({ client }) => {
    const endpoints = ['/api/v1/me', '/api/v1/me/permissions', '/api/v1/me/roles']

    for (const endpoint of endpoints) {
      const response = await client.get(endpoint)
      response.assertStatus(401)
    }
  })
})
