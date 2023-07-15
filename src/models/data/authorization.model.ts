export interface Authorization {
  id?: number
  elementType: 'show' | 'video' | 'article' | 'guest'
  elementId: number
  content: WebradioAuthorization | VideoAuthorization | ArticleAuthorization | GuestAuthorization | string
}

export interface WebradioAuthorization {
  title: string
  themes: string
  date: string
  estimatedDuration: number
  inGuests: Guest[]
  outGuests: Guest[]
  synopsis: string
}

export interface VideoAuthorization {
  title: string
  themes: string
  medium: string
  author: string
  duration: number
  inGuests: Guest[]
  outGuests: Guest[]
  synopsis: string
}

export interface ArticleAuthorization {
  title: string
  subject: string
  author: string
  synopsis: string
}

export interface GuestAuthorization {
  name: string | null
  eventType: 'show' | 'video' | string
  date: string
  place: 'au Lycée La Rochefoucauld (75007 PARIS)' | 'en visioconférence' | string
  use: 'diffusés en direct et publiés après montage' | string
  media: 'le Blog, le compte Instagram, la chaîne YouTube, les plateformes de streaming' | string
  limitation?: [{value: string | null, checked: boolean}, {value: string | null, checked: boolean}]
}

interface Guest {
  id: number
  name: string
  status: string
  authorization: boolean
}