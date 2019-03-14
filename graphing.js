
var dataSet = d3.json("time_data.json").then(
  function(d){
    var new_data = processData(d);
    startChart(new_data);
  },
  function(err){
    console.log(err);
  }
);

var day = 0;

function processData(data){
  var students = [
    {
      Name:"Fred",
      Grades:[]
    },
    {
      Name:"Sally",
      Grades:[]
    },
    {
      Name:"Karl",
      Grades:[]
    },
    {
      Name:"Nancy",
      Grades:[]
    }
  ];

  data.forEach(function(d,i){
    d.grades.forEach(function(d2,j){
        students[j].Grades[i]=d2.grade;
    });
  });
  return students;
}

function startChart(data){
  var height = 500;
  var width = 500;

  var svg = d3.select('svg')
              .attr("height",height)
              .attr("width",width);
  var top = 50;
  var bot = 50;
  var xScale = d3.scaleOrdinal()
                 .domain(["Fred","Sally","Karl","Nancy"])
                 .range([100,200,300,400]);
  var yScale = d3.scaleLinear()
                 .domain([0,100])
                 .range([height-top,bot]);
  var colors = d3.scaleOrdinal(d3.schemeCategory10);

  svg.selectAll('rect')
     .data(data)
     .enter()
     .append("rect")
     .attr("x",function(d){
       return xScale(d.Name);
     })
     .attr('y',function(d){
       return yScale(d.Grades[day]);
     })
     .attr("height",function(d){
       return 450 - yScale(d.Grades[day]);
     })
     .attr("width",50)
     .attr("fill",function(d){
       return colors(d.Name);
     })
     .on("mouseover", function(d){
       svg.append("text")
          .text(d.Grades[day])
          .attr("x",xScale(d.Name)+16)
          .attr("y",yScale(d.Grades[day])-5)
          .attr("id",d.Name);
     })
     .on("mouseout",function(d){
       svg.select("text#"+d.Name)
          .remove();
     });

  var xAxis = d3.axisBottom()
                .scale(xScale);
  svg.append("g")
     .call(xAxis)
     .attr("transform","translate(25,"+(height-bot+10)+")");
  var yAxis = d3.axisLeft()
                .scale(yScale);
  svg.append("g")
     .call(yAxis)
     .attr("transform","translate(75,0)");

     d3.select("p")
       .text(day+1);
}

function update(change){
  if(change === "prev"){
    day--;
  }
  else{
    day++;
  }
  if(day==-1 || day==10){
    if(day<0){
      day++;
    }
    else{
      day--;
    }
    return
  }
  var yScale = d3.scaleLinear()
                 .domain([0,100])
                 .range([450,50]);

  var rectangles = d3.select("svg")
                     .selectAll("rect")
                     .transition()
                     .attr("y",function(d){
                       return yScale(d.Grades[day]);
                     })
                     .attr("height",function(d){
                       return 450-yScale(d.Grades[day]);
                     });
   d3.select("p")
     .text(day+1);
}
