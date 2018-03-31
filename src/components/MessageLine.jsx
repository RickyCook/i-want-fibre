import React from 'react'


export class MessageLine extends React.PureComponent {
  render() {
    return <div className="iwf-message">
      { this.props.spinner ?
          <div className="sk-spinner sk-spinner-pulse"></div> :
          null
      }
      <div className="iwf-message-text">
        { this.props.children }
      </div>
    </div>
  }
}
