import { join } from 'node:path'

import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { cuid } from '@adonisjs/core/helpers'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'

import User from '#modules/user/models/user'
import Role from '#modules/role/models/role'
import Permission from '#modules/permission/models/permission'
import File from '#modules/file/models/file'
import IRole from '#modules/role/interfaces/role_interface'
import IPermission from '#modules/permission/interfaces/permission_interface'

test.group('Files upload', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  // Helper function to create and assign permissions to a role
  async function assignPermissions(role: Role, actions: string[]) {
    const permissions = await Promise.all(
      actions.map((action) =>
        Permission.firstOrCreate(
          {
            resource: IPermission.Resources.FILES,
            action: action,
          },
          {
            name: `files.${action}`,
            resource: IPermission.Resources.FILES,
            action: action,
          }
        )
      )
    )
    await role.related('permissions').sync(permissions.map((p) => p.id))
  }

  test('should upload a file with authentication', async ({ client, assert }) => {
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

    // Assign create permission to user role
    await assignPermissions(userRole, [IPermission.Actions.CREATE])

    // Create a test file
    const testFilePath = join(app.tmpPath(), `test.txt`)
    const testContent = 'This is a test file content'
    await import('node:fs').then((fs) => fs.promises.writeFile(testFilePath, testContent))

    const response = await client
      .post('/api/v1/files/upload')
      .file('file', testFilePath)
      .loginAs(user)

    response.assertStatus(201)
    response.assertBodyContains({
      clientName: 'test',
      fileCategory: 'file',
    })

    const uploadedFile = await File.findBy('owner_id', user.id)
    assert.isNotNull(uploadedFile)
    assert.equal(uploadedFile!.owner_id, user.id)
    assert.equal(uploadedFile!.file_category, 'file')

    // Clean up test file
    await import('node:fs').then((fs) => fs.promises.unlink(testFilePath))
  })

  test('should upload an image file', async ({ client, assert }) => {
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

    // Assign create permission to user role
    await assignPermissions(userRole, [IPermission.Actions.CREATE])

    // Create a test image file (1x1 PNG)
    const testFilePath = join(app.tmpPath(), `test.png`)
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    )
    await import('node:fs').then((fs) => fs.promises.writeFile(testFilePath, pngBuffer))

    const response = await client
      .post('/api/v1/files/upload')
      .file('file', testFilePath)
      .loginAs(user)

    response.assertStatus(201)
    response.assertBodyContains({
      fileCategory: 'image',
      fileType: 'image/png',
    })

    const uploadedFile = await File.findBy('owner_id', user.id)
    assert.isNotNull(uploadedFile)
    assert.equal(uploadedFile!.file_category, 'image')
    assert.equal(uploadedFile!.file_type, 'image/png')

    // Clean up test file
    await import('node:fs').then((fs) => fs.promises.unlink(testFilePath))
  })

  test('should validate file is required', async ({ client }) => {
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

    // Assign create permission to user role
    await assignPermissions(userRole, [IPermission.Actions.CREATE])

    const response = await client.post('/api/v1/files/upload').loginAs(user)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'file',
          rule: 'required',
        },
      ],
    })
  })

  test('should validate file size', async ({ client }) => {
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

    // Assign create permission to user role
    await assignPermissions(userRole, [IPermission.Actions.CREATE])

    // Create a large test file (11MB - exceeds 10MB limit)
    const testFilePath = join(app.tmpPath(), `test-${cuid()}.txt`)
    const largeContent = 'a'.repeat(11 * 1024 * 1024) // 11MB
    await import('node:fs').then((fs) => fs.promises.writeFile(testFilePath, largeContent))

    const response = await client
      .post('/api/v1/files/upload')
      .file('file', testFilePath)
      .loginAs(user)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'file',
          rule: 'file.size',
        },
      ],
    })

    // Clean up test file
    await import('node:fs').then((fs) => fs.promises.unlink(testFilePath))
  })

  test('should validate file extensions', async ({ client }) => {
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

    // Assign create permission to user role
    await assignPermissions(userRole, [IPermission.Actions.CREATE])

    // Create a test file with disallowed extension
    const testFilePath = join(app.tmpPath(), `test-${cuid()}.exe`)
    await import('node:fs').then((fs) => fs.promises.writeFile(testFilePath, 'malicious content'))

    const response = await client
      .post('/api/v1/files/upload')
      .file('file', testFilePath)
      .loginAs(user)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'file',
          rule: 'file.extname',
        },
      ],
    })

    // Clean up test file
    await import('node:fs').then((fs) => fs.promises.unlink(testFilePath))
  })

  test('should handle multiple file uploads', async ({ client, assert }) => {
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

    // Assign create permission to user role
    await assignPermissions(userRole, [IPermission.Actions.CREATE])

    // Create test files
    const testFile1Path = join(app.tmpPath(), `test1-${cuid()}.txt`)
    const testFile2Path = join(app.tmpPath(), `test2-${cuid()}.txt`)
    await import('node:fs').then(async (fs) => {
      await fs.promises.writeFile(testFile1Path, 'Content 1')
      await fs.promises.writeFile(testFile2Path, 'Content 2')
    })

    // Upload first file
    const response1 = await client
      .post('/api/v1/files/upload')
      .file('file', testFile1Path)
      .loginAs(user)

    response1.assertStatus(201)

    // Upload second file
    const response2 = await client
      .post('/api/v1/files/upload')
      .file('file', testFile2Path)
      .loginAs(user)

    response2.assertStatus(201)

    const userFiles = await File.query().where('owner_id', user.id)
    assert.lengthOf(userFiles, 2)

    // Clean up test files
    await import('node:fs').then(async (fs) => {
      await fs.promises.unlink(testFile1Path)
      await fs.promises.unlink(testFile2Path)
    })
  })

  test('should categorize files correctly', async ({ client, assert }) => {
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

    // Assign create permission to user role
    await assignPermissions(userRole, [IPermission.Actions.CREATE])

    const testFiles = [
      { name: `image.jpg`, category: 'image' },
      { name: `document.pdf`, category: 'document' },
      { name: `video.mp4`, category: 'video' },
      { name: `audio.mp3`, category: 'audio' },
      { name: `other.zip`, category: 'file' },
    ]

    for (const testFile of testFiles) {
      const testFilePath = join(app.tmpPath(), testFile.name)

      // Create appropriate content for each file type
      let content: string | Buffer
      switch (testFile.name) {
        case 'image.jpg':
          // Create a minimal JPEG file (1x1 image)
          content = Buffer.from(
            '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/gA',
            'base64'
          )
          break
        case 'document.pdf':
          // Create a minimal PDF file
          content =
            '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF'
          break
        case 'video.mp4':
          // Create a minimal MP4 file with proper ftyp box
          content = Buffer.from(
            '0000002066747970697736400000000069736f6d617663316d70343100000020667265650000000000000000000000000000000000000000000000000000',
            'hex'
          )
          break
        case 'audio.mp3':
          // Create a minimal MP3 file with MPEG header (frame sync)
          content = Buffer.from('FFFB90000000000000000000000000000000000000000000', 'hex')
          break
        case 'other.zip':
          // Create a minimal ZIP file (empty archive)
          content = Buffer.from('504b05060000000000000000000000000000000000000000', 'hex')
          break
        default:
          content = 'test content'
      }

      await import('node:fs').then((fs) => fs.promises.writeFile(testFilePath, content))

      const response = await client
        .post('/api/v1/files/upload')
        .file('file', testFilePath)
        .loginAs(user)

      response.assertStatus(201)
      response.assertBodyContains({
        fileCategory: testFile.category,
      })

      // Clean up
      await import('node:fs').then((fs) => fs.promises.unlink(testFilePath))
    }

    const uploadedFiles = await File.query().where('owner_id', user.id)
    assert.lengthOf(uploadedFiles, testFiles.length)
  })

  test('should require authentication for file upload', async ({ client }) => {
    const response = await client.post('/api/v1/files/upload')

    response.assertStatus(401)
  })
})
