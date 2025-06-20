import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#modules/user/models/user'
import Role from '#modules/role/models/role'
import IRole from '#modules/role/interfaces/role_interface'
import db from '@adonisjs/lucid/services/db'

test.group('Roles admin', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('should list roles with admin permission', async ({ client }) => {
    const adminRole = await Role.firstOrCreate(
      { slug: IRole.Slugs.ADMIN },
      {
        name: 'Admin',
        slug: IRole.Slugs.ADMIN,
        description: 'Administrator role',
      }
    )

    const userRole = await Role.firstOrCreate(
      { slug: IRole.Slugs.USER },
      {
        name: 'User',
        slug: IRole.Slugs.USER,
        description: 'Regular user role',
      }
    )

    const adminUser = await User.create({
      full_name: 'Admin User',
      email: 'admin@example.com',
      username: 'adminuser',
      password: 'password123',
    })

    await adminUser.related('roles').sync([adminRole.id])

    const response = await client.get('/api/v1/admin/roles').loginAs(adminUser)

    response.assertStatus(200)
    response.assertBodyContains({
      data: [
        {
          id: adminRole.id,
          name: adminRole.name,
          slug: adminRole.slug,
        },
        {
          id: userRole.id,
          name: userRole.name,
          slug: userRole.slug,
        },
      ],
    })
  })

  test('should list roles with root permission', async ({ client, assert }) => {
    const rootRole = await Role.firstOrCreate(
      { slug: IRole.Slugs.ROOT },
      {
        name: 'Root',
        slug: IRole.Slugs.ROOT,
        description: 'Root administrator role',
      }
    )

    const rootUser = await User.create({
      full_name: 'Root User',
      email: 'root@example.com',
      username: 'rootuser',
      password: 'password123',
    })

    await rootUser.related('roles').sync([rootRole.id])

    const response = await client.get('/api/v1/admin/roles').loginAs(rootUser)

    response.assertStatus(200)
    assert.properties(response.body(), ['data', 'meta'])
  })

  test('should deny access for regular users', async ({ client }) => {
    const userRole = await Role.firstOrCreate(
      { slug: IRole.Slugs.USER },
      {
        name: 'User',
        slug: IRole.Slugs.USER,
        description: 'Regular user role',
      }
    )

    const regularUser = await User.create({
      full_name: 'Regular User',
      email: 'regular@example.com',
      username: 'regularuser',
      password: 'password123',
    })

    await regularUser.related('roles').sync([userRole.id])

    const response = await client.get('/api/v1/admin/roles').loginAs(regularUser)

    response.assertStatus(403)
    response.assertBodyContains({
      message: 'Permission denied',
    })
  })

  test('should attach role to user with admin permission', async ({ client, assert }) => {
    const adminRole = await Role.firstOrCreate(
      { slug: IRole.Slugs.ADMIN },
      {
        name: 'Admin',
        slug: IRole.Slugs.ADMIN,
        description: 'Administrator role',
      }
    )

    const editorRole = await Role.firstOrCreate(
      { slug: IRole.Slugs.EDITOR },
      {
        name: 'Editor',
        slug: IRole.Slugs.EDITOR,
        description: 'Editor role',
      }
    )

    const adminUser = await User.create({
      full_name: 'Admin User',
      email: 'admin@example.com',
      username: 'adminuser',
      password: 'password123',
    })

    await adminUser.related('roles').sync([adminRole.id])

    const targetUser = await User.create({
      full_name: 'Target User',
      email: 'target@example.com',
      username: 'targetuser',
      password: 'password123',
    })

    const response = await client
      .put('/api/v1/admin/roles/attach')
      .json({
        user_id: targetUser.id,
        role_ids: [editorRole.id],
      })
      .loginAs(adminUser)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Role attached successfully',
    })

    const userRoles = await db
      .from('user_roles')
      .where('user_id', targetUser.id)
      .where('role_id', editorRole.id)

    assert.lengthOf(userRoles, 1)
  })

  test('should validate attach role payload', async ({ client }) => {
    const adminRole = await Role.firstOrCreate(
      { slug: IRole.Slugs.ADMIN },
      {
        name: 'Admin',
        slug: IRole.Slugs.ADMIN,
        description: 'Administrator role',
      }
    )

    const adminUser = await User.create({
      full_name: 'Admin User',
      email: 'admin@example.com',
      username: 'adminuser',
      password: 'password123',
    })

    await adminUser.related('roles').sync([adminRole.id])

    const response = await client.put('/api/v1/admin/roles/attach').json({}).loginAs(adminUser)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'user_id',
          rule: 'required',
        },
        {
          field: 'role_ids',
          rule: 'required',
        },
      ],
    })
  })

  test('should handle non-existent user when attaching role', async ({ client }) => {
    const adminRole = await Role.firstOrCreate(
      { slug: IRole.Slugs.ADMIN },
      {
        name: 'Admin',
        slug: IRole.Slugs.ADMIN,
        description: 'Administrator role',
      }
    )

    const userRole = await Role.firstOrCreate(
      { slug: IRole.Slugs.USER },
      {
        name: 'User',
        slug: IRole.Slugs.USER,
        description: 'Regular user role',
      }
    )

    const adminUser = await User.create({
      full_name: 'Admin User',
      email: 'admin@example.com',
      username: 'adminuser',
      password: 'password123',
    })

    await adminUser.related('roles').sync([adminRole.id])

    const response = await client
      .put('/api/v1/admin/roles/attach')
      .json({
        user_id: 999999,
        role_ids: [userRole.id],
      })
      .loginAs(adminUser)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'User not found',
    })
  })

  test('should handle non-existent role when attaching', async ({ client }) => {
    const adminRole = await Role.firstOrCreate(
      { slug: IRole.Slugs.ADMIN },
      {
        name: 'Admin',
        slug: IRole.Slugs.ADMIN,
        description: 'Administrator role',
      }
    )

    const adminUser = await User.create({
      full_name: 'Admin User',
      email: 'admin@example.com',
      username: 'adminuser',
      password: 'password123',
    })

    await adminUser.related('roles').sync([adminRole.id])

    const targetUser = await User.create({
      full_name: 'Target User',
      email: 'target@example.com',
      username: 'targetuser',
      password: 'password123',
    })

    const response = await client
      .put('/api/v1/admin/roles/attach')
      .json({
        user_id: targetUser.id,
        role_ids: [999999],
      })
      .loginAs(adminUser)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Role not found',
    })
  })

  test('should prevent duplicate role attachment', async ({ client }) => {
    const adminRole = await Role.firstOrCreate(
      { slug: IRole.Slugs.ADMIN },
      {
        name: 'Admin',
        slug: IRole.Slugs.ADMIN,
        description: 'Administrator role',
      }
    )

    const userRole = await Role.firstOrCreate(
      { slug: IRole.Slugs.USER },
      {
        name: 'User',
        slug: IRole.Slugs.USER,
        description: 'Regular user role',
      }
    )

    const adminUser = await User.create({
      full_name: 'Admin User',
      email: 'admin@example.com',
      username: 'adminuser',
      password: 'password123',
    })

    await adminUser.related('roles').sync([adminRole.id])

    const targetUser = await User.create({
      full_name: 'Target User',
      email: 'target@example.com',
      username: 'targetuser',
      password: 'password123',
    })

    // First attachment
    await targetUser.related('roles').sync([userRole.id])

    // Try to attach same role again
    const response = await client
      .put('/api/v1/admin/roles/attach')
      .json({
        user_id: targetUser.id,
        role_ids: [userRole.id],
      })
      .loginAs(adminUser)

    response.assertStatus(409)
    response.assertBodyContains({
      message: 'User already has this role',
    })
  })

  test('should require authentication for admin endpoints', async ({ client }) => {
    const responses = await Promise.all([
      client.get('/api/v1/admin/roles'),
      client.put('/api/v1/admin/roles/attach').json({}),
    ])

    responses.forEach((response) => {
      response.assertStatus(401)
    })
  })
})
