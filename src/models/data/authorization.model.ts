import { Article } from "$models/features/article.model"
import { Video } from "$models/features/video.model"
import { WebradioShow } from "$models/features/webradio-show.model"

export interface Authorization {
  id?: number
  elementType: 'show' | 'video' | 'article'
  elementId: number
  content: WebradioAuthorization | VideoAuthorization | ArticleAuthorization | string
  submitDate?: string
  /**
   * `-2` Draft
   *
   * `-1` Waiting for authorization
   *
   * ` 1` Refused
   *
   * ` 2` Accepted
   */
  status: -2 | -1 | 1 | 2
  manager?: string
  comments?: string
  responseDate?: string
  signature?: string
}

export interface WebradioAuthorization {
  subject: string
  date: string
  estimatedDuration: string
  inGuests: Guest[]
  outGuests: Guest[]
  synopsis: string
  link: string
}

export interface VideoAuthorization {
  subject: string
  duration: string
  inGuests: Guest[]
  outGuests: Guest[]
  synopsis: string
  link: string
}

export interface ArticleAuthorization {
  subject: string
  author: string
  synopsis: string
}

export interface Guest {
  name: string | null
  status: string
  authorization: boolean
  authorizationType: 'M' | 'm' | false
  eventType: "l'émission de radio" | "l'enregistrement vidéo" | string
  date: string
  place: 'au Lycée La Rochefoucauld (75007 PARIS)' | 'en visioconférence' | string
  use: 'diffusés en direct et publiés après montage' | string
  media: 'le site Web, le compte Instagram, la chaîne YouTube, les plateformes de streaming' | string
}

