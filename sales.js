
let sales;
function readCSV() {
    //https://gist.githubusercontent.com/alec-huang-labs/d69c949375cbb6f3a63a0ed88264d582/raw/2918641e689f65c3775014ab11e67e80971db6ae/ManhattanRollingSalesNov20.csv
    //https://gist.githubusercontent.com/alec-huang-labs/e6905a0a21b81fdd1b10508f433233af/raw/4f5808c3a2054bf64bdc06fba3af53d331c99cc7/ManhattanRollingSales.csv
    d3.csv("https://gist.githubusercontent.com/alec-huang-labs/d69c949375cbb6f3a63a0ed88264d582/raw/0298d4a25aee4ee99c4ed232260b34682c575929/ManhattanRollingSalesNov20.csv",
        function (data) {
        //array of monthly sales 
        sales = timeFrame.map(x => monthlySales(x));
        console.log(sales)
        scale = d3.scaleLinear()
                .domain([0, /*Math.max(...neighborhoodSales)*/ 110])
                .range([0, bluesArr.length-1]);  

        function fill(month){
            neighborhood.style("fill", function(d){
                return bluesArr[Math.floor(scale(d["properties"][monthInput].length))]
            }) 
        }

        function monthlySales(month){
            for(let i = 0; i < data.length; i++){
                if(eval(month).regex.test(data[i]["SALE DATE"]) 
                && (data[i]["TAX CLASS AT TIME OF SALE"] == "1" || data[i]["TAX CLASS AT TIME OF SALE"] == "2") 
                && (data[i][" SALE PRICE "] !== "0" || data[i][" SALE PRICE "] !== "1")){
                    eval(month).sales.push(data[i]);
                } 
            }
            return eval(month).sales.length;
        }
        
        function fillMap(month) {
            //add regex for tax class to weed out commercial real estate
            console.log(eval(monthInput).sales);
            for(let i = 0; i < eval(monthInput).sales.length; i++){
                for (let j = 0; j < manhattan["features"].length; j++){
                    if(!manhattan["features"][j]["properties"].hasOwnProperty(monthInput)){
                        manhattan["features"][j]["properties"][monthInput] = [];
                    }
                    if(eval(monthInput).sales[i]["NEIGHBORHOOD"] == manhattan["features"][j]["properties"]["neighborhood"].toUpperCase()){  
                        manhattan["features"][j]["properties"][monthInput].push(eval(monthInput).sales[i][" SALE PRICE "]);
                    }
                }
            }
            console.log(manhattan["features"]);
            let neighborhoodSales = manhattan["features"].map(x => x["properties"][monthInput].length);
            console.log(Math.max(...neighborhoodSales))
            fill(month);
        }
        function median(arr) {
            if(arr.length == 0){
                return 0;
            }
            const mid = Math.floor(arr.length / 2);
            const nums = [...arr].sort((a,b) => a - b);
            if (arr.length % 2 !== 0){
                return nums[mid];
            } else {
                return (nums[mid - 1] + nums[mid]) / 2;
            }
        }

        fillMap(Dec);
        let medianSale = median(eval(monthInput).sales.map( x => parseFloat(x[" SALE PRICE "].replace(/,/g, '')))).toLocaleString();
        console.log(monthInput)
        console.log(sales);
        let gap = 50
        if ($(window).width() <= 480){
            gap = 40;
        }
        const horizontalPad = 50;
        const verticalPad = 50;
        const w = sales.length * gap - horizontalPad;
        const h = 400;

        console.log(sliderMonths)
        let barData = sliderMonths.map(x => [x]);
        console.log(barData)
        for(let i = 0; i < sliderMonths.length; i++){
            barData[i].push(sales[i])
        }
        console.log(barData)

        const xScale = d3.scaleTime()
                        .domain([sliderMonths[0], sliderMonths[sliderMonths.length - 1]])  //first and last DATE props in arr of objs
                        .range([horizontalPad, w - horizontalPad])
        const yScale = d3.scaleLinear()
                        .domain([Math.min(...sales) - 50, Math.max(...sales)])
                        .range([h - verticalPad, verticalPad])

        const barSvg = d3.select("#bar")
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h)
                        .attr("align", "center")
                        .style("z-index", "-1")

        const xAxis = d3.axisBottom(xScale)
                        .tickFormat(d3.timeFormat("%b"));
        const yAxis = d3.axisLeft(yScale)
                        .ticks(9)
                        .tickFormat(d => d)

        barSvg.append("g")
                .attr("transform", "translate(12.5," + (h - verticalPad) + ")")
                .attr("class", "axis")
                .call(xAxis)
        barSvg.append("g")
                .attr("transform", "translate(" + horizontalPad + ", 0)")
                .attr("class", "axis")
                .call(yAxis)
        barSvg.append('text')
                .attr('x', 50)
                .attr('y', 25)
                .attr("font-size", "14px")
                .text('Total Sales Per Month')
                .attr("class", "axisLabel")
        barSvg.selectAll("rect")
                .data(barData)
                .enter()
                .append("rect")
                .attr("x", (d, i) => xScale(d[0]))
                .attr("y", (d, i) => yScale(d[1]))
                .attr("width", 25)
                .attr("height", (d, i) => h - verticalPad -  yScale(d[1]))
                .attr("fill", (d) =>{
                    if(new Date(d[0]).toLocaleString('default', { month: 'short' }) == monthInput){
                        return "#3f8ec4"
                    }
                    return "#eaeaea"
                })
                .attr("class", "bar")
        
        //median prices for all neighborhoods[{Oct: [1,2,3]}, {Nov: [4,5,6]}]
        median(manhattan["features"][0]["properties"][monthInput].map( x => parseFloat(x.replace(/,/g, ''))));

        $('#slider').on('slide', function(event, ui) {

            monthInput = sliderMonths[ui.value].toLocaleString('default', { month: 'short' })
            console.log(monthInput)

            barSvg.selectAll("rect")
                    .data(barData)
                    .attr("fill", (d) => {
                        if(new Date(d[0]).toLocaleString('default', { month: 'short' }) == monthInput){
                            return "#3f8ec4"
                        }
                        return "#eaeaea"
                    })
            $("#month").val(sliderMonths[ui.value].toLocaleString('default', { month: 'long' }) + ": " + sales[ui.value] + " sales").css("font-size", "1.5rem");
            if(manhattan["features"][0]["properties"].hasOwnProperty(monthInput)){
                scale(monthInput);
                fill(monthInput);
            } else {
                fillMap(monthInput);
            }

            medianSale = median(eval(monthInput).sales.map( x => parseFloat(x[" SALE PRICE "].replace(/,/g, '')))).toLocaleString();
            console.log(medianSale)
            
            //console.log(typeof monthInput)
            console.log(manhattan["features"][0]["properties"]["Oct"])
            console.log(manhattan["features"][0]["properties"][monthInput])

            for(let i = 0; i < manhattan["features"].length; i++){
                $("#" + i).html("<td>" + manhattan["features"][i]["properties"]["neighborhood"] + "</td><td>" + "$" + median(manhattan["features"][i]["properties"][monthInput].map( x => parseFloat(x.replace(/,/g, '')))).toLocaleString() + "</td>");
            }
        });
        let manhattanMedian = $("<p></p>")
        manhattanMedian.attr('id', 'manhattan')

        console.log(typeof eval(monthInput))
        console.log(typeof monthInput)
        console.log(manhattan["features"][0]["properties"][monthInput])
        console.log(median(manhattan["features"][0]["properties"][monthInput].map( x => parseFloat(x.replace(/,/g, '')))).toLocaleString());

        for(let i = 0; i < manhattan["features"].length; i++){
            let tableRow = $("<tr><td>" + manhattan["features"][i]["properties"]["neighborhood"] + "</td><td>" + "$" + median(manhattan["features"][i]["properties"][monthInput].map( x => parseFloat(x.replace(/,/g, '')))).toLocaleString() + "</td></tr>")
            tableRow.attr('id', i)
            $("TABLE").append(tableRow)
            if(i%2 == 0){
                $("#" + i).css("background-color", "#e0ecf7")
            }
        }
    })
}
readCSV();
