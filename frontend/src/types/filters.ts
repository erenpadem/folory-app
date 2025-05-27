export type Filters = {
    status: string
    sort: string
    minChapters: number
    maxChapters: number
    minLikes: number
    maxLikes: number
    completedOnly: boolean
    recentlyUpdated: boolean
  }
  
  export type StatusOption = {
    value: string
    label: string
  }