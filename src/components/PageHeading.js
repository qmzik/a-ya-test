import React from 'react'

/**
 * @typedef {Object} PageHeadingProps
 * @property {string} eyebrow
 * @property {string} title
 * @property {string} description
 */

/**
 * @param {PageHeadingProps} props
 */
export default function PageHeading({ eyebrow, title, description }) {
  return (
    <section className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  )
}
