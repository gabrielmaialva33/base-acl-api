import router from '@adonisjs/core/services/router'

const HealthChecksController = () => import('#modules/health/controllers/health_checks_controller')

router.get('/health', [HealthChecksController, 'handle']).as('public.health')
