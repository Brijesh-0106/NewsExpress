import React, { Component } from 'react'
import NewsItem from './NewsItem'
import loading2 from './loading2.gif'

export class MainNews extends Component {

    // Constructor will be executed before render().
    constructor() {
        // super() necessary for class based component constructor.
        super()
        // Creates a state with this keyword.
        this.state = {
            articles: [],
            loading: false,
            page: 1
        }
    }


    // Function componentDidMount will be executed after render() method, after whole main code.
    async componentDidMount() {
        // Url is craeted and props are sent by app.js
        let urlMain = `https://newsapi.org/v2/top-headlines?country=${this.props.country}&category=${this.props.category}&apiKey=b57993e36b9748e381c44cca8b6c025a&page=1&pageSize=${this.props.pageSize}`;
        // Showing loading until fetches.
        this.setState({ loading: true })
        //setState with this keyword.
        let data = await fetch(urlMain);
        // console.log(data)
        //Fetch() and (json() -=> This will take JSON as input and convert it into JS object) both will return promise so, await will stop execution.
        let parsedData = await data.json();
        // console.log(parsedData) //ParsedData is data in proper manner.
        this.setState({
            articles: parsedData.articles,
            totalResults: parsedData.totalResults,
            loading: false
        });
    }

    // Function handling
    prevClick = async () => {
        let urlMain = `https://newsapi.org/v2/top-headlines?country=${this.props.country}&category=${this.props.category}&apiKey=b57993e36b9748e381c44cca8b6c025a&page=${this.state.page - 1}&pageSize=${this.props.pageSize}`;
        this.setState({ loading: true })
        let data = await fetch(urlMain);
        let parsedData = await data.json(data);
        this.setState({
            articles: parsedData.articles,
            page: this.state.page - 1,
            loading: false
        });
    }

    nextClick = async () => {
        if (!(this.state.page + 1 > Math.ceil(this.state.totalResults / 20))) {
            let urlMain = `https://newsapi.org/v2/top-headlines?country=${this.props.country}&category=${this.props.category}&apiKey=b57993e36b9748e381c44cca8b6c025a&page=${this.state.page + 1}&pageSize=${this.props.pageSize}`;
            this.setState({ loading: true })
            let data = await fetch(urlMain);
            let parsedData = await data.json(data);
            this.setState({
                articles: parsedData.articles,
                page: this.state.page + 1,
                loading: false
            });
        }
    }

    render() {
        return (
            <div className='container my-4'>
                <h1 className='text-center'>Welcome to NewsDaily</h1>
                {this.state.loading && <div className='text-center'>
                    <img src={loading2} alt="" />
                </div>}
                <div className="row">
                    {       //this bracket is used for javascript access.
                        !this.state.loading && this.state.articles.map((element) => {
                            return <div className="col-md-4" key={element.url}>
                                <NewsItem title={element.title ? element.title.slice(0, 44) : ""} detail={element.description ? element.description.slice(0, 88) : ""} imageUrl={element.urlToImage} more={element.url} />
                            </div>
                        })
                    }
                </div>
                <div className="container d-flex justify-content-between">
                    <button disabled={this.state.page <= 1} type="button" className="btn btn-primary" onClick={this.prevClick}>&larr; Previous</button>
                    <button disabled={this.state.page + 1 > Math.ceil(this.state.totalResults / 20)} type="button" className="btn btn-primary" onClick={this.nextClick}>Next &rarr;</button>
                </div>
            </div >
        )
    }
}

export default MainNews