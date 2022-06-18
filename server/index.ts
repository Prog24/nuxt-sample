import express, { json, urlencoded, Request, Response } from 'express'
import { isAvailable, project } from 'gcp-metadata'
import { OAuth2Client } from 'google-auth-library'

const app = express()
app.use(json())
app.use(urlencoded({ extended: true }))

const oAuth2Client = new OAuth2Client()

let aud: any

const audience = async () => {
  if (!aud && (await isAvailable())) {
    const projectNumber = await project('numeric-project-id')
    const projectId = await project('project-id')
    aud = '/projects/' + projectNumber + '/apps/' + projectId
  }
  return aud
}

const validateAssertion = async (assertion: any) => {
  if (!assertion) {
    return {}
  }
  const aud = await audience()

  const response = await oAuth2Client.getIapPublicKeys()
  // eslint-disable-next-line no-console
  console.log('!!!!')
  // eslint-disable-next-line no-console
  console.log(response)
  const ticket = await oAuth2Client.verifySignedJwtWithCertsAsync(
    assertion,
    response.pubkeys,
    aud,
    ['https://cloud.google.com/iap']
  )
  const payload = ticket.getPayload()
  // eslint-disable-next-line no-console
  return {
    email: payload?.email,
    sub: payload?.sub,
  }
}

app.get('/api/ping', async (request: Request, response: Response) => {
  const assertion = request.header('X-Goog-IAP-JWT-Assertion')
  let email: string | undefined = 'None'
  // eslint-disable-next-line no-console
  console.log('>>>', assertion)
  try {
    // eslint-disable-next-line no-console
    console.log('jogehoge')
    const info = await validateAssertion(assertion)
    email = info.email
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }
  response.json({ message: email })
})

export default app
