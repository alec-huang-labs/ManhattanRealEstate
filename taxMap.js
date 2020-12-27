//https://www1.nyc.gov/assets/finance/downloads/pdf/07pdf/glossary_rsf071607.pdf
var svg = d3.select("#manhattanMap"),
width = 250,
height = 650;
// http://data.beta.nyc//dataset/0ff93d2d-90ba-457c-9f7e-39e47bf2ac5f/resource/35dd04fb-81b3-479b-a074-a27a37888ce7/download/d085e2f8d0b54d4590b1e7d1f35594c1pediacitiesnycneighborhoods.geojson
const request = new XMLHttpRequest();
//geojson map of manhattan neighborhoods
request.open("GET", 
             "https://gist.githubusercontent.com/alec-huang-labs/752cb33cd1435b441f02c3ab9221012b/raw/bb0fd9c08d62a744d7d4ddffa34af77310e87488/manhattanTaxMap.geojson",
             true);
request.send();
let manhattan;
let neighborhood;
request.onload = () => {
    manhattan = JSON.parse(request.responseText)
    console.log(manhattan)
    //convert GeoJSON geometry (points in lattitude and longitude), it generates a SVG path data string
    var path = d3.geoPath()
                //Projections transform spherical polygonal geometry to planar polygonal geometry
                .projection(d3.geoConicConformal()
                .parallels([33, 45])
                .rotate([100, -39])
                .fitSize([width, height], manhattan));
          //creates a grey neighborhood map of manhattan
          neighborhood = svg.selectAll("path")
                            .data(manhattan.features)
                            .enter().append("path")
                            .attr("d", path)
                            .on("mouseenter", function(d) {
                              d3.select(this)
                                .style("stroke-width", 1.5)
                                .style("stroke-dasharray", 0)
                              d3.select("#neighborhoodTooltip")
                                .transition()
                                .style("opacity", 1)
                                .style("left", "225px" )
                                .style("top", "240px" )
                                .text(d.properties.neighborhood + ": " + d.properties[monthInput].length + " Sales")
                            })
                            .on("mouseleave", function(d) { 
                                d3.select(this)
                                  .style("stroke-width", .25)
                                  .style("stroke-dasharray", 1)
                                d3.select("#neighborhoodTooltip")
                                  .transition()
                                  .style("opacity", 0);
                            });
};

// $("svg").css({top: 10, left: -325, position:'absolute'});

