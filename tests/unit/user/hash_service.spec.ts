import { test } from '@japa/runner'
import hash from '@adonisjs/core/services/hash'

test.group('Hash service', () => {
  test('should hash a password', async ({ assert }) => {
    const password = 'password123'
    const hashedPassword = await hash.make(password)

    assert.isString(hashedPassword)
    assert.notEqual(hashedPassword, password)
    assert.isTrue(hash.isValidHash(hashedPassword))
  })

  test('should verify a correct password', async ({ assert }) => {
    const password = 'password123'
    const hashedPassword = await hash.make(password)

    const isValid = await hash.verify(hashedPassword, password)
    assert.isTrue(isValid)
  })

  test('should reject an incorrect password', async ({ assert }) => {
    const password = 'password123'
    const hashedPassword = await hash.make(password)

    const isValid = await hash.verify(hashedPassword, 'wrongpassword')
    assert.isFalse(isValid)
  })

  test('should generate different hashes for same password', async ({ assert }) => {
    const password = 'password123'
    const hash1 = await hash.make(password)
    const hash2 = await hash.make(password)

    assert.notEqual(hash1, hash2)
    assert.isTrue(await hash.verify(hash1, password))
    assert.isTrue(await hash.verify(hash2, password))
  })

  test('should identify valid hash format', async ({ assert }) => {
    const validHash = await hash.make('password')
    const invalidHash = 'not-a-valid-hash'

    assert.isTrue(hash.isValidHash(validHash))
    assert.isFalse(hash.isValidHash(invalidHash))
  })

  test('should handle empty strings', async ({ assert }) => {
    const emptyPassword = ''
    const hashedEmpty = await hash.make(emptyPassword)

    assert.isString(hashedEmpty)
    assert.isTrue(await hash.verify(hashedEmpty, emptyPassword))
    assert.isFalse(await hash.verify(hashedEmpty, 'not-empty'))
  })

  test('should handle special characters in passwords', async ({ assert }) => {
    const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const hashedSpecial = await hash.make(specialPassword)

    assert.isTrue(await hash.verify(hashedSpecial, specialPassword))
  })

  test('should handle unicode characters', async ({ assert }) => {
    const unicodePassword = '你好世界🌍'
    const hashedUnicode = await hash.make(unicodePassword)

    assert.isTrue(await hash.verify(hashedUnicode, unicodePassword))
    assert.isFalse(await hash.verify(hashedUnicode, 'hello world'))
  })

  test('should handle very long passwords', async ({ assert }) => {
    const longPassword = 'a'.repeat(1000)
    const hashedLong = await hash.make(longPassword)

    assert.isTrue(await hash.verify(hashedLong, longPassword))
    assert.isFalse(await hash.verify(hashedLong, 'a'.repeat(999)))
  })

  test('should handle rehashing needs check', async ({ assert }) => {
    const password = 'password123'
    const hashedPassword = await hash.make(password)

    // Currently hashed password should not need rehashing
    const needsRehash = hash.needsReHash(hashedPassword)
    assert.isFalse(needsRehash)
  })
})
