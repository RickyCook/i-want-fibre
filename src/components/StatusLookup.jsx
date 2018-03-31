import axios from 'axios'
import React from 'react'

import { MessageLine } from './MessageLine.jsx'


export class StatusLookup extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      error: null,
      data: null,
    }
  }
  async componentDidMount() {
    const url = new URL(`https://places.nbnco.net.au/places/v1/details/${this.props.id}`)
    url.searchParams.append('query', this.props.address)
    this._xhr = axios.get(url)

    try {
      const resp = await this._xhr
      this.setState({ data: resp.data })
    } catch(error) {
      this.setState({ error })
    }
  }
  componentWillUnmount() {
    //this._xhr.cancel()
  }
  render() {
    const { error, data } = this.state

    if (error) {
      return <MessageLine spinner={ false }>
        { error }
      </MessageLine>
    } else if (data === null) {
      return <MessageLine spinner={ true }>
        { this.props.formattedAddress }
      </MessageLine>
    } else {
      const { addressDetail: detail } = data

      const techTypeSuffix = (detail.techType || 'null').toLowerCase()
      const techTypeClass = `iwf-techtype-${techTypeSuffix}`
      const serviceStatusClass = `iwf-status-${detail.serviceStatus}`

      return <div style={{ paddingBottom: '0.75em' }}>
        <div className="iwf-complete-address">
          { detail.formattedAddress }
        </div>
        <div>
          <span className={ `${techTypeClass} iwf-tag` }>
            { detail.techType }
          </span> is <span className={ `${serviceStatusClass} iwf-tag` }>
            { detail.serviceStatus.replace(/_/g, ' ') }
          </span>
          { detail.rfsMessage ? ` (${detail.rfsMessage})` : '' }
        </div>
      </div>
    }
  }
}

