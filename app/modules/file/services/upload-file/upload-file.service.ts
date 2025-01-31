import { inject } from '@adonisjs/core'
import drive from '@adonisjs/drive/services/main'
import { HttpContext } from '@adonisjs/core/http'

import { MultipartFile } from '@adonisjs/core/types/bodyparser'
import { cuid } from '@adonisjs/core/helpers'
import env from '#start/env'

@inject()
export default class UploadFileService {
  async run(file: MultipartFile) {
    const key = `uploads/${cuid()}.${file.extname}`
    await file.moveToDisk(key)

    const url = await drive.use().getUrl(key)

    if (env.get('DRIVE_DISK') === 'fs') {
      const { request } = HttpContext.getOrFail()

      return {
        url: `${request.protocol()}://${request.host()}${url}`,
      }
    }

    return {
      url: await drive.use().getUrl(key),
    }
  }
}
