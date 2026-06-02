import React from 'react'

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean
}

export function Image({ fill, style, ...props }: ImageProps) {
  return (
    <img
      style={fill ? { width: '100%', height: '100%', objectFit: 'cover', ...style } : style}
      {...props}
    />
  )
}
