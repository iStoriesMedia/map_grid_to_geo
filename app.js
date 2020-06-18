function drawGridMap(dataset) {
  
  let caption = svg.append('g').append('text').attr('class', 'caption')
        .text('«Важные истории»')
  let source =  svg.append('g').append('text').attr('class', 'source')
        .text('Данные: Территориальные схемы ТКО, местные органы власти и СМИ');
  let regions = [];

  let width, height, cellSize, regionGroup, text;

  let region = svg.append("g");
  
  svg.append('g')
      .attr('class', 'legend')

  d3.select("#grid").text().split("\n").forEach(function(line, i) {
    
    let re = /[\wа-я]+/ig;
    let array1;

    while (array1 = re.exec(line)) regions.push({
      name: array1[0],
      x: array1.index / 5,
      y: i
    })
  });

  for (let i = 0; i < dataset.length; i++){
     let datasetName = dataset[i].short_name;
     for (let j = 0; j < regions.length; j++){
       let regionName = regions[j].name;
       if (regionName == datasetName){
        regions[j]['tariff'] = +dataset[i].garbage_tariff;
        regions[j]['full_name'] = dataset[i].full_name;
       }
    }
  };
  let gridWidth = d3.max(regions, function(d) { return d.x; }) + 1,
      gridHeight = d3.max(regions, function(d) { return d.y; }) + 1;


    regionGroup = region.selectAll(null)
          .data(regions)
          .enter()
          .append('g')
          .attr("class", function(d){ return 'region ' + d.name})
          .append('rect')
          .attr('fill', function(d){
            if (d.tariff == 0){
              return '#262626';
            }
            return color(d.tariff)
          })
          .on('mouseover', (d,i,n) =>{
            mouseover(d, n[i]);
          })
          .on('mouseleave', function(){
            tooltip
              .transition()
              .duration(200)
              .style('opacity', 0)
          })

    regionGroup.attr("transform", function(d) { 
    console.log(d.x, d.y)
                        return "translate(" + (d.x - gridWidth / 2) * cellSize + "," + (d.y - gridHeight / 2) * cellSize + ")"; })
                    .attr("x", -cellSize / 2)
                    .attr("y", -cellSize / 2)
                    .attr("width", cellSize - 1)
                    .attr("height", cellSize - 1);
    text = region.selectAll('g')
                    .append('text')
                    .attr('class', 'regionName')
                    .attr('text-anchor', 'middle')
                    .text(function(d){
                      return d.name;
                    })
                    .on('mouseover', (d,i,n) =>{
                      mouseover(d, n[i]);
                    })
                    .on('mouseleave', function(){
                      tooltip
                        .transition()
                        .duration(200)
                        .style('opacity', 0)
                    });

                  
  function resize(){
    
    let bounds = d3.select('#viz').node().getBoundingClientRect();
    width = bounds.width;
    height = width/2;
    cellSize = width * 0.044;

    svg
      .attr('width', width)
      .attr('height', height)

    region.attr("transform", `translate(${width/2}, ${height/2})`);

    regionGroup.attr("transform", function(d) { 
            return "translate(" + (d.x - gridWidth / 2) * cellSize + "," + (d.y - gridHeight / 2) * cellSize + ")"; })
        .attr("x", -cellSize / 2)
        .attr("y", -cellSize / 2)
        .attr("width", cellSize - 1)
        .attr("height", cellSize - 1);

    text
        .attr("transform", function(d) { 
            return "translate(" + (d.x - gridWidth / 2) * cellSize + "," + (d.y - gridHeight / 2) * cellSize + ")"; })
    
    legend.shapeWidth(cellSize);
    legend.shapeHeight(cellSize/2);
    
    
    
    svg.select(".legend")
            .attr("transform", `translate(${width - cellSize*10},${height - cellSize*3.2})`)
            .call(legend);
    svg.selectAll('.label')
            .attr('y', -3)

    d3.select('.caption')
            .attr("transform", `translate(${cellSize/2},${height - cellSize})`)
    d3.select('.source')
            .attr("transform", `translate(${cellSize/2},${height - cellSize/1.5})`)
  };
  d3.select(window).on('resize', resize);
  resize()
};


function drawGeo(dataMap){
  let caption = svg.append('g').append('text').attr('class', 'caption')
        .text('«Важные истории»')
  let source =  svg.append('g').append('text').attr('class', 'source')
        .text('Данные: Территориальные схемы ТКО, местные органы власти и СМИ');
  let projection = d3.geoAlbers()
                .rotate([-105, 0])
                .center([-10, 65])
                .parallels([52, 64]);
        
  let path = d3.geoPath();
    
    svg.append('g')
          .attr('class', 'legend')
          
  svg.append('g')
                .selectAll('path')
                .data(topojson.feature(dataMap, dataMap.objects.rus_regions_simpl).features)
                .enter()
                .append('path')
                .attr('d', path)
                .attr('class', 'region')
                .attr('fill', function(d){
                    if (d.properties.tariff == 0){
                      return '#262626';
                    }
                    return color(d.properties.tariff);
                })
                .on('mouseover', (d,i,n) =>{
                  mouseover(d, n[i]);
                })
                .on('mouseleave', function(){
                  tooltip
                    .transition()
                    .duration(200)
                    .style('opacity', 0)
                });
  
        svg.append("path")
                .datum(topojson.mesh(dataMap, dataMap.objects.rus_regions_simpl, function(a, b) { return a !== b; }))
                .attr('class', 'mesh')
                .attr("stroke", "white")
                .attr("stroke-width", 0.5)
                .attr("d", path)
                .style('fill', 'none')
  
        d3.select(window).on('resize', resize);
        resize();
  
  function resize(){
       
        let bounds = d3.select('#viz').node().getBoundingClientRect();
        let w = bounds.width;
        let h = w/2;
        let scale = w * 0.66;
        
        svg.attr('width', w).attr('height', h);
  
        projection
                .translate([w/2, h/2])
                .scale(scale)
  
        path.projection(projection);
  
        d3.selectAll('.region')
                .attr('d', path)
        d3.selectAll('.mesh')
                .attr('d', path)
  
        
        legend.shapeWidth(scale * 0.06);
        legend.shapeHeight(scale*0.06/2);
        svg.select(".legend")
                        .attr("transform", `translate(${w - scale*1.5},${h - scale/5.2})`)
                        .call(legend);
        d3.select('.caption')
                        .attr("transform", `translate(${scale*1.18},${h - scale/25})`)
        d3.select('.source')
                        .attr("transform", `translate(${scale*1.18},${h - scale/35})`)
        
    };
  };

let selector = false;

let svg = d3.select('#svgGrid');
  
let tooltip = d3.select('body').append('div')
                  .attr('class', 'tooltip')
                  .style('opacity', 0)

const mouseover = function(d, element){
        console.log(d)
        tooltip
                .transition()
                .duration(200)
                .style('opacity', .8)
                .text(function(){
                  if (selector == false && d.tariff != 0) {
                    return d.full_name + ': ' + d.tariff + ' ' + 'руб.';
                  }
                  if (selector == true && d.properties.tariff != 0) {
                    return d.properties.REGION + ': ' + d.properties.tariff + ' ' + 'руб.';
                  }
                  if (selector == false && d.tariff == 0){
                    return d.full_name + ': тариф еще не определен';
                  }
                  if (selector == true && d.properties.tariff == 0){
                    return d.properties.REGION + ': тариф еще не определен';
                  }
                })
                
                .style('left', function() {
                        let position = d3.event.pageX;
                        let svgWidth = document.getElementById('viz').getBoundingClientRect().width;
                        if(position < svgWidth/2) {
                                return (d3.event.pageX + 15) + 'px';
                        } else {
                          return (d3.event.pageX - 50) + 'px';
                        }
                })
                .style('top', (d3.event.pageY -  30) + 'px')
};

const color = d3.scaleThreshold()
        .range(['#430000', '#650706', '#80201c', '#9b382f', '#b65044', '#d16759', '#ed7f70', '#fd9e8d'].reverse())
        .domain([200, 250, 300, 350, 400, 450, 500]);

const legendLinear = d3.scaleLinear()
        .domain(color.domain())
        .range(color.range());

const legend = d3.legendColor()
        .cells([200, 250, 300, 350, 400, 450, 500])
        .orient('horizontal')
        .scale(legendLinear)
        .labelFormat(d3.format(",.0f"))
        .title('Мусорные тарифы в регионах России, руб.');

const buttonGrid = d3.select('.buttonGrid').on('click', function(){
  d3.selectAll('svg > *')
    .remove()
    d3.csv('regions_short_2.csv', drawGridMap);
    selector = false;
  });

const buttonGeo = d3.select('.buttonGeo').on('click', function(){
    d3.selectAll('svg > *')
    .remove()
    d3.json('russiaGeoGarbageTariff2.json', drawGeo);
    selector = true;
 });

if (selector == false){
  document.getElementsByClassName('buttonGrid')[0].click();
};

