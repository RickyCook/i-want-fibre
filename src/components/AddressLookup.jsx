import axios from 'axios'
import React from 'react'

import { MessageLine } from './MessageLine.jsx'
import { StatusLookup } from './StatusLookup.jsx'


export class AddressLookup extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      error: null,
      suggestions: null,
    }
  }
  async componentDidMount() {
    const url = new URL('https://places.nbnco.net.au/places/v1/autocomplete')
    url.searchParams.append('query', this.props.address)
    this._xhr = axios.get(url)

    try {
      const resp = await this._xhr
      this.setState({ suggestions: resp.data.suggestions })
    } catch(error) {
      this.setState({ error })
    }
  }
  componentWillUnmount() {
    //this._xhr.cancel()
  }
  render() {
    const { error, suggestions } = this.state

    if (error) {
      return <MessageLine spinner={ false }>
        { error }
      </MessageLine>
    } else if (suggestions === null) {
      return <MessageLine spinner={ true }>
        Loading addresses
      </MessageLine>
    } else if (suggestions.length === 0) {
      return <MessageLine spinner={ false }>
        No addresses found
      </MessageLine>
    } else {
      return <div>{ suggestions.map(address =>
        <StatusLookup
          key={ address.id }
          id={ address.id }
          formattedAddress={ address.formattedAddress }
        />
      ) }</div>
    }
  }
}
