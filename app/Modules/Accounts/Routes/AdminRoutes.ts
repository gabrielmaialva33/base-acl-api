import Route from '@ioc:Adonis/Core/Route'

import RolesController from 'App/Modules/Accounts/Controllers/Http/Admin/RolesController'
import UsersController from 'App/Modules/Accounts/Controllers/Http/Admin/UsersController'

Route.group(() => {
  /**
   * Roles Routes
   */
  Route.group(() => {
    Route.get('/', new RolesController().list).as('roles.admin.list')
    Route.get('/:id', new RolesController().get).as('roles.admin.get')
    Route.post('/', new RolesController().store).as('roles.admin.store')
    Route.put('/:id', new RolesController().edit).as('roles.admin.edit')
    Route.delete('/:id', new RolesController().delete).as('roles.admin.delete')
  }).prefix('roles')

  /**
   * User Routes
   */
  Route.group(() => {
    Route.get('/', new UsersController().list).as('users.admin.list')
    Route.get('/:id', new UsersController().get).as('users.admin.get')
    Route.post('/', new UsersController().store).as('users.admin.store')
    Route.put('/:id', new UsersController().edit).as('users.admin.edit')
    Route.delete('/:id', new UsersController().delete).as('users.admin.delete')
  }).prefix('users')
}).prefix('admin')
