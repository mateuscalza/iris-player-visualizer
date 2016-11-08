import React from 'react'
import { style } from 'next/css'
import Icon from 'react-fontawesome'
import throttle from 'throttle-debounce/throttle'
import Button from './button'

export default class Player extends React.Component {
  constructor(props) {
    super(props)

    this.onDataCaller = throttle(props.throttle || 10, this.onData)

    this.state = {
      current: null,
      audio: null,
      context: typeof window !== 'undefined' && new (window.AudioContext || window.webkitAudioContext)(),
      analyser: null,
      source: null,
      playing: false,
      fbcArray: null,
      kill: false,
      progress: 0
    }
  }

  onDataFrame() {
    const { current, playing, analyser, fbcArray, kill } = this.state
    if(!kill && current && playing && analyser && fbcArray && this.props.onData) {
      this.onDataCaller()
    }
    !kill && requestAnimationFrame(this.onDataFrame.bind(this))
  }

  onPlayPauseChange() {
    const { audio } = this.state
    this.setState({
      playing: audio && audio.src && !audio.paused
    })
  }

  onData() {
    const { playing, analyser, fbcArray, frequencyBinCount } = this.state
    analyser.getByteFrequencyData(fbcArray)
    this.props.onData(fbcArray, frequencyBinCount)
  }

  onTimeUpdate(currentTime, duration) {
    this.setState({ progress: currentTime / duration * 100 })
  }

  play() {
    if(this.state.audio && this.state.current) {
      this.state.audio.play()
    }
    this.onPlayPauseChange()
  }

  pause() {
    if(this.state.audio) {
      this.state.audio.pause()
    }
    this.onPlayPauseChange()
  }

  componentDidMount() {
    const { context } = this.state

    const audio = new window.Audio()
    audio.autoplay = false
    audio.crossOrigin = 'anonymous'
    audio.ontimeupdate = () => this.onTimeUpdate(audio.currentTime, audio.duration)

    const source = context.createMediaElementSource(audio)
    const analyser = context.createAnalyser()
    
    analyser.fftSize = this.props.fftSize || 128

    source.connect(analyser)
    analyser.connect(context.destination)

    const fbcArray = new Uint8Array(analyser.frequencyBinCount)

    this.setState({
      fbcArray,
      audio,
      context,
      analyser,
      source,
      frequencyBinCount: analyser.frequencyBinCount,
      kill: false
    }, () => this.onDataFrame())
  }

  componentWillUnmount() {
    this.state.source.disconnect()
    this.state.analyser.disconnect()
    this.state.context.close()

    this.setState({ playing: false, kill: true })

    if(this.state.audio) {
      this.state.audio.pause()
      this.state.audio.src = ''
      this.state.audio.load()
    }

    this.setState({ playing: false })
  }

  updateTime(event) {
    const currentTime = this.state.audio.duration * event.target.value / 100
    if(this.state.audio && this.state.audio.src) {
      this.state.audio.currentTime = currentTime
    }
    this.setState({ progress: event.target.value })
  }

  onSourceChange(current) {
    const { audio, analyser } = this.state
    let { playing } = this.state

    audio.src = current ? current.preview : ''
    if(current) {
      audio.play()
    }
    this.onPlayPauseChange()

    this.setState({ current })
  }

  componentWillReceiveProps({ current }) {
    if(
      (!current && this.state.current !== current)
      ||
      (current && current.preview !== (this.state.current && this.state.current.preview))
    ) {
      this.onSourceChange(current)
    }
  }

  render() {
    const { playing } = this.state

    return (
      <div className={style(styles.container)}>
        { playing 
          ? <Button color={this.props.color} onClick={this.pause.bind(this)}><Icon name='pause' /></Button>
          : <Button color={this.props.color} onClick={this.play.bind(this)}><Icon name='play' /></Button>
        }
        <input onInput={this.updateTime.bind(this)} className={style(styles.progress)} value={this.state.progress} min={0} max={100} type="range"/>
      </div>
    )
  }
}

const styles = {
  container: {
    position: 'absolute',
    top: '-25px',
    display: 'block',
    width: 'calc(100% - 20px)',
    padding: 10,
    backgroundColor: '#95a5a6',
    boxShadow: '0 2px 6px rgba(0,0,0,.2)',
    borderRadius: 4
  },
  progress: {
    float: 'right',
    width: 'calc(100% - 40px)',
    marginTop: 8
  }
}
