import { test } from '@japa/runner'

test.group('Basic API', () => {
  test('should respond to root route', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertBodyContains({
      name: 'base-acl-api',
      version: '0.0.1',
    })
  })

  test('should check if CSRF is properly disabled for API routes', async ({ client }) => {
    const response = await client.post('/api/v1/sessions/sign-in').json({})

    // Should get validation error, not CSRF error
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
})
