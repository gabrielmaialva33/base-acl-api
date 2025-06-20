import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#modules/user/models/user'
import Role from '#modules/role/models/role'
import Permission from '#modules/permission/models/permission'
import IRole from '#modules/role/interfaces/role_interface'
import IPermission from '#modules/permission/interfaces/permission_interface'
import db from '@adonisjs/lucid/services/db'

test.group('Users list', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  // Helper function to create and assign permissions to a role
  async function assignPermissions(role: Role, actions: string[]) {
    const permissions = await Promise.all(
      actions.map((action) =>
        Permission.firstOrCreate(
          {
            resource: IPermission.Resources.USERS,
            action: action,
          },
          {
            name: `users.${action}`,
            resource: IPermission.Resources.USERS,
            action: action,
          }
        )
      )
    )
    await role.related('permissions').sync(permissions.map((p) => p.id))
  }

  test('should list users with authentication', async ({ client }) => {
    const userRole = await Role.firstOrCreate(
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
      password: 'password123',
    })

    await db.table('user_roles').insert({
      user_id: user.id,
      role_id: userRole.id,
    })

    // Assign list permission to user role
    await assignPermissions(userRole, [IPermission.Actions.LIST])

    const response = await client.get('/api/v1/users').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      meta: {
        per_page: 10,
        current_page: 1,
      },
    })
    // Check that the response contains users
    response.assert!.isArray(response.body().data)
    response.assert!.isAtLeast(response.body().data.length, 1)
  })

  test('should fail without authentication', async ({ client }) => {
    const response = await client.get('/api/v1/users')

    response.assertStatus(401)
  })

  test('should paginate results', async ({ client, assert }) => {
    const userRole = await Role.firstOrCreate(
      { slug: IRole.Slugs.USER },
      {
        name: 'User',
        slug: IRole.Slugs.USER,
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

    // Assign list permission to user role
    await assignPermissions(userRole, [IPermission.Actions.LIST])

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
        per_page: 10,
        current_page: 2,
      },
    })

    const data = response.body().data
    // Check that pagination is working - should have some data on page 2
    assert.isArray(data)
    assert.isAtLeast(data.length, 1)
  })

  test('should filter users by search query', async ({ client, assert }) => {
    const userRole = await Role.firstOrCreate(
      { slug: IRole.Slugs.USER },
      {
        name: 'User',
        slug: IRole.Slugs.USER,
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

    // Assign list permission to user role
    await assignPermissions(userRole, [IPermission.Actions.LIST])

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
    assert.lengthOf(data, 1)
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
      { slug: IRole.Slugs.USER },
      {
        name: 'User',
        slug: IRole.Slugs.USER,
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

    // Assign list permission to user role
    await assignPermissions(userRole, [IPermission.Actions.LIST])

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
      .qs({ sort_by: 'full_name', order: 'asc' })
      .loginAs(authUser)

    response.assertStatus(200)
    const data = response.body().data

    // Find the specific users we created in the results
    const userNames = data.map((u: any) => u.full_name)
    const aliceIndex = userNames.indexOf('Alice Wonder')
    const authIndex = userNames.indexOf('Auth User')
    const charlieIndex = userNames.indexOf('Charlie Brown')

    // Check they exist and are in ascending order
    response.assert!.isAtLeast(aliceIndex, 0)
    response.assert!.isAtLeast(authIndex, 0)
    response.assert!.isAtLeast(charlieIndex, 0)
    response.assert!.isBelow(aliceIndex, authIndex)
    response.assert!.isBelow(authIndex, charlieIndex)
  })

  test('should include user roles in response', async ({ client }) => {
    const userRole = await Role.firstOrCreate(
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

    // Assign list permission to user role (admin inherits this too)
    await assignPermissions(userRole, [IPermission.Actions.LIST])

    const response = await client.get('/api/v1/users').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      data: [
        {
          id: user.id,
          roles: [
            {
              slug: IRole.Slugs.USER,
            },
            {
              slug: IRole.Slugs.ADMIN,
            },
          ],
        },
      ],
    })
  })
})
