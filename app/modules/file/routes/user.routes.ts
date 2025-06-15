import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import IRole from '#modules/role/interfaces/role_interface'

const FilesController = () => import('#modules/file/controllers/files.controller')

router
  .group(() => {
    router.post('/upload', [FilesController, 'upload']).as('files.upload')
  })
  .use([
    middleware.auth(),
    middleware.acl({
      role_slugs: [IRole.Slugs.USER],
    }),
  ])
  .prefix('/api/v1/files')
