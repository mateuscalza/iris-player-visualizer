import React from 'react'
import { style } from 'next/css'
import Button from './button'
import Icon from 'react-fontawesome'

export default ({ items, current, onSelect, color, onRemove }) => (
  <div className={style(styles.container)}>
    { items.length ? '' : <em>Drop some musics (mp3) here</em> }
    <table className={style(styles.table)}>
      <tbody>
        {
          items
            .map((item, index) => (
              <tr key={index} title={item.name}>
                <td
                  className={style([styles.column, styles.nameColumn])}
                  onClick={() => onSelect(index)}
                >
                  { current && current.index === index && <span><Icon name='play' /> </span> }
                  {item.shortName}
                </td>
                <td className={style([styles.column, styles.actionColumn])}>
                  <Button color={color} onClick={() => onSelect(index)}><Icon name='play' /></Button>
                  <span> </span>
                  <Button color={color} onClick={() => onRemove(index)}><Icon name='remove' /></Button>
                </td>
              </tr>
            ))
        }
      </tbody>
    </table>
  </div>
)

const styles = {
  container: {
    width: '100%',
    marginTop: 20
  },
  table: {
    width: '100%'
  },
  column: {
    padding: '5px 0'
  },
  nameColumn: {
    cursor: 'pointer'
  },
  actionColumn: {
    textAlign: 'right'
  }
}
