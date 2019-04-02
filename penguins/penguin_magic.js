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
    makeDivs(students);
  },
  function(err){
    console.log(err);
  });
}

function makeDivs(students){
  var dictionary = {
"bookworm-penguin-300px.png": "Bookworm",
"crafty-penguin-300px.png":"Crafty",
"cyclist-penguin-300px.png":"Cyclist",
"drunken-penguin-300px.png":"Drunken",
"Easter-penguin-300px.png":"Easter",
"ebook-penguin-300px.png":"Ebook",
"Farmer-penguin-300px.png":"Farmer",
"gentleman-penguin-300px.png":"Gentleman",
"judo-penguin-300px.png":"Judo",
"moana-penguin-300px.png":"Moana",
"painter-penguin-300px.png":"Painter",
"penguin-grill-300px.png":"Grill",
"pharaoh-penguin-300px.png":"Pharaoh",
"pilot-penguin-300px.png":"Pilot",
"Pinga_corr-300px.png":"Pinga corr",
"pixie-penguin-300px.png":"Pixie",
"sailor-penguin-300px.png":"Sailor",
"santa-penguin-300px.png":"Santa",
"tauch-pinguin-ocal-300px.png":"Tauch",
"tux-300px.png":"Tux",
"valentine-penguin-ocal-300px.png":"Valentine ocal",
"valentine-penguin.png":"Valentine",
"wizard-penguin-300px.png":"Wizard"
}

  d3.select("body")
    .selectAll("div")
    .data(students)
    .enter()
    .append("div")
    .on("click",function(d,i){
      update(i);
    })
    .style("float","right")
    .attr("class",function(d,i){
      return i%6;
    })
    .style("clear","right")
    .text(function(d){
      return dictionary[d.picture]+" Penguin";
    })
    .append("img")
    .attr("src",function(d){
      return d.picture;
    })
    .attr("width","50px")
    .attr("height","50px");
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
                   .y(function(d){return d.y;});

 var daters = conjoin(students[0].gradesByDay,xScale,yScale);

 svg.append("path")
    .attr("d",lineMaker(daters))
    .attr("stroke","blue")
    .attr("stroke-width",1)
    .attr("fill","lightblue")
    .attr("class","line");
}

function conjoin(days,scalex,scaley){
  var lis=[];
  lis.push({
    x: scalex(0),
    y: scaley(days[40])
  });
  days.forEach(function(d,i){
    lis.push({
      x:scalex(i),
      y:scaley(d)
    });
  });

  return lis;
}

function update(mode){
  console.log("called");
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
  var lineMaker = d3.line()
                    .x(function(d){return d.x;})
                    .y(function(d){return d.y;});
  if(mode){
    if(svg.nodes()[0].id!=22){
      var change=1;
    }
    else{
      var change=0;
    }
  }
  else{
    if(svg.nodes()[0].id!=0){
      var change=-1;
    }
    else{
      var change=0;
    }
  }
  var x= svg.nodes()[0].id
  svg.nodes()[0].id = parseInt(x,10)+change;
  x= svg.nodes()[0].id
  var daters = conjoin(svg.data()[0][x].gradesByDay,xScale,yScale);

  svg.select("path.line")
     .transition()
     .attr("d", lineMaker(daters));
}
