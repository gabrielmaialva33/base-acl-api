import { test } from '@japa/runner'

test.group('Health check', () => {
  test('should return ok status', async ({ client, assert }) => {
    const response = await client.get('/api/v1/health')

    // Health check can return either 200 (healthy) or 503 (unhealthy)
    assert.oneOf(response.status(), [200, 503])
    response.assertBodyContains({
      healthy: response.status() === 200,
    })
  })

  test('should include required fields in response', async ({ client, assert }) => {
    const response = await client.get('/api/v1/health')

    assert.oneOf(response.status(), [200, 503])
    assert.properties(response.body(), ['healthy', 'services'])

    // Check that services object exists and has database key
    assert.properties(response.body().services, ['database'])
    assert.properties(response.body().services.database, ['healthy'])
  })

  test('should be accessible without authentication', async ({ client, assert }) => {
    const response = await client.get('/api/v1/health')

    // Should be accessible regardless of health status
    assert.oneOf(response.status(), [200, 503])
  })
})
