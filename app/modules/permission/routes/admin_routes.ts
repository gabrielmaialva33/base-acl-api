import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import IPermission from '#modules/permission/interfaces/permission_interface'

const PermissionsController = () => import('#modules/permission/controllers/permissions_controller')

router
  .group(() => {
    // Permission management routes
    router.get('/permissions', [PermissionsController, 'list']).as('permission.list')
    router.post('/permissions', [PermissionsController, 'create']).as('permission.create')

    // Role permission management
    router
      .put('/roles/permissions/sync', [PermissionsController, 'syncRolePermissions'])
      .as('permission.syncRole')
    router
      .put('/roles/permissions/attach', [PermissionsController, 'attachRolePermissions'])
      .as('permission.attachRole')
    router
      .put('/roles/permissions/detach', [PermissionsController, 'detachRolePermissions'])
      .as('permission.detachRole')

    // User permission management
    router
      .put('/users/permissions/sync', [PermissionsController, 'syncUserPermissions'])
      .as('permission.syncUser')
    router
      .get('/users/:id/permissions', [PermissionsController, 'getUserPermissions'])
      .as('permission.userPermissions')
    router
      .post('/users/:id/permissions/check', [PermissionsController, 'checkUserPermissions'])
      .as('permission.checkUser')
  })
  .use([
    middleware.auth(),
    middleware.permission({
      permissions: IPermission.Resources.PERMISSIONS + '.' + IPermission.Actions.LIST,
    }),
  ])
  .prefix('/api/v1/admin')
