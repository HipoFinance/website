// /faq/ deep links: the shared <details> anchor behaviour plus the map of anchors retired by the
// 67 → 40 restructure (specs/faq-restructure.md).
import { installDetailsAnchors } from './details-anchors'
import { FAQ_ANCHOR_ALIASES } from '../components/faqAnchorAliases'

installDetailsAnchors(FAQ_ANCHOR_ALIASES)
