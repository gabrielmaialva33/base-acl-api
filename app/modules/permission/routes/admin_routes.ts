import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { adminThrottle } from '#start/limiter'
import IPermission from '#modules/permission/interfaces/permission_interface'

const PermissionsController = () => import('#modules/permission/controllers/permissions_controller')

router
  .group(() => {
    // Permission management routes
    router
      .get('/permissions', [PermissionsController, 'list'])
      .as('permission.list')
      .use(
        middleware.permission({
          permissions: IPermission.Resources.PERMISSIONS + '.' + IPermission.Actions.LIST,
        })
      )

    router
      .post('/permissions', [PermissionsController, 'create'])
      .as('permission.create')
      .use(
        middleware.permission({
          permissions: IPermission.Resources.PERMISSIONS + '.' + IPermission.Actions.CREATE,
        })
      )

    // Role permission management
    router
      .put('/roles/permissions/sync', [PermissionsController, 'syncRolePermissions'])
      .as('permission.syncRole')
      .use(
        middleware.permission({
          permissions: IPermission.Resources.PERMISSIONS + '.' + IPermission.Actions.UPDATE,
        })
      )

    router
      .put('/roles/permissions/attach', [PermissionsController, 'attachRolePermissions'])
      .as('permission.attachRole')
      .use(
        middleware.permission({
          permissions: IPermission.Resources.PERMISSIONS + '.' + IPermission.Actions.UPDATE,
        })
      )

    router
      .put('/roles/permissions/detach', [PermissionsController, 'detachRolePermissions'])
      .as('permission.detachRole')
      .use(
        middleware.permission({
          permissions: IPermission.Resources.PERMISSIONS + '.' + IPermission.Actions.UPDATE,
        })
      )

    // User permission management
    router
      .put('/users/permissions/sync', [PermissionsController, 'syncUserPermissions'])
      .as('permission.syncUser')
      .use(
        middleware.permission({
          permissions: IPermission.Resources.PERMISSIONS + '.' + IPermission.Actions.UPDATE,
        })
      )

    router
      .get('/users/:id/permissions', [PermissionsController, 'getUserPermissions'])
      .as('permission.userPermissions')
      .use(
        middleware.permission({
          permissions: IPermission.Resources.PERMISSIONS + '.' + IPermission.Actions.LIST,
        })
      )

    router
      .post('/users/:id/permissions/check', [PermissionsController, 'checkUserPermissions'])
      .as('permission.checkUser')
      .use(
        middleware.permission({
          permissions: IPermission.Resources.PERMISSIONS + '.' + IPermission.Actions.LIST,
        })
      )
  })
  .use([middleware.auth(), adminThrottle])
  .prefix('/api/v1/admin')
