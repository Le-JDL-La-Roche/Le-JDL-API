import { ArticleAuthorization, Authorization, VideoAuthorization, WebradioAuthorization } from '$models/data/authorization.model'
import { Article } from '$models/features/article.model'
import { Video } from '$models/features/video.model'
import { WebradioShow } from '$models/features/webradio-show.model'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import jwt from '$utils/jwt'
import { DefaultException } from '$responses/exceptions/default-exception.response'
import { UNKNOWN_ERROR } from '$models/types'

export class MailService {
  private readonly API = 'https://api.le-jdl-laroche.cf'
  private readonly CLIENT = process.env.NODE_ENV === 'production' ? 'https://le-jdl-laroche.cf' : 'http://192.168.1.7:5173'

  async sendMessagesToJdl(element: WebradioShow | Video | Article, authorization: Authorization) {
    if (typeof authorization.content === 'string') authorization.content = JSON.parse(authorization.content)
    authorization.content = authorization.content as WebradioAuthorization | VideoAuthorization | ArticleAuthorization

    const jdlMails = ['lejdl@laroche.org']

    for (const [key, jdlMail] of jdlMails.entries()) {
      const mail = this.getJdlMessage(element, authorization)

      try {
        dotenv.config()
        const transporter = nodemailer.createTransport({
          host: 'localhost',
          port: 25,
          secure: false
        })

        await transporter.sendMail({
          from: '"Journal Du Lycée" <automatique@le-jdl-laroche.cf',
          to: jdlMail,
          subject:
            authorization.status == 2
              ? `Demande acceptée pour "${this.truncate(element.title)}"`
              : `Demande refusée pour "${this.truncate(element.title)}"`,
          html: mail
        })
      } catch (error: any) {
        throw new DefaultException(500, UNKNOWN_ERROR, error)
      }
    }
  }

  async sendMessagesToMan(element: WebradioShow | Video | Article, authorization: Authorization) {
    if (typeof authorization.content === 'string') authorization.content = JSON.parse(authorization.content)
    authorization.content = authorization.content as WebradioAuthorization | VideoAuthorization | ArticleAuthorization

    const manMails = JSON.parse(process.env.MAN_MAILS + '') as string[]

    for (const [key, manMail] of manMails.entries()) {
      const id = authorization.id
      const token = jwt.generateMan(manMail, 2)
      const mail = this.getManMessage(element, authorization, `${this.CLIENT}/verif?id=${id}&token=${token}`)

      try {
        dotenv.config()
        const transporter = nodemailer.createTransport({
          host: 'localhost',
          port: 25,
          secure: false
        })

        let info = await transporter.sendMail({
          from: '"Journal Du Lycée" <automatique@le-jdl-laroche.cf>',
          to: manMail,
          subject: `Demande d'autorisation pour "${this.truncate(element.title)}"`,
          html: mail
        })

        console.log('Message sent: %s', info.messageId)
      } catch (error: any) {
        throw new DefaultException(500, UNKNOWN_ERROR, error)
      }
    }
  }

  private getJdlMessage(element: WebradioShow | Video | Article, authorization: Authorization): any {
    if (typeof authorization.content === 'string') authorization.content = JSON.parse(authorization.content)
    authorization.content = authorization.content as WebradioAuthorization | VideoAuthorization | ArticleAuthorization

    const result =
      authorization.status == 2
        ? `<div class="info approved">
      <p>
        ✓&nbsp;&nbsp;&nbsp;<strong>Acceptée</strong> — Demande d'autorisation de publication
        acceptée par ${authorization.manager}. Vous pouvez publier ${
            'streamId' in element ? "l'émission" : 'type' in element ? 'la vidéo' : "l'article"
          }.
      </p>
    </div>`
        : `<div class="info refused">
      <p>
        ⦸&nbsp;&nbsp;&nbsp;<strong>Refusée</strong> — Demande d'autorisation de publication refusée par
        ${authorization.manager}. Motif&nbsp;: <i>${authorization.comments}</i>. Vous devez modifier votre demande et la renvoyer.
      </p>
    </div>`

    return `<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<div class="content">
  <h1>Demande de publication ${authorization.status === 2 ? 'acceptée' : 'refusée'}</h1>
  <div class="item">
    <img alt="Miniature" src="${this.API}/images/thumbnails/${element.thumbnail}" />
    <h4>${'streamId' in element ? `Émission` : 'type' in element ? `Vidéo` : 'Article'}</h4>
    <h2>${element.title}</h2>
    ${result}
    <a href="https://le-jdl-laroche.cf/admin">
      <button>Espace administrateur</button>
    </a>
  </div>
  <hr color="#e0e0e0" size="1"><small>Ceci est un message automatique.</small>
</div>`
  }

  private getManMessage(element: WebradioShow | Video | Article, authorization: Authorization, link: string): any {
    if (typeof authorization.content === 'string') authorization.content = JSON.parse(authorization.content)
    authorization.content = authorization.content as WebradioAuthorization | VideoAuthorization | ArticleAuthorization

    return `<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<div class="content">
  <h1>Demande d'autorisation de publication</h1>
  <div class="item">
    <img alt="Miniature" src="${this.API}/public/images/thumbnails/${element.thumbnail}" />
    <h4>${'streamId' in element ? `Émission` : 'type' in element ? `Vidéo` : 'Article'}</h4>
    <h2>${element.title}</h2>
    <p>
      ${
        'streamId' in element
          ? `Durée estimée : ` + (authorization.content as WebradioAuthorization).estimatedDuration
          : 'type' in element
          ? `Durée : ` + (authorization.content as VideoAuthorization).duration + ' — Auteur : ' + element.author
          : 'Auteur : ' + element.author
      }
    </p>
    <a href="${link}">
      <button>Consulter la demande</button>
      <small style="line-height: 1.3; margin-top: 10px">
      <i>Ce lien est direct et permet une connexion automatique à l'espace de gestion des autorisations. Il expire
        dans 2 jours. Passé ce délai, l'utilisation de votre identifiant et mot de passe sera nécessaire pour consulter
        la demande d'autorisation.</i>
    </small>
    </a>
  </div>
  <hr color="#e0e0e0" size="1"><small>Ceci est un message automatique.</small>
</div>
<style>
  @import url(https://fonts.cdnfonts.com/css/bahnschrift);h2,p{margin-top:5px}button,img{width:100%;display:block}button,hr{margin-top:30px}button,img,small{display:block}h4,p,small{color:#505050}*{font-family:Bahnschrift,sans-serif}div.content{max-width:1050px;margin:0 auto;padding:0 25px}h1{font-size:24px;margin-bottom:30px;text-align:center;font-weight:900}div.item{width:60%;margin:0 auto}img{border-radius:5px}h4{font-size:16px;margin-top:15px;margin-bottom:0;font-weight:600}h2{font-size:20px}p{font-size:16px}a{text-decoration:none}button{padding:10px;background-color:#c31718;color:#fff;border:none;outline:0;border-radius:3px;transition:.3s;cursor:pointer}@media screen and (max-width:1000px){div.item{width:100%}}
</style>
`
  }

  private truncate(str: string) {
    return str.length > 25 ? str.substring(0, 50) + '...' : str
  }
}

