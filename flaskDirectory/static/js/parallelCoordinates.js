var parallelData = [];
var dragging = {}, foreground, background;
function myParallel(data, type, profiler){
    console.log("In My Parallel", profiler);
    console.log(data);
    document.getElementById("parallelCoord").innerHTML = "";
    var margin = {top: 50, right: 70, bottom: 20, left: 100},
    width = 850 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;
    var firstDimension;

    if (type == 1) {
        parallelData = data.splice(8,1);
        parallelData = data.splice(10,1);
        parallelData = data.splice(1,1);
        firstDimension = {
            name: "STATE",
            scale: d3.scale.ordinal().rangePoints([0, height]),
            type: String
        }
    } else {
        firstDimension = {
            name: "YEAR",
            scale: d3.scale.ordinal().rangePoints([0, height]),
            type: String
        }
    }

    var dimensions = [
    firstDimension,
    {
        name: "Total_Population",
        scale: d3.scale.linear().range([height, 0]),
        type: Number
    },
    {
        name: "Urban_Ratio",
        scale: d3.scale.linear().range([height, 0]),
        type: Number
    },
    {
        name: "Sex_Ratio",
        scale: d3.scale.linear().range([height, 0]),
        type: Number
    },
    {
        name: "Race_Ratio",
        scale: d3.scale.linear().range([height, 0]),
        type: Number
    },
    {
        name: profiler,
        scale: d3.scale.linear().range([height, 0]),
        type: Number
    }];

    var y = {}; // this element for brushing

    var color = d3.scale.ordinal()
        .domain([])
        .range(['#ff7777']);

    var x = d3.scale.ordinal()
        .domain(dimensions.map(function(d) { return d.name; }))
        .rangePoints([0, width]);

    var line = d3.svg.line()
        .defined(function(d) { return !isNaN(d[1]); });

    var yAxis = d3.svg.axis()
        .orient("left");

    var svg = d3.select("#parallelCoord").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dimension = svg.selectAll(".dimension")
        .data(dimensions)
      .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + x(d.name) + ")"; });

    d3.keys(data[1]).filter(function(d) {
        y[d]=d3.scale.linear().domain(d3.extent(data, function(p) { return +p[d]; })).range([height, 0]);
        return d != "name" && y[d];
    });

    dimensions.forEach(function(dimension) {
    dimension.scale.domain(dimension.type === Number
        ? d3.extent(data, function(d) { return +d[dimension.name]; })
        : data.map(function(d) {return d[dimension.name]; }));
    });

    background = svg.append("g")
        .attr("class", "background")
        .selectAll("path")
            .data(data)
        .enter().append("path")
            .attr("d", draw);

    foreground = svg.append("g")
        .attr("class", "foreground")
        .selectAll("path")
            .data(data)
        .enter().append("path")
            .attr("d", draw)
            .attr('stroke', function(d) {return color(d.STATE); });

    dimension.append("g")
            .attr("class", "axis")
            .each(function(d) { d3.select(this).call(yAxis.scale(d.scale)); })
        .append("text")
            .attr("class", "title")
            .attr("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d) { return d.name; });

    // Rebind the axis data to simplify mouseover.
    svg.select(".axis").selectAll("text:not(.title)")
        .attr("class", "label")
        .data(data, function(d) { return d.name || d; });

    var projection = svg.selectAll(".axis text,.background path,.foreground path")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    function mouseover(d) {
        svg.classed("active", true);
        projection.classed("inactive", function(p) { return p !== d; });
        projection.filter(function(p) { return p === d; }).each(moveToFront);
    }

    function mouseout(d) {
        svg.classed("active", false);
        projection.classed("inactive", false);
    }

    function moveToFront() {
        this.parentNode.appendChild(this);
    }

    //for brushing
    // Add a group element for each dimension.
    var g = dimension.call(d3.behavior.drag()
        .origin(function(d) { console.log({x: x(d.name)});return {x: x(d.name)}; })
        .on("dragstart", function(d) {
          dragging[d.name] = x(d.name);
          console.log(dragging);
          background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          dragging[d.name] = Math.min(width, Math.max(0, d3.event.x));
          foreground.attr("d", path); //ch path to draw
          dimensions.sort(function(a, b) { return position(a.name) - position(b.name); });
          x.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d.name) + ")"; })
        })
        .on("dragend", function(d) {
          delete dragging[d.name];
          transition(d3.select(this)).attr("transform", "translate(" + x(d.name) + ")");
          transition(foreground).attr("d", path);//ch
          background
              .attr("d", path)//ch
            .transition()
              .delay(500)
              .duration(0)
              .attr("visibility", null);
        }));

    // Add and store a brush for each axis.
    g.append("g")
        .attr("class", "brush")
        .each(function(d) {
            d3.select(this).call(y[d.name].brush = d3.svg.brush().y(y[d.name]).on("brushstart", brushstart).on("brush", brush));
        })
        .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);
    //end of brushing part

    function draw(d) {
        return line(dimensions.map(function(dimension) {
            return [x(dimension.name), dimension.scale(d[dimension.name])];
        }));
    }

    // setting up brushing

    // Add a group element for each dimension.
    function position(d) {
      var v = dragging[d];
      return v == null ? x(d) : v;
    }

    function transition(g) {
      return g.transition().duration(500);
    }

    // Returns the path for a given data point.
    function path(d) {
      return line(dimensions.map(function(p) {
        return [position(p.name), y[p.name](d[p.name])];
      }));
    }

    function brushstart() {
      d3.event.sourceEvent.stopPropagation();
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
      var actives = dimensions.filter(function(p) { return !y[p.name].brush.empty(); }),
          extents = actives.map(function(p) { return y[p.name].brush.extent(); });
      foreground.style("display", function(d) {
      console.log('foreground', foreground)
        return actives.every(function(p, i) {
        console.log('p', d)
          return extents[i][0] <= d[p.name] && d[p.name] <= extents[i][1];
        }) ? null : "none";
      });
    }
}
