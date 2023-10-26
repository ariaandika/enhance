import type { enhanceEvent } from "../event"
import type { Enhance } from "../index"

declare global {
  var enhance: Enhance

  /** use this to add custom event */
  interface EnhanceEvent {
    invalidate: { id: string },
    clientNavigate: { url: string },
    preClientNavigate: { url: string },
    exception: unknown
  }
}

