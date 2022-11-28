import { fail } from 'k6'

export default (credentials, environment, traceId = '00000000000000000000000000000000', tag = 'localhost') => {
  if (!environment) { fail("config: ENVIRONMENT is missing.") }

  return {
    credentials: credentials,
    traceId,
    environment,
    tag
  }
}