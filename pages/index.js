import React from 'react'
import Dropzone from 'react-dropzone'
import Head from 'next/head'
import { style, insertRule } from 'next/css'
import Icon from 'react-fontawesome'
import Button from '../components/button'
import Player from '../components/player'
import LineIn from '../components/lineIn'
import Playlist from '../components/playlist'
import Draw from '../components/draw'
import presets from '../config/presets'

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.onResizeBinded = this.onResize.bind(this)

    this.state = {
      mode: 'lineIn',
      current: null,
      color: '#2c3e50',
      playlist: [],
      stage: {},
      audioByteFrequencyData: null,
      frequencyBinCount: null,
      preset: presets[0]
    }
  }

  onResize() {
    this.setState({ stage: {
      width: window.innerWidth,
      height: window.innerHeight / 2
    }})
  }

  componentDidMount() {
    this.onResize()
    window.addEventListener('resize', this.onResizeBinded)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResizeBinded)
  }

  onSelect(index) {
    this.setState({
      current: Object.assign({ index }, this.state.playlist[index])
    })
  }

  onRemove(index) {
    this.state.playlist.splice(index, 1)
    this.setState({
      current: null,
      playlist: this.state.playlist
    })
  }

  onUpdateMode(mode) {
    this.setState({ mode, current: null })
  }

  onUpdatePreset(preset) {
    this.setState({ preset })
  }

  onAudioData(audioByteFrequencyData, frequencyBinCount) {
    const rgb = middleIndexes(frequencyBinCount, 3).map(index => {
      return Math.min(255, nearDivisible(audioByteFrequencyData[index], this.state.preset.gap))
    })

    this.setState({
      audioByteFrequencyData,
      frequencyBinCount,
      color: `rgb(${rgb[this.state.preset.red] || 0},${rgb[this.state.preset.green] || 0},${rgb[this.state.preset.blue] || 0})`
    })
  }

  onDrop(files) {
    this.setState({
      playlist: this.state.playlist.concat(
        files
          .map(file => {
            const name = file.name.replace(/\.mp3$/, '')

            return {
              ...file,
              name,
              shortName: name.length > 40 ? name.substr(0, 40) + '...' : name
            }
          })
      )
    })
  }

  render() {
    const { color, current } = this.state

    return (
      <div className={style(styles.root)} style={{ backgroundColor: color }}>
        <Head>
          <title>{ current ? `${current.name} - Iris Player and Visualizer` : 'Iris Player and Visualizer' }</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <link rel="stylesheet" type="text/css" href="/static/css/font-awesome.min.css" />
        </Head>

        <div className={style(styles.modeSelector)}>
          <Button onClick={() => this.onUpdateMode('lineIn')}><Icon name='plug' /> Line-In</Button>
          <span> </span>
          <Button onClick={() => this.onUpdateMode('player')}><Icon name='music' /> Player</Button>
        </div>

        <div className={style(styles.presetSelector)}>
          <select onChange={event => this.onUpdatePreset(presets[parseInt(event.target.value)])}>
            { presets.map((preset, index) => <option key={index} value={index}>{preset.name}</option>) }
          </select>
        </div>
        {
          {
            player: (
              <Dropzone
                className={style(styles.dropzone).toString()}
                accept='audio/mp3'
                onDrop={this.onDrop.bind(this)}
                disableClick
              >
                <div className={style(styles.content)}>
                  <Player current={current} onData={this.onAudioData.bind(this)} color={color} />
                  <Playlist
                    items={this.state.playlist}
                    current={current}
                    onSelect={this.onSelect.bind(this)}
                    onRemove={this.onRemove.bind(this)}
                    color={color}
                  />
                </div>
              </Dropzone>
            ),
            lineIn: (
              <LineIn onData={this.onAudioData.bind(this)} />
            )
          }[this.state.mode]
        }
        
        <Draw
          className={style(styles.draw)}
          width={this.state.stage.width}
          height={this.state.stage.height}
          audioByteFrequencyData={this.state.audioByteFrequencyData}
          frequencyBinCount={this.state.frequencyBinCount}
        />
      </div>
    )
  }
}

const styles = {
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    minHeight: '100%'
  },
  modeSelector: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 4
  },
  presetSelector: {
    position: 'absolute',
    top: 5,
    left: 5,
    zIndex: 4
  },
  dropzone: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    minHeight: '100%',
    zIndex: 3,
    padding: 70
  },
  draw: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 2,
  },
  content: {
    position: 'relative',
    width: '100%',
    maxWidth: 500,
    margin: '0 auto',
    padding: '40px 10px 10px',
    color: '#95a5a6',
    background: '#fff',
    boxShadow: '0 2px 6px rgba(0,0,0,.4)',
    borderRadius: 4
  }
}

function middleIndexes(from, to) {
  const parts = from / (to + 1)
  let indexes = []

  let total = parts
  while(total < from) {
    indexes[indexes.length] = parseInt(total)
    total += parts
  }

  return indexes
}

function nearDivisible(number, to) {
  return Math.ceil(number / to) * to
}

insertRule(`

body {
  font-family: sans-serif
}

*,
*:before,
*:after {
  box-sizing: border-box
}

`)
