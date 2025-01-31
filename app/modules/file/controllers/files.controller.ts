import { HttpContext } from '@adonisjs/core/http'

import app from '@adonisjs/core/services/app'
import UploadFileService from '#modules/file/services/upload-file/upload-file.service'

export default class FilesController {
  async upload({ request, response }: HttpContext) {
    const file = request.file('file', {
      size: '5mb',
      extnames: ['jpeg', 'jpg', 'png'],
    })
    if (!file) return response.badRequest({ error: 'File missing' })

    const service = await app.container.make(UploadFileService)
    const data = await service.run(file)

    return response.json(data)
  }
}
