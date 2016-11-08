import React from 'react'
import { style } from 'next/css'
import throttle from 'throttle-debounce/throttle'

export default class Player extends React.Component {
  constructor(props) {
    super(props)

    this.onDataCaller = throttle(props.throttle || 10, this.onData)

    this.state = {
      stream: null,
      context: typeof window !== 'undefined' && new (window.AudioContext || window.webkitAudioContext)(),
      analyser: null,
      source: null,
      fbcArray: null,
      kill: false,
      message: false
    }
  }

  onDataFrame() {
    const { current, playing, analyser, fbcArray, kill } = this.state

    if(!kill && analyser && fbcArray && this.props.onData) {
      this.onDataCaller()
    }
    !kill && requestAnimationFrame(this.onDataFrame.bind(this))
  }

  onData() {
    const { playing, analyser, fbcArray, frequencyBinCount } = this.state
    analyser.getByteFrequencyData(fbcArray)
    this.props.onData(fbcArray, frequencyBinCount)
  }

  componentDidMount() {
    const { context } = this.state

    navigator.getUserMedia({ audio: true }, (stream) => {
      const source = context.createMediaStreamSource(stream)
      const analyser = context.createAnalyser()
      
      analyser.fftSize = this.props.fftSize || 128

      source.connect(analyser)
      // Uncomment to send input to output
      // analyser.connect(context.destination)

      const fbcArray = new Uint8Array(analyser.frequencyBinCount)

      this.setState({
        stream,
        fbcArray,
        context,
        analyser,
        source,
        frequencyBinCount: analyser.frequencyBinCount,
        message: true,
        kill: false
      }, () => {
        this.onDataFrame()
        setTimeout(() => !this.state.kill && this.setState({ message: false }), 5000)
      })
    }, error => console.log('The following error occured: ' + error))
  }

  componentWillUnmount() {
    this.state.source.disconnect()
    this.state.analyser.disconnect()
    this.state.context.close()
    this.setState({ kill: true })
  }

  render() {
    return (
      <div className={style(styles.container)}>
        <span className={style(styles.message)} style={{ opacity: this.state.message ? 1 : 0 }}>
          Tip: If want to use Spotify or similar, you can use <a href='https://www.rogueamoeba.com/loopback/' target='_blank'>Loopback</a>
        </span>
      </div>
    )
  }
}

const styles = {
  container: {
    width: '100%',
    marginTop: 200,
    padding: 20,
    textAlign: 'center'
  },
  message: {
    color: '#fff',
    textShadow: '0 1px 3px rgba(0,0,0,.4)',
    transition: 'opacity ease .5s'
  }
}
