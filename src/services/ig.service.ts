import { ArticleAuthorization, Authorization, VideoAuthorization, WebradioAuthorization } from '$models/data/authorization.model'
import { Article } from '$models/features/article.model'
import { Video } from '$models/features/video.model'
import { WebradioShow } from '$models/features/webradio-show.model'
import jwt from '$utils/jwt'
import dotenv from 'dotenv'

const IG_URL = 'https://graph.instagram.com/v20.0'
const API = 'https://api.le-jdl-laroche.cf'
const CLIENT = process.env.NODE_ENV === 'production' ? 'https://le-jdl-laroche.cf' : 'http://192.168.1.7:5173'

dotenv.config()

export class IgService {
  async sendMessagesToJdl(element: WebradioShow | Video | Article, authorization: Authorization) {
    if (typeof authorization.content === 'string') authorization.content = JSON.parse(authorization.content)
      authorization.content = authorization.content as WebradioAuthorization | VideoAuthorization | ArticleAuthorization
      const igToken = process.env['IG_TOKEN'] + ''

      const jdlIgsids = JSON.parse(process.env['JDL_IGSIDS'] + '') as string[]

    // for (const igsid of jdlIgsids) {
    //   const payload = {
    //     recipient: {
    //       id: igsid
    //     },
    //     message
    //   }
    //   await fetch(`${IG_URL}/me/messages`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(payload)
    //   })
    // }
  }

  async sendMessagesToMan(element: WebradioShow | Video | Article, authorization: Authorization) {
    if (typeof authorization.content === 'string') authorization.content = JSON.parse(authorization.content)
    authorization.content = authorization.content as WebradioAuthorization | VideoAuthorization | ArticleAuthorization
    const igToken = process.env['IG_TOKEN'] + ''

    const manIgsids = JSON.parse(process.env['MAN_IGSIDS'] + '') as string[]
    // const manIds = JSON.parse(process.env['MAN_IDS'] + '') as string[]

    for (const [key, manIgsid] of manIgsids.entries()) {
      // const jwtMan = jwt.generateMan(manIds[key], 2)
      const url = `${CLIENT}/verif?id=${authorization.id}`
      const messages = this.getManMessages(element, authorization)

      for (const message of messages) {
        const payload = {
          recipient: {
            id: manIgsid
          },
          message
        }
        const res = await fetch(`${IG_URL}/me/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${igToken}`
          },
          body: JSON.stringify(payload)
        }).then(res => res.json()).catch(() => null)
        console.log(res)
      }
    }
  }

  private getManMessages(element: WebradioShow | Video | Article, authorization: Authorization): any {
    if (typeof authorization.content === 'string') authorization.content = JSON.parse(authorization.content)
    authorization.content = authorization.content as WebradioAuthorization | VideoAuthorization | ArticleAuthorization

    return [
      {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [
              {
                title: "Demande d'autorisation de publication",
                subtitle: 'Message automatique'
              }
            ]
          }
        }
      },
      {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [
              {
                title: element.title,
                subtitle: 'streamId' in element
                  ? `Émission\nDurée : ${(authorization.content as WebradioAuthorization).estimatedDuration}`
                  : 'type' in element
                    ? `Vidéo\nDurée : ${(authorization.content as VideoAuthorization).duration}`
                    : 'Article',
                image_url: `${API}/public/images/thumbnails/${element.thumbnail}`,
                buttons: [
                  {
                    type: 'web_url',
                    url: `${CLIENT}/verif`,
                    title: 'Consulter'
                  }
                ]
              }
            ]
          }
        }
      }
    ]
  }
}
