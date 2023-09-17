// Export component using {rce} and {rcc} for basic component.
import React, { Component } from 'react'   
import NavBar from './components/NavBar';
// Mainnews contains newsitems map function.
import MainNews from './components/MainNews';
// For routing purpose.
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


export default class App extends Component {
  render() {
    return (
      <div>
        <Router>
          {/* navbar component */}
          <NavBar />
          {/* mainnews component */}
          <Routes>
            {/* For routing they only changed category */}
            <Route path='/' element={<MainNews key='general' pageSize={12} country='in' category='general' />}></Route>
            {/* key is used to differentiate same MainNews components */}
            <Route path='/business' element={<MainNews key='business' pageSize={12} country='in' category='business' />}></Route>
            <Route path='/entertainment' element={<MainNews key='entertainment' pageSize={12} country='in' category='entertainment' />}></Route>
            <Route path='/health' element={<MainNews key='health' pageSize={12} country='in' category='health' />}></Route>
            <Route path='/science' element={<MainNews key='science' pageSize={12} country='in' category='science' />}></Route>
            <Route path='/sports' element={<MainNews key='sports' pageSize={12} country='in' category='sports' />}></Route>
            <Route path='/technology' element={<MainNews key='technology' pageSize={12} country='in' category='technology' />}></Route>
          </Routes>
        </Router>
      </div>
    )
  }
}