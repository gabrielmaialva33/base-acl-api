import jwt from 'jsonwebtoken'

export default class JwtService {
  async verify(token: string, secret: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) return reject(err)
        resolve(decoded)
      })
    })
  }

  async sign(payload: any, secret: string, expiresIn: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      jwt.sign(payload, secret, { expiresIn }, (err, token) => {
        if (err) return reject(err)
        if (!token) return reject('Token not generated')
        resolve(token)
      })
    })
  }
}
