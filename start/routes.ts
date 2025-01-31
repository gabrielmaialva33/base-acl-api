/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import '#modules/health/routes/index'
import '#modules/role/routes/index'
import '#modules/user/routes/index'
import '#modules/file/routes/index'

router.get('/', async () => {
  return { hello: 'world' }
})
