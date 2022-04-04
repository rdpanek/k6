import { fail } from 'k6'

export default (credentials, environment, traceId = '00000000000000000000000000000000') => {
  if (!credentials.user || !credentials.pass) { fail("config: USER od PASS is missing.") }
  if (!environment) { fail("config: ENVIRONMENT is missing.") }

  return {
    credentials: credentials,
    traceId,
    environment
  }
}