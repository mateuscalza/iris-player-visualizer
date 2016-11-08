import React from 'react'

export default class Draw extends React.Component {
  componentDidMount() {
    this.updateCanvas();
  }

  componentDidUpdate() {
    this.updateCanvas();
  }

  updateCanvas() {
    const { width, height, audioByteFrequencyData, frequencyBinCount } = this.props
    const context = this.canvas.getContext('2d')
    context.clearRect(0, 0, width, height)

    const barWidth = width / frequencyBinCount
    let barHeight, x = 5
    for(let index = 0; index < frequencyBinCount; index++) {
      barHeight = (audioByteFrequencyData[index] / 255) * height
      rect(context, { x: x, y: height - barHeight, width: barWidth, height: barHeight, color: 'rgba(255,255,255,.4)' })
      x += barWidth + Math.max(1, 5 - (audioByteFrequencyData[6] / 256 * 4))
    }
  }

  render() {
    const { width, height, className } = this.props

    return (
      <div className={className}>
        <canvas ref={canvas => this.canvas = canvas} width={width} height={height} />
      </div>
    )
  }
}

function rect(context, { x, y, width, height, color }) {
  context.fillStyle = color
  context.fillRect(x, y, width, height)
}
