import { RequestException } from '$responses/exceptions/request-exception.response'
import dotenv from 'dotenv'

dotenv.config()

export default class Ig {
  async getWebhook(body: any) {
    if (body['hub.verify_token'] !== process.env.IG_VERIFY_TOKEN) {
      throw new RequestException('Invalid verify token')
    }
    return body['hub.challenge']
  }

  async postWebhook(body: any) {
    console.log(body.entry[0].messaging)
  }
}

