export interface WebradioShow {
  id?: number
  title: string
  description: string
  thumbnail: string
  streamId: string
  podcastId?: string
  date: string
  /**
   * ~`-2` Draft – `-2.5` Draft restream~
   * 
   * ~`-1` Wait stream – `-1.5` Wait restream~
   * 
   * ~` 0` Live stream – `0.5` Live restream~
   * 
   * ~` 1` Waiting podcast~
   * 
   * ~` 2` Podcast~
   * 
   * `-2` Draft/Waiting for authorization
   * 
   * `2` Published
   */
  status: -2 | -2.5 | -1 | -1.5 | 0 | 0.5 | 1 | 2
  prompter?: string
}
