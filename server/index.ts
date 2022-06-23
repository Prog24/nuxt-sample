import express, {
  json,
  urlencoded,
  Request,
  Response,
  NextFunction,
} from 'express'
import { isAvailable, project } from 'gcp-metadata'
import { OAuth2Client } from 'google-auth-library'

const app = express()
app.use(json())
app.use(urlencoded({ extended: true }))

// https://cloud.google.com/nodejs/getting-started/authenticate-users?hl=ja
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
  const ticket = await oAuth2Client.verifySignedJwtWithCertsAsync(
    assertion,
    response.pubkeys,
    aud,
    ['https://cloud.google.com/iap']
  )
  const payload = ticket.getPayload()
  return {
    email: payload?.email,
    sub: payload?.sub,
    exp: payload?.exp,
  }
}

const verifyToken = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const assertion = request.header('X-Goog-IAP-JWT-Assertion')
  try {
    const info = await validateAssertion(assertion)
    if (!info.exp) {
      // eslint-disable-next-line no-console
      console.log('1')
      response.status(403).json({ message: 'Forbidden' })
    } else if (Date.now() < info.exp * 1000) {
      // eslint-disable-next-line no-console
      console.log(info)
      response.locals.email = info.email
      next()
    } else {
      // eslint-disable-next-line no-console
      console.log('2')
      response.status(403).json({ message: 'Forbidden' })
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    // eslint-disable-next-line no-console
    console.log('3')
    response.status(403).json({ message: 'Forbidden' })
  }
}

app.get('/api/ping', verifyToken, (_request: Request, response: Response) => {
  // const assertion = request.header('X-Goog-IAP-JWT-Assertion')
  // let email: string | undefined = 'None'
  // try {
  //   const info = await validateAssertion(assertion)
  //   email = info.email
  // } catch (error) {
  //   // eslint-disable-next-line no-console
  //   console.error(error)
  // }
  response.json({ message: response.locals.email })
})

export default app
