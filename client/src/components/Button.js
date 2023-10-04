import React from 'react'

const Button = ({ title, onClick, variant, disable, fullWidth, type }) => {

    let className = 'bg-primary p-1 text-white';

    if( fullWidth ) {
        className += ' w-full'
    }

    if(variant === 'outlined') {
        className = className.replace('bg-primary', 'border border-primary text-primary bg-white')
    }

  return (
    <button className={className} type={type} >{title}</button>
  )
}

export default Button