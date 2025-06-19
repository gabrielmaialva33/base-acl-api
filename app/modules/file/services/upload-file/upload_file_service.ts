import { inject } from '@adonisjs/core'
import drive from '@adonisjs/drive/services/main'
import { HttpContext } from '@adonisjs/core/http'

import { MultipartFile } from '@adonisjs/core/types/bodyparser'
import { cuid } from '@adonisjs/core/helpers'
import env from '#start/env'
import File from '#modules/file/models/file'

@inject()
export default class UploadFileService {
  async run(file: MultipartFile) {
    const { auth } = HttpContext.getOrFail()
    const user = auth.use('jwt').user!

    const key = `uploads/${cuid()}.${file.extname}`
    await file.moveToDisk(key)

    const url = await drive.use().getUrl(key)

    // Determine file category based on extension
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']
    const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a']

    let fileCategory = 'file'
    if (imageExtensions.includes(file.extname || '')) {
      fileCategory = 'image'
    } else if (documentExtensions.includes(file.extname || '')) {
      fileCategory = 'document'
    } else if (videoExtensions.includes(file.extname || '')) {
      fileCategory = 'video'
    } else if (audioExtensions.includes(file.extname || '')) {
      fileCategory = 'audio'
    }

    const finalUrl =
      env.get('DRIVE_DISK') === 'fs'
        ? `${HttpContext.getOrFail().request.protocol()}://${HttpContext.getOrFail().request.host()}${url}`
        : await drive.use().getUrl(key)

    // Determine file type - prefer MIME type, fallback to extension-based type
    let fileType = file.type
    if (!fileType || fileType.trim() === '' || fileType === fileCategory) {
      if (fileCategory === 'image') {
        const mimeMap: Record<string, string> = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          gif: 'image/gif',
          webp: 'image/webp',
          svg: 'image/svg+xml',
        }
        fileType = mimeMap[file.extname || ''] || 'image/png'
      } else if (fileCategory === 'document') {
        const mimeMap: Record<string, string> = {
          pdf: 'application/pdf',
          doc: 'application/msword',
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          xls: 'application/vnd.ms-excel',
          xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }
        fileType = mimeMap[file.extname || ''] || 'application/octet-stream'
      } else if (fileCategory === 'video') {
        const mimeMap: Record<string, string> = {
          mp4: 'video/mp4',
          avi: 'video/x-msvideo',
          mov: 'video/quicktime',
        }
        fileType = mimeMap[file.extname || ''] || 'video/mp4'
      } else if (fileCategory === 'audio') {
        const mimeMap: Record<string, string> = {
          mp3: 'audio/mpeg',
          wav: 'audio/wav',
          flac: 'audio/flac',
        }
        fileType = mimeMap[file.extname || ''] || 'audio/mpeg'
      } else {
        fileType = fileCategory
      }
    }

    // Create file record in database
    await File.create({
      owner_id: user.id,
      client_name: file.clientName?.replace(`.${file.extname}`, '') || '',
      file_name: key,
      file_size: file.size || 0,
      file_type: fileType,
      file_category: fileCategory,
      url: finalUrl,
    })

    return {
      url: finalUrl,
      clientName: file.clientName?.replace(`.${file.extname}`, ''),
      fileCategory,
      fileType,
      size: file.size,
      extname: file.extname,
    }
  }
}
