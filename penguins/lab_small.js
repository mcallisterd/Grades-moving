function makeStudent(avgArray, name){
  var total=0;
  avgArray.forEach(function(d){total+=d;})
  total/=avgArray.length;
  return {
    picture:name,
    gradesByDay: avgArray,
    longAverage: total
  };
}

function makeGrade(type,max,day,grade){
  return {
    type:type,
    max:max,
    day:day,
    grade:grade
  };
}

function updateAverage(test,home,quiz,final,newGrade){
  var array;
  if(newGrade.type==="test"){
    array=test;
  }
  if(newGrade.type==="homework"){
    array=home;
  }
  if(newGrade.type==="quizes"){
    array=quiz;
  }
  if(newGrade.type==="final"){
    array=final;
  }
  array.outOf+= newGrade.max
  array.earned+= newGrade.grade

  var qWeight=.15;
  var tWeight=.4;
  var hWeight=.15;
  var fWeight=.3;

  var tScore=0;
  var qScore=0;
  var fScore=0;
  var hScore=0;
  var maxScore=0;
  if(test.outOf!=0){
    var tWeight=0;
    if(test.outOf===200){tWeight+=.4;}
    else{tWeight+=.2;}
    tScore=tWeight*test.earned/test.outOf;
    maxScore+=tWeight;
  }
  if(quiz.outOf!=0){
    qScore=.15*quiz.earned/quiz.outOf;
    maxScore+=.15;
  }
  if(home.outOf!=0){
    hScore=.15*home.earned/home.outOf;
    maxScore+=.15;
  }
  if(final.outOf!=0){
    fScore=.3*final.earned/final.outOf;
    maxScore+=.3;
  }
  return Math.floor((fScore+hScore+qScore+tScore)*(100/maxScore));
}

function go(){
  d3.json("classData.json").then(
  function(d){
    var students =[];
    d.forEach(function(data,i){
      var name = data.picture;
      var grades = processGrades(data);
      var newStudent = makeStudent(grades,name)

      students.push(newStudent);
    });
    makeChart(students);
  },
  function(err){
    console.log(err);
  });
}

function processGrades(student){
  var tScore = {outOf:0,earned:0};
  var hScore = {outOf:0,earned:0};
  var qScore = {outOf:0,earned:0};
  var fScore = {outOf:0,earned:0};

  var days = [];
  var averages=[];
  for(var i=0;i<41;i++){
    days[i]=[];
    averages[i]=[];
  };
  ["homework","quizes","final","test"].forEach(function(d){
    student[d].forEach(function(score){
      var reMadeGrade = makeGrade(d,score.max,score.day,score.grade);
      days[score.day-1].push(reMadeGrade);
    });
  });
  days.forEach(function(d,i){
    var avg;
    d.forEach(function(assignment){
        avg=updateAverage(tScore,hScore,qScore,fScore,assignment);
    });
    averages[i]=avg;
  });
  return averages;
}

function classAv(students){
  var total=0;
  students.forEach(function(d){
    total+=d.longAverage;
  });
  return total/students.length;
}

function makeChart(students){
  students.push(classAv(students));

  var height = 700;
  var width  = 700;
  var margin ={top:50,bot:50,left:40,right:40};//here
  var svg = d3.select('svg')
              .attr("height",height)
              .attr('width',width)
              .attr("id",0)
              .data([students]);

  var xScale = d3.scaleLinear()
                 .domain([0,42])
                 .range([margin.left,width-margin.right]);//here
 var yScale = d3.scaleLinear()
                .domain([0,100])
                .range([height-margin.top,margin.bot]);//here

 var xAxis = d3.axisBottom()
               .scale(xScale);
 var yAxis = d3.axisLeft()
               .scale(yScale);
 svg.append('g')
    .call(xAxis)
    .attr("transform","translate("+0+","+(height-margin.bot)+")");//here
 svg.append("g")
    .call(yAxis)
    .attr("transform","translate("+margin.left*2/3+","+(0)+")");//here

 var lineMaker = d3.line()
                   .x(function(d){return d.x;})
                   .y(function(d){return d.y;})
                   .curve(d3.curveCatmullRom);

 var daters = conjoin(students[0].gradesByDay,xScale,yScale);
 console.log(students[0].gradesByDay);
 svg.append("path")
    .attr("d",lineMaker(daters))
    .attr("stroke","blue")
    .attr("stroke-width",1)
    .attr("fill","none")
    .attr("class","line");
}

function conjoin(days,scalex,scaley){
  var lis=[];
  days.forEach(function(d,i){
    lis.push({
      x:scalex(i),
      y:scaley(d)
    });
  });
  return lis;
}

function update(mode){
  var height = 700;
  var width  = 700;
  var margin ={top:50,bot:50,left:40,right:40};//here
  var svg = d3.select('svg');
  var xScale = d3.scaleLinear()
                 .domain([0,42])
                 .range([margin.left,width-margin.right]);//here
  var yScale = d3.scaleLinear()
                 .domain([0,100])
                 .range([height-margin.top,margin.bot]);//here
   if(mode){
     var lineMaker = d3.area()
                       .x(function(d){return d.x;})
                       .y0(function(d){ return yScale(0);})
                       .y1(function(d){ return d.y;})
                       .curve(d3.curveCatmullRom);
   }
   else{
     var lineMaker = d3.line()
                       .x(function(d){return d.x;})
                       .y(function(d){return d.y;})
                       .curve(d3.curveCatmullRom);
   }
  var x = svg.nodes()[0].id
  var daters = conjoin(svg.data()[0][x].gradesByDay,xScale,yScale);
  svg.select("path.line")
     .transition()
     .attr("d", lineMaker(daters));
  if(mode){
    svg.select("path.line").attr("fill","orange");
  }
  else{
    svg.select("path.line").attr("fill","none");
  }
}
