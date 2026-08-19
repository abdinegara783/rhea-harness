// RHEA brand wordmark: "RHEA" text + "QC" badge plate.
// Replaces the original DeepSeek Harness whale + wordmark SVG.

import type { IconProps } from './icons/props.ts'

/**
 * Render the RHEA brand wordmark.
 * @param props.size - height in px (default 24; width scales proportionally).
 * @param props.className - extra class for layout placement.
 * @returns the wordmark svg (aria-hidden decorative brand art).
 */
export function BrandWordmark({ size = 24, className }: IconProps) {
  return (
    <svg
      width={(size * 120) / 24}
      height={size}
      className={className}
      viewBox="0 0 120 24"
      fill="none"
      aria-hidden="true"
    >
      {/* R */}
      <path d="M2 4H8.5C10.5 4 12 4.5 13 5.5C14 6.5 14.5 7.8 14.5 9.4C14.5 11 14 12.2 13 13.1C12 14 10.5 14.5 8.5 14.5H6V20H2V4ZM6 11.5H8C9 11.5 9.7 11.2 10.2 10.6C10.7 10 11 9.2 11 8.2C11 7.2 10.7 6.4 10.2 5.9C9.7 5.4 9 5.1 8 5.1H6V11.5Z" fill="currentColor"/>
      {/* H */}
      <path d="M18 4H22V10.5H29V4H33V20H29V14H22V20H18V4Z" fill="currentColor"/>
      {/* E */}
      <path d="M37 4H50V7.5H41V10H48V13.5H41V16.5H50V20H37V4Z" fill="currentColor"/>
      {/* A */}
      <path d="M58 4H62.5L69 20H65L63.8 17H56.7L55.5 20H51.5L58 4ZM57.8 14H62.7L60.3 7.5H60.2L57.8 14Z" fill="currentColor"/>
      {/* QC badge */}
      <rect x="74" y="5.5" width="44" height="14" rx="2" fill="currentColor"/>
      <g clipPath="url(#rhea-badge-clip)">
        {/* Q */}
        <path d="M80 12.5C80 10.5 80.5 9 81.5 8C82.5 7 83.8 6.5 85.5 6.5C87.2 6.5 88.5 7 89.5 8C90.5 9 91 10.5 91 12.5C91 14.5 90.5 16 89.5 17C88.5 18 87.2 18.5 85.5 18.5C83.8 18.5 82.5 18 81.5 17C80.5 16 80 14.5 80 12.5ZM84 12.5C84 13.8 84.2 14.8 84.7 15.5C85.2 16.2 85.8 16.5 86.5 16.5C87.2 16.5 87.8 16.2 88.3 15.5C88.8 14.8 89 13.8 89 12.5C89 11.2 88.8 10.2 88.3 9.5C87.8 8.8 87.2 8.5 86.5 8.5C85.8 8.5 85.2 8.8 84.7 9.5C84.2 10.2 84 11.2 84 12.5Z" fill="var(--dsw-alias-label-primary-inverted)"/>
        <path d="M88 16L90 18.5H88.5L87 16.5L88 16Z" fill="var(--dsw-alias-label-primary-inverted)"/>
        {/* C */}
        <path d="M95 12.5C95 10.5 95.5 9 96.5 8C97.5 7 98.8 6.5 100.5 6.5C102.2 6.5 103.5 7 104.5 8C105.5 9 106 10.5 106 12.5H103C103 11.2 102.8 10.2 102.3 9.5C101.8 8.8 101.2 8.5 100.5 8.5C99.8 8.5 99.2 8.8 98.7 9.5C98.2 10.2 98 11.2 98 12.5C98 13.8 98.2 14.8 98.7 15.5C99.2 16.2 99.8 16.5 100.5 16.5C101.2 16.5 101.8 16.2 102.3 15.5C102.8 14.8 103 13.8 103 12.5H106C106 14.5 105.5 16 104.5 17C103.5 18 102.2 18.5 100.5 18.5C98.8 18.5 97.5 18 96.5 17C95.5 16 95 14.5 95 12.5Z" fill="var(--dsw-alias-label-primary-inverted)"/>
      </g>
      <defs>
        <clipPath id="rhea-badge-clip">
          <rect width="30" height="14" fill="white" transform="translate(78 5.5)"/>
        </clipPath>
      </defs>
    </svg>
  )
}
