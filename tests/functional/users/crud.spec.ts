import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#modules/user/models/user'
import Role from '#modules/role/models/role'
import Permission from '#modules/permission/models/permission'
import IRole from '#modules/role/interfaces/role_interface'
import IPermission from '#modules/permission/interfaces/permission_interface'
import db from '@adonisjs/lucid/services/db'

test.group('Users CRUD', (group) => {
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

  test('should get user by id', async ({ client }) => {
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

    // Assign read permission to user role
    await assignPermissions(userRole, [IPermission.Actions.READ])

    const targetUser = await User.create({
      full_name: 'Target User',
      email: 'target@example.com',
      username: 'targetuser',
      password: 'password123',
    })

    const response = await client.get(`/api/v1/users/${targetUser.id}`).loginAs(authUser)

    response.assertStatus(200)
    response.assertBodyContains({
      id: targetUser.id,
      email: targetUser.email,
      username: targetUser.username,
      full_name: targetUser.full_name,
    })
  })

  test('should return 404 for non-existent user', async ({ client }) => {
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

    // Assign read permission to user role
    await assignPermissions(userRole, [IPermission.Actions.READ])

    const response = await client.get('/api/v1/users/999999').loginAs(authUser)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'User not found',
    })
  })

  test('should create new user', async ({ client, assert }) => {
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

    // Assign create permission to user role
    await assignPermissions(userRole, [IPermission.Actions.CREATE])

    const newUserData = {
      full_name: 'New User',
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'password123',
      password_confirmation: 'password123',
    }

    const response = await client.post('/api/v1/users').json(newUserData).loginAs(authUser)

    response.assertStatus(201)
    response.assertBodyContains({
      email: newUserData.email,
      username: newUserData.username,
      full_name: newUserData.full_name,
    })

    const createdUser = await User.findBy('email', newUserData.email)
    assert.isNotNull(createdUser)
  })

  test('should validate user creation data', async ({ client }) => {
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

    // Assign create permission to user role
    await assignPermissions(userRole, [IPermission.Actions.CREATE])

    const response = await client
      .post('/api/v1/users')
      .json({
        full_name: 'New User',
        email: 'invalid-email',
        username: 'nu', // too short
        password: '123', // too short
      })
      .loginAs(authUser)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'email',
          rule: 'email',
        },
        {
          field: 'username',
          rule: 'minLength',
        },
        {
          field: 'password',
          rule: 'minLength',
        },
      ],
    })
  })

  test('should update user', async ({ client, assert }) => {
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

    // Assign update permission to user role
    await assignPermissions(userRole, [IPermission.Actions.UPDATE])

    const targetUser = await User.create({
      full_name: 'Old Name',
      email: 'olduser@example.com',
      username: 'olduser',
      password: 'password123',
    })

    const updateData = {
      full_name: 'Updated Name',
    }

    const response = await client
      .put(`/api/v1/users/${targetUser.id}`)
      .json(updateData)
      .loginAs(authUser)

    response.assertStatus(200)
    response.assertBodyContains({
      id: targetUser.id,
      full_name: updateData.full_name,
      email: targetUser.email,
      username: targetUser.username,
    })

    await targetUser.refresh()
    assert.equal(targetUser.full_name, updateData.full_name)
  })

  test('should not update email or username', async ({ client, assert }) => {
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

    // Assign update permission to user role
    await assignPermissions(userRole, [IPermission.Actions.UPDATE])

    const originalEmail = 'original@example.com'
    const originalUsername = 'originaluser'

    const targetUser = await User.create({
      full_name: 'Target User',
      email: originalEmail,
      username: originalUsername,
      password: 'password123',
    })

    const response = await client
      .put(`/api/v1/users/${targetUser.id}`)
      .json({
        email: 'newemail@example.com',
        username: 'newusername',
        full_name: 'Updated User',
      })
      .loginAs(authUser)

    response.assertStatus(200)

    await targetUser.refresh()
    assert.equal(targetUser.email, originalEmail)
    assert.equal(targetUser.username, originalUsername)
    assert.equal(targetUser.full_name, 'Updated User')
  })

  test('should delete user (soft delete)', async ({ client, assert }) => {
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

    // Assign delete permission to user role
    await assignPermissions(userRole, [IPermission.Actions.DELETE])

    const targetUser = await User.create({
      full_name: 'Delete Me',
      email: 'deleteme@example.com',
      username: 'deleteme',
      password: 'password123',
    })

    const response = await client.delete(`/api/v1/users/${targetUser.id}`).loginAs(authUser)

    response.assertStatus(204)

    // Check if soft deleted
    const deletedUser = await db.from('users').where('id', targetUser.id).first()
    assert.isNotNull(deletedUser)
    assert.isTrue(deletedUser!.is_deleted)

    // Check if not found with normal query due to soft delete scope
    const notFoundUser = await User.find(targetUser.id)
    assert.isNull(notFoundUser)
  })

  test('should require authentication for all operations', async ({ client }) => {
    const responses = await Promise.all([
      client.get('/api/v1/users'),
      client.get('/api/v1/users/1'),
      client.post('/api/v1/users').json({}),
      client.put('/api/v1/users/1').json({}),
      client.delete('/api/v1/users/1'),
    ])

    responses.forEach((response) => {
      response.assertStatus(401)
    })
  })
})
