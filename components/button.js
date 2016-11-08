import React from 'react'
import css from 'next/css'
import createColor from 'color'

export default ({ children, color = '#7f8c8d', ...props }) => {
  return (
    <button
      style={{
        backgroundColor: color
      }}
      className={style}
      {...props}
    >{children}</button>
  )
}

const style = css({
  padding: '6px 10px 6px',
  fontSize: '14px',
  color: '#ecf0f1',
  border: 'none',
  borderRadius: 4,
  boxShadow: '0 1px 4px rgba(0,0,0,.2)',
  cursor: 'pointer'
})
