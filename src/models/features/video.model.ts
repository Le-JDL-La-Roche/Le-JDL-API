export interface Video {
  id?: number
  title: string
  description: string
  thumbnail: string
  videoId: string
  type: 'youtube' | 'instagram' | ''
  category: 'france' | 'international' | 'culture' | 'sport' | 'science' | 'laroche' | ''
  author: string
  date: string
  status: -2 | 2
}

