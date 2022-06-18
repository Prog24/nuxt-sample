import express, { json, urlencoded, Request, Response } from 'express'

const app = express()
app.use(json())
app.use(urlencoded({ extended: true }))

// const getPublicKey = (token: string) => {
//   return new Promise(resolve => {
//     request({
//       url: "https://www.gstatic.com/iap/verify/public_key",
//       method: "GET",
//       json: true
//     }, (_, res) => {
//       // eslint-disable-next-line import/no-named-as-default-member
//       resolve(res.body[jwt.decode(token, { complete: true }).header.kid])
//     })
//   })
// }

app.get('/api/ping', (request: Request, response: Response) => {
  const token = request.headers['x-goog-iap-jwt-assertion']
  response.json({ jwt: token })
})

export default app
