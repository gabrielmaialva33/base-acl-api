import {configApp} from '@adonisjs/eslint-config'

export default configApp({
  rules: {
    '@unicorn/filename-case': [
      'error',
      {
        cases: {
          kebabCase: true,
          snakeCase: true,
        }
      },
    ],
  }
})
