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
const h = 600
const padding = 100

function App() {
  const [menuId, setMenuId] = useState(0)

  const [movieData, setMovieData] = useState([])
  const [videoGameData, setVideoGameData] = useState([])
  const [kickstarterPledgesData, setKickstarterPledgesData] = useState([])

  const pickUpColor = (category, categories) => {
    const indexOfCategory = categories.indexOf(category)
    // console.log("Categories in pickUpColor function: ", categories)
    // console.log("Category in pickUpColor function: ", category)
    const colors = ["Blue ", "Green", "Red", "Orange", "Violet", "Indigo", "Yellow "]
    const color = colors[indexOfCategory % colors.length]
    // console.log("Color in pickUpColor function: ", colors)
    // console.log("Color in pickUpColor function: ", color)
    return color
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
      console.log('Leave nodes in hierarchy: ', hierarchy.leaves())
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
        .attr('stroke-width', '2px')
        .attr('stroke', 'white')


      g.append('text')
        .text(leaveNode => leaveNode.data.name)
        .attr('x', '5')
        .attr('y', '20')

      const legend = svg.append('g')
        .attr('transform', `translate(${2 * padding}, ${h - padding})`)
        .append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', 'blue')
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
