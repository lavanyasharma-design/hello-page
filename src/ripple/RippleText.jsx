import { Fragment, cloneElement, isValidElement, useEffect, useRef, useState } from 'react'
import { isRippleEnabled, registerLetters } from './rippleEngine'

function textOf(node) {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement(node)) return textOf(node.props.children)
  return ''
}

function splitText(text, keyPrefix) {
  return text.split(/(\s+)/).map((part, i) => {
    if (part === '') return null
    if (/^\s+$/.test(part)) return part
    return (
      <span className="rd-word" key={`${keyPrefix}-w${i}`}>
        {[...part].map((ch, j) => (
          <span className="rd-letter" key={`${keyPrefix}-w${i}-c${j}`}>
            {ch}
          </span>
        ))}
      </span>
    )
  })
}

function splitChildren(children, keyPrefix) {
  const arr = Array.isArray(children) ? children : [children]
  return arr.map((child, i) => splitNode(child, `${keyPrefix}-${i}`))
}

function splitNode(node, keyPrefix) {
  if (node == null || typeof node === 'boolean') return null
  if (typeof node === 'string' || typeof node === 'number') {
    return <Fragment key={keyPrefix}>{splitText(String(node), keyPrefix)}</Fragment>
  }
  if (isValidElement(node)) {
    if (node.props.children == null) return node
    return cloneElement(
      node,
      { key: node.key ?? keyPrefix },
      splitChildren(node.props.children, keyPrefix),
    )
  }
  return node
}

export default function RippleText({ as: Tag = 'p', children, ...rest }) {
  const containerRef = useRef(null)
  const [enabled] = useState(isRippleEnabled)

  useEffect(() => {
    if (!enabled || !containerRef.current) return undefined
    const letters = Array.from(containerRef.current.querySelectorAll('.rd-letter'))
    return registerLetters(letters)
  }, [enabled])

  if (!enabled) {
    return <Tag {...rest}>{children}</Tag>
  }

  return (
    <Tag ref={containerRef} {...rest}>
      <span className="sr-only">{textOf(children)}</span>
      <span aria-hidden="true">{splitChildren(children, 'rd')}</span>
    </Tag>
  )
}
