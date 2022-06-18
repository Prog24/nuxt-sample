import express, { json, urlencoded, Request, Response } from 'express'
import request from 'request'
const jwt = require('jsonwebtoken')

const app = express()
app.use(json())
app.use(urlencoded({ extended: true }))

const getPublicKey = (token: string) => {
  return new Promise((resolve) => {
    request(
      {
        url: 'https://www.gstatic.com/iap/verify/public_key',
        method: 'GET',
        json: true,
      },
      (_: any, res: any) => {
        resolve(res.body[jwt.decode(token, { complete: true }).header.kid])
      }
    )
  })
}

app.get('/api/ping', async (request: Request, response: Response) => {
  const token = request.headers['x-goog-iap-jwt-assertion']
  const publicKey = await getPublicKey(token as string)
  jwt.verify(token, publicKey, (_: any, decoded: any) => {
    response.json({ jwt: token, dec: decoded })
  })
})

export default app
