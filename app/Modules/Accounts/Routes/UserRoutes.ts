import Route from '@ioc:Adonis/Core/Route'

import UsersController from 'App/Modules/Accounts/Controllers/Http/User/UsersController'

Route.group(() => {
  Route.get('/', new UsersController().list).as('users.list')
  Route.get('/:id', new UsersController().get).as('users.get')
  Route.post('/', new UsersController().store).as('users.store')
  Route.put('/:id', new UsersController().edit).as('users.edit')
  Route.delete('/:id', new UsersController().delete).as('users.delete')
}).prefix('users')