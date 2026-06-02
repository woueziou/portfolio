import type React from 'react'

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean
}

export function Image({ fill, style, loading = 'lazy', ...props }: ImageProps) {
  return (
    // biome-ignore lint/a11y/useAltText: alt is spread via ...props
    <img
      loading={loading}
      style={fill ? { width: '100%', height: '100%', objectFit: 'cover', ...style } : style}
      {...props}
    />
  )
}
