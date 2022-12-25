import { useEffect, useRef, useState } from 'react';
import './App.css';
import * as d3 from 'd3'

const movieDataURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"
const videoGameDataURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"
const kickstarterPledgesDataURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json"
const menuArray = [
    {
      title: 'Video Game Sales',
      description: 'Top 100 Most Sold Video Games Grouped by Platform'
    }, 
    {
      title: 'Movie Sales',
      description: 'Top 100 Highest Grossing Movies Grouped By Genre'
      
    }, 
    {
      title: 'Kickstarter Pledges',
      description: 'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category'
      
    }
  ]
const w = 1000
const h = 800
const padding = 200
const legendEdge = 20
const legendMaxRows = 4
const legendInterval = 200
const textIndent = 23
function App() {
  const [menuId, setMenuId] = useState(1)

  const [movieData, setMovieData] = useState([])
  const [videoGameData, setVideoGameData] = useState([])
  const [kickstarterPledgesData, setKickstarterPledgesData] = useState([])

  const pickUpColor = (category, categories) => {
    const indexOfCategory = categories.indexOf(category)
    // console.log("Categories in pickUpColor function: ", categories)
    // console.log("Category in pickUpColor function: ", category)
    const colors = ["#fd7f6f", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#beb9db", "#fdcce5", "#8bd3c7"]
    const color = colors[indexOfCategory % colors.length]
    // console.log("Color in pickUpColor function: ", colors)
    // console.log("Color in pickUpColor function: ", color)
    return color
  }

  // Gets a string, splits it into array of words, 
  // then for each word in array makes a new string, 
  // which wraps words in <tspan> tags.
  // It is for displaying each word on a new string 
  // in treemap block. In case word's length is less then 
  // 3 characters it doesn’t makes a new string and adds 
  // a short word to the previous <tspan> tag.
  // For not create in an empty string it uses 
  // spacer value. The spacer increases to decrease 
  // count of strings for displaying. 

  const addSpan = textIn => {
    const words = textIn.split(' ')
    let textOut = ''
    const shortWordLength = 3
    const xPadding = 5
    const yPadding = 10
    const lineSpacing = 8
    let spacer = 0 
    for (let index = 0; index < words.length; index++) {
      if(words[index].length < shortWordLength) { 
        const openedTextOut = textOut.substr(0, textOut.length - 8)
        const addWord = words[index]
        textOut = `${openedTextOut} ${addWord}</tspan>`
        spacer++ 
      }
      else {
        textOut = `${textOut}<tspan x='${xPadding}' y='${(index - spacer) * lineSpacing + yPadding}'>${words[index]}</tspan>`
      }
    }
    console.log('textOut value in addSpan function: ', textOut)
    return textOut
  }
        





  const svgRef = useRef(null)

  useEffect(() => {
    d3.json(movieDataURL).then(
      (data, error) => {
        if(error) console.log(error)
        else { 
          // console.log('Movie data after fetching: ', data)
          setMovieData(data)
        }
      }
    )

    d3.json(videoGameDataURL).then(
      (data, error) => {
        if(error) console.log(error)
        else {
          // console.log('Video game data after fetching: ', data)
          setVideoGameData(data)
        }
      }
    )
    
    d3.json(kickstarterPledgesDataURL).then(
      (data, error) => {
        if(error) console.log(error)
        else {
          // console.log('Kickstarter pladges data after fetching: ', data)
          setKickstarterPledgesData(data)
        }
      }
    )
    return () => {}
  }, [])


  useEffect(() => {
    
    if(movieData.length !== 0 && videoGameData.length !== 0 && kickstarterPledgesData.length !== 0) {
      // console.log('Data fatching complete')
      // console.log('Movie data in main useEffect hook: ', movieData)
      // console.log('Video game data in main useEffect hook: ', videoGameData)
      // console.log('Kickstarter pladges data in main useEffect hook: ', kickstarterPledgesData)
   
      const svg = d3.select(svgRef.current)
                    .attr('width', w)
                    .attr('height', h)

      const data = [movieData, videoGameData, kickstarterPledgesData][menuId]
      const hierarchy = d3.hierarchy(data, node => node.children)
        .sum(node => node.value)
        .sort((node1, node2) => node2.value - node1.value)
      // console.log("Data ", data.name, " in d3 hierarchy after creation: ", hierarchy)
         
      const categories = [...new Set(data.children.map(element => element.name))]
      // console.log("Categories array before using 3d: ", categories)
      const createTreeMap = d3.treemap()
        .size([w - padding, h - padding])
      
      createTreeMap(hierarchy)
      // console.log('Leave nodes in hierarchy: ', hierarchy.leaves())
      const g = svg.selectAll('g')
        .data(hierarchy.leaves())
        .enter()
        .append('g')
        .attr('transform', leaveNode => `translate(${leaveNode.x0}, ${leaveNode.y0})`)

      g.append('rect')
        .attr('class', 'tile')
        .attr('fill', leaveNode => pickUpColor(leaveNode.data.category, categories))
        .attr('data-name', leaveNode => leaveNode.data.name)
        .attr('data-category', leaveNode => leaveNode.data.category) 
        .attr('data-value', leaveNode => leaveNode.data.value)
        .attr('width', leaveNode => leaveNode.x1 - leaveNode.x0)
        .attr('height', leaveNode => leaveNode.y1 - leaveNode.y0)
        .attr('stroke-width', '1px')
        .attr('stroke', 'white')


      g.append('text')
        .style("font-size", "10px")
        .attr('x', '5')
        .attr('y', '20')
        .html(leaveNode => addSpan(leaveNode.data.name))

      const legend = svg.append('g')
        .attr('transform', `translate(0, ${h - padding + 20})`)
        .attr('id', 'legend')
        .selectAll('rect')
        .data(hierarchy.data.children)
        .enter()
        .append('g')
      
      legend.append('rect')
        .attr('class', 'legend-item')
        .attr('width', legendEdge)
        .attr('height', legendEdge)
        .attr('x', (ganre, index) => Math.floor(index / legendMaxRows) * legendInterval + legendEdge)
        .attr('y', (ganre, index) => (index % legendMaxRows) * (legendEdge + 5))
        .attr('fill', child => pickUpColor(child.name, categories))
        .attr('stroke', 'black')
      
      legend.append('text')
        .text(child => child.name)
        .attr('x', (ganre, index) => Math.floor(index / legendMaxRows) * legendInterval + legendEdge + textIndent)
        .attr('y', (ganre, index) => (index % legendMaxRows) * (legendEdge + 5) + 14)
    }
  
    return () => {}
  }, [movieData, videoGameData, kickstarterPledgesData, menuId])
  
  
  
  
  const menuHandler = event => {
    // console.log("Menu handler event is: ", event)
    setMenuId(event.target.id)
  }
  return (
    <div className="App">
      <header>
        <h4><button id="0" onClick={menuHandler}>Video Game Data Set</button> | <button id="1" onClick={menuHandler}>Movies Data Set</button> | <button id="2" onClick={menuHandler}>Kickstarter Data Set</button></h4>
      </header>
      <main>
        <h1 id="title">{menuArray[menuId].title}</h1>
        <h3 id="description">{menuArray[menuId].description}</h3>
        <svg ref={svgRef}></svg>
      </main>
      <footer>This project was developed by iUsup Magomedov as a FCC D3 certification project</footer>
    </div>
  );
}

export default App;
