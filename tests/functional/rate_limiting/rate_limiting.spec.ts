import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'

import User from '#modules/user/models/user'
import Role from '#modules/role/models/role'

import IRole from '#modules/role/interfaces/role_interface'

test.group('Rate Limiting', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.each.setup(() => {
    // Clear rate limiter storage before each test
    return () => limiter.clear()
  })

  test('should rate limit authentication attempts', async ({ client, assert }) => {
    // Create a user
    await User.create({
      full_name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    })

    // Make 5 failed requests (the limit)
    for (let i = 0; i < 5; i++) {
      const response = await client.post('/api/v1/sessions/sign-in').json({
        uid: 'test@example.com',
        password: 'wrong_password',
      })

      // Should get 400 for invalid credentials
      response.assertStatus(400)
    }

    // The 6th request should be rate limited
    const rateLimitedResponse = await client.post('/api/v1/sessions/sign-in').json({
      uid: 'test@example.com',
      password: 'password123',
    })

    rateLimitedResponse.assertStatus(429)
    rateLimitedResponse.assertBodyContains({
      errors: [
        {
          code: 'E_TOO_MANY_REQUESTS',
          status: 429,
        },
      ],
    })

    // Check rate limit headers
    assert.exists(rateLimitedResponse.header('x-ratelimit-limit'))
    assert.exists(rateLimitedResponse.header('x-ratelimit-remaining'))
    assert.exists(rateLimitedResponse.header('retry-after'))
  })

  test('should apply different rate limits for authenticated vs guest users', async ({
    client,
    assert,
  }) => {
    // Create a user with a role
    const userRole = await Role.firstOrCreate(
      { slug: IRole.Slugs.USER },
      {
        name: 'User',
        slug: IRole.Slugs.USER,
        description: 'Regular user',
      }
    )

    const user = await User.create({
      full_name: 'API User',
      email: 'api@example.com',
      password: 'password123',
    })

    await user.related('roles').sync([userRole.id])

    // Test guest rate limit (should be 20 requests per minute)
    const guestResponses = []
    for (let i = 0; i < 21; i++) {
      const response = await client.get('/')
      guestResponses.push(response)
    }

    // The first 20 should succeed
    for (let i = 0; i < 20; i++) {
      assert.equal(guestResponses[i].status(), 200)
    }

    // 21st should be rate-limited
    assert.equal(guestResponses[20].status(), 429)

    // Clear limiter for authenticated test
    await limiter.clear()

    // Test authenticated rate limit (should be 60 requests per minute)
    const authResponses = []
    for (let i = 0; i < 61; i++) {
      const response = await client.get('/').loginAs(user)
      authResponses.push(response)
    }

    // The first 60 should succeed
    for (let i = 0; i < 60; i++) {
      assert.equal(authResponses[i].status(), 200)
    }

    // 61st should be rate limited
    assert.equal(authResponses[60].status(), 429)
  })

  test('should block user after exceeding auth attempts', async ({ client, assert }) => {
    // Make 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await client.post('/api/v1/sessions/sign-in').json({
        uid: 'blocked@example.com',
        password: 'wrong_password',
      })
    }

    // 6th attempt should be blocked for 30 minutes
    const blockedResponse = await client.post('/api/v1/sessions/sign-in').json({
      uid: 'blocked@example.com',
      password: 'any_password',
    })

    blockedResponse.assertStatus(429)

    // Check retry-after header (should be around 30 minutes = 1800 seconds)
    const retryAfter = blockedResponse.header('retry-after')
    assert.exists(retryAfter)
    assert.isAbove(Number(retryAfter), 1700) // Allow some variance
  })

  test('should apply upload rate limit', async ({ client }) => {
    // Create a user with upload permission
    const userRole = await Role.firstOrCreate(
      { slug: IRole.Slugs.USER },
      {
        name: 'User',
        slug: IRole.Slugs.USER,
        description: 'Regular user',
      }
    )

    const user = await User.create({
      full_name: 'Upload User',
      email: 'upload@example.com',
      password: 'password123',
    })

    await user.related('roles').sync([userRole.id])

    // Create file upload permission
    const PermissionModule = await import('#modules/permission/models/permission')
    const Permission = PermissionModule.default
    const IPermissionModule = await import('#modules/permission/interfaces/permission_interface')
    const IPermission = IPermissionModule.default

    const uploadPermission = await Permission.firstOrCreate(
      {
        resource: IPermission.Resources.FILES,
        action: IPermission.Actions.CREATE,
      },
      {
        name: 'files.create',
        resource: IPermission.Resources.FILES,
        action: IPermission.Actions.CREATE,
      }
    )

    await userRole.related('permissions').sync([uploadPermission.id])

    // Create test files for upload attempts
    const { join } = await import('node:path')
    const appModule = await import('@adonisjs/core/services/app')
    const app = appModule.default
    const fs = await import('node:fs')

    const testFiles = []
    for (let i = 0; i < 11; i++) {
      const testFilePath = join(app.tmpPath(), `test-${i}.txt`)
      await fs.promises.writeFile(testFilePath, `Test content ${i}`)
      testFiles.push(testFilePath)
    }

    // Make 10 upload attempts (the limit)
    for (let i = 0; i < 10; i++) {
      const response = await client
        .post('/api/v1/files/upload')
        .file('file', testFiles[i])
        .loginAs(user)

      response.assertStatus(201)
    }

    // 11th upload should be rate limited
    const rateLimitedResponse = await client
      .post('/api/v1/files/upload')
      .file('file', testFiles[10])
      .loginAs(user)

    rateLimitedResponse.assertStatus(429)
    rateLimitedResponse.assertBodyContains({
      errors: [
        {
          message: 'Upload limit exceeded. Please try again in an hour.',
          code: 'E_TOO_MANY_REQUESTS',
        },
      ],
    })

    // Clean up test files
    for (const file of testFiles) {
      await fs.promises.unlink(file)
    }
  })

  test('should respect different rate limits per endpoint', async ({ client, assert }) => {
    // Create admin user
    const adminRole = await Role.firstOrCreate(
      { slug: IRole.Slugs.ADMIN },
      {
        name: 'Admin',
        slug: IRole.Slugs.ADMIN,
        description: 'Administrator',
      }
    )

    const adminUser = await User.create({
      full_name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
    })

    await adminUser.related('roles').sync([adminRole.id])

    // Admin endpoints should allow 200 requests per minute
    const responses = []
    for (let i = 0; i < 5; i++) {
      const response = await client.get('/api/v1/admin/permissions').loginAs(adminUser)
      responses.push(response)
    }

    // All should succeed (well within the 200/min limit)
    responses.forEach((response) => {
      // Will get 403 without permission, but not 429
      assert.notEqual(response.status(), 429)
    })
  })
})
