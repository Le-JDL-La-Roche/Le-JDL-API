export interface Authorization {
  id?: number
  elementType: 'show' | 'video' | 'article'
  elementId: number
  content: WebradioAuthorization | VideoAuthorization | ArticleAuthorization | string
}

export interface WebradioAuthorization {
  title: string
  subject: string
  date: string
  estimatedDuration: string
  inGuests: { name: string; status: string; authorization: boolean }[]
  outGuests: Guest[]
  synopsis: string
}

export interface VideoAuthorization {
  title: string
  subject: string
  medium: string
  author: string
  duration: number
  inGuests: { name: string; status: string; authorization: boolean }[]
  outGuests: Guest[]
  synopsis: string
}

export interface ArticleAuthorization {
  title: string
  subject: string
  author: string
  synopsis: string
}

export interface Guest {
  name: string | null
  status: string
  authorization: boolean
  eventType: "l'émission de radio" | "l'enregistrement vidéo" | string
  date: string
  place: 'au Lycée La Rochefoucauld (75007 PARIS)' | 'en visioconférence' | string
  use: 'diffusés en direct et publiés après montage' | string
  media: 'le Blog, le compte Instagram, la chaîne YouTube, les plateformes de streaming' | string
}