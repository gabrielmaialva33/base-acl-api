import { test } from '@japa/runner'
import UserFactory from 'Database/factories/UserFactory'
import { getRoleByName } from 'App/Modules/Accounts/Services/Role'

test.group('Role: Root - List', () => {
  test('it should be able to list all roles', async ({ client, assert }) => {
    const { id: rootRoleId } = await getRoleByName('root')
    const rootUser = await UserFactory.merge({ password: 'password' }).create()
    await rootUser.related('roles').attach([rootRoleId])
    await rootUser.load('roles')
    console.log(rootUser.toJSON())
  })
})
