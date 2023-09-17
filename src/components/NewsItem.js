// Export component using {rce} and {rcc} for basic component.
import React, { Component } from 'react'

export class NewsItem extends Component {
    render() {
        // Accessing variables from props by deformatting.
        return (
            <div className='my-4'>
                <div className="card">
                    <img src={!this.props.imageUrl ? "https://staticc.sportskeeda.com/editor/2023/04/d772f-16807149943597-1920.jpg" : this.props.imageUrl} className="card-img-top" alt="NewsImage" />
                    <div className="card-body">
                        <h5 className="card-title">{this.props.title}...</h5>
                        <p className="card-text">{this.props.detail}...</p>
                        <a href={this.props.more} target='_blank' className="btn btn-sm btn-dark" rel="noreferrer">Read More</a>
                    </div>
                </div>
            </div>
        )
    }
}

export default NewsItem