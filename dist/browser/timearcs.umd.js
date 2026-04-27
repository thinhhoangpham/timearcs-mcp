(function(e,t){typeof exports==`object`&&typeof module<`u`?t(exports):typeof define==`function`&&define.amd?define([`exports`],t):(e=typeof globalThis<`u`?globalThis:e||self,t(e.TimeArcs={}))})(this,function(e){Object.defineProperty(e,Symbol.toStringTag,{value:`Module`});var t=[`person`,`location`,`organization`,`miscellaneous`],n=new Set(t);function r(e,r){let i=Array.from(new Set(e.map(e=>e.category??`default`))),a={};r?i.forEach(e=>{let t=r[e];a[e]=t&&n.has(t)?t:`miscellaneous`}):i.forEach((e,n)=>{a[e]=t[Math.min(n,t.length-1)]});let o={};for(let t of e)o[t.id]=a[t.category??`default`];return{catToSlot:a,nodeCatSlot:o}}function i(e,t){let n={person:`#00aa00`,location:`#cc0000`,organization:`#0000cc`,miscellaneous:`#aaaa00`};if(t)for(let[r,i]of Object.entries(t)){let t=e[r];t&&(n[t]=i)}return n}function a(e,t,n){return Array.from(new Set(e.map(e=>e.category??`default`))).map(e=>({label:e,color:n[t[e]]}))}function o(e,t,n){let r=e.map(e=>new Date(e.timestamp).getTime()),i=Math.min(...r),a=Math.max(...r),o=n?.min?new Date(n.min).getTime():i,s=n?.max?new Date(n.max).getTime():a,c=t??60,l=Math.max(1,(s-o)/c);function u(e){return Math.max(0,Math.min(c-1,Math.floor((e-o)/l)))}return{tmin:o,tmax:s,NUM_BUCKETS:c,minYear:new Date(o).getFullYear(),maxYear:new Date(s).getFullYear()+1,bucketOf:u}}function s(e,t,n){return e.map((e,r)=>{let i={source:`doc_${r}`,time:e.timestamp,person:``,location:``,organization:``,miscellaneous:``,_m:n(new Date(e.timestamp).getTime())};for(let n of[e.source,e.target]){let e=t[n];e&&(i[e]=i[e]?`${i[e]}|${n}`:n)}return i})}function c(e,{minYear:t,maxYear:n,NUM_BUCKETS:r}){return e.replace(/var minYear\s*=\s*2006\s*;/,`var minYear = ${t};`).replace(/var maxYear\s*=\s*2015\s*;/,`var maxYear = ${n};`).replace(/var m\s*=\s*12\*\(year-minYear\)\s*\+\s*d\.date\.getMonth\(\)\s*;/,`var m = (+d._m);`).replace(/var numMonth\s*=\s*12\*\(maxYear-minYear\)\s*;/,`var numMonth = ${r};`).replace(/\$\(function \(\) \{\s*\$\("#search"\)\.autocomplete\(\{[\s\S]*?\}\);\s*\}\);/,`/* autocomplete stripped */`).replace(/\$\('#btnUpload'\)\.click\(function\(\) \{[\s\S]*?\n\}\);/,`/* btnUpload stripped */`).replace(/var svg2 = d3\.select\("body"\)\.append\("svg"\)/,`var svg2 = d3.select(document.createElement("div")).append("svg")`).replace(/setupSliderScale\(svg\);/,`/* slider disabled */`).replace(/drawTimeBox\(\);/,`/* lensing disabled */`).replace(/drawLensingButton\(\);/,`/* lensing disabled */`).replace(/^\s*debugger\s*;\s*$/m,`/* debugger removed */`).replace(/\.style\("fill", "#000000"\)\s*\.style\("text-anchor","end"\)/,`.style("fill", function(d){ return __slotColors[d.group] || "#000"; })
        .style("text-anchor","end")`)}function l(e){return e.replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function u(e,t){let n=e.title??`TimeArcs`,{catToSlot:u,nodeCatSlot:d}=r(e.nodes,e.categorySlots),f=i(u,e.categoryColors),p=JSON.stringify(f),m=a(e.nodes,u,f),h=JSON.stringify(m).replace(/</g,`\\u003c`),{tmin:g,tmax:_,NUM_BUCKETS:v,minYear:y,maxYear:b,bucketOf:x}=o(e.links,e.numBuckets,e.timeRange),S=s(e.links,d,x),C=JSON.stringify(S).replace(/</g,`\\u003c`),w=c(t.mainRaw,{minYear:y,maxYear:b,NUM_BUCKETS:v});return`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${l(n)}</title>
<style>
  body { margin: 0; font-family: Helvetica, sans-serif; }
  .node { stroke: #fff; stroke-width: 1px; stroke-opacity: 0.6; }
  .linkArc { fill: none; stroke: #000; }
  .layer { display: none; }
  .node text { font: 9px helvetica; }
  .axis { font: 10px sans-serif; user-select: none; }
  .axis .domain { fill: none; stroke: #000; stroke-opacity: .25; stroke-width: 5px; stroke-linecap: round; }
  .axis .halo { fill: none; stroke: #ddd; stroke-width: 3px; stroke-linecap: round; }
  #checkbox1, label[for=checkbox1], #search, #progBar, #progUpdate { display: none; }
</style>
</head>
<body>

<input type="checkbox" id="checkbox1">
<label for="checkbox1">Area graph only</label>
<input type="text" id="search">
<progress value="0" max="100" id="progBar"></progress>
<label id="progUpdate"></label>

<script>
  // Defaults main.js would have gotten from sliderRelationship.js — keep the variable,
  // drop the UI.
  var valueSlider = ${e.linkThreshold??1};
  var valueMax = 10;
  function setupSliderScale(){ /* disabled */ }
  var __slotColors = ${p};
  var __categoryLegend = ${h};
  window.INLINE_TSV_DATA = ${C};
<\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min.js"><\/script>
<script>
// Override d3.tsv so main.js gets inline data instead of fetching a file.
(function(){
  d3.tsv = function(path, callback) {
    setTimeout(function(){ callback(null, window.INLINE_TSV_DATA); }, 0);
    return this;
  };
})();
<\/script>
<script>
${t.util}
<\/script>
<script>
// Override drawColorLegend to render one row per actual user category instead of the
// four hardcoded Person/Location/Organization/Miscellaneous labels in util.js.
(function(){
  drawColorLegend = function() {
    svg.selectAll(".nodeLegend").remove();
    var xx = 6, rr = 6;
    __categoryLegend.forEach(function(entry, i) {
      var y = 20 + i * 14;
      svg.append("circle")
        .attr("class", "nodeLegend")
        .attr("cx", xx).attr("cy", y).attr("r", rr)
        .style("fill", entry.color);
      svg.append("text")
        .attr("class", "nodeLegend")
        .attr("x", xx + 10).attr("y", y + 1)
        .text(entry.label)
        .attr("dy", ".21em")
        .attr("font-family", "sans-serif").attr("font-size", "11px")
        .style("text-anchor", "left")
        .style("fill", entry.color);
    });
  };
})();
<\/script>
<script>
// Override drawTimeLegend/updateTimeLegend with a real date axis based on our bucket range.
(function(){
  var TMIN = ${g}, TMAX = ${_}, NBUCK = ${v};
  function drawAxis() {
    svg.selectAll(".timeLegendLine,.timeLegendText").remove();
    var ticks = 6;
    for (var i = 0; i <= ticks; i++) {
      var t = TMIN + (TMAX - TMIN) * (i / ticks);
      var m = Math.min(NBUCK - 1, Math.floor((t - TMIN) / Math.max(1, (TMAX - TMIN) / NBUCK)));
      var xx = xStep + xScale(m);
      svg.append("line").attr("class","timeLegendLine")
        .style("stroke","#000").style("stroke-dasharray","1,2")
        .style("stroke-opacity", 0.4).style("stroke-width", 0.3)
        .attr("x1", xx).attr("x2", xx).attr("y1", 0).attr("y2", height);
      var d = new Date(t);
      var label = (d.getUTCFullYear()+"-"+String(d.getUTCMonth()+1).padStart(2,"0")+"-"+String(d.getUTCDate()).padStart(2,"0")+" "+String(d.getUTCHours()).padStart(2,"0")+":"+String(d.getUTCMinutes()).padStart(2,"0"));
      svg.append("text").attr("class","timeLegendText")
        .style("fill","#222").style("text-anchor","middle")
        .attr("x", xx).attr("y", height - 6)
        .attr("font-family","sans-serif").attr("font-size","10px")
        .text(label);
    }
  }
  drawTimeLegend = drawAxis;
  updateTimeLegend = drawAxis;
  updateTimeBox = function(){ /* lensing disabled */ };
})();
<\/script>
<script>
${t.stopList}
<\/script>
<script>
${w}
<\/script>

</body>
</html>`}var d={fisheye:`(function() {
  d3.fisheye = {
    scale: function(scaleType) {
      return d3_fisheye_scale(scaleType(), 3, 0);
    },
    circular: function() {
      var radius = 200,
          distortion = 2,
          k0,
          k1,
          focus = [0, 0];

      function fisheye(d) {
        var dx = d.x - focus[0],
            dy = d.y - focus[1],
            dd = Math.sqrt(dx * dx + dy * dy);
        if (!dd || dd >= radius) return {x: d.x, y: d.y, z: 1};
        var k = k0 * (1 - Math.exp(-dd * k1)) / dd * .75 + .25;
        return {x: focus[0] + dx * k, y: focus[1] + dy * k, z: Math.min(k, 10)};
      }

      function rescale() {
        k0 = Math.exp(distortion);
        k0 = k0 / (k0 - 1) * radius;
        k1 = distortion / radius;
        return fisheye;
      }

      fisheye.radius = function(_) {
        if (!arguments.length) return radius;
        radius = +_;
        return rescale();
      };

      fisheye.distortion = function(_) {
        if (!arguments.length) return distortion;
        distortion = +_;
        return rescale();
      };

      fisheye.focus = function(_) {
        if (!arguments.length) return focus;
        focus = _;
        return fisheye;
      };

      return rescale();
    }
  };

  function d3_fisheye_scale(scale, d, a) {

    function fisheye(_) {
      var x = scale(_),
          left = x < a,
          range = d3.extent(scale.range()),
          min = range[0],
          max = range[1],
          m = left ? a - min : max - a;
      if (m == 0) m = max - min;
      return (left ? -1 : 1) * m * (d + 1) / (d + (m / Math.abs(x - a))) + a;
    }

    fisheye.distortion = function(_) {
      if (!arguments.length) return d;
      d = +_;
      return fisheye;
    };

    fisheye.focus = function(_) {
      if (!arguments.length) return a;
      a = +_;
      return fisheye;
    };

    fisheye.copy = function() {
      return d3_fisheye_scale(scale.copy(), d, a);
    };

    fisheye.nice = scale.nice;
    fisheye.ticks = scale.ticks;
    fisheye.tickFormat = scale.tickFormat;
    return d3.rebind(fisheye, scale, "domain", "range");
  }
})();`,util:`var diameter = 1000,
    radius = diameter / 2,
    innerRadius = radius - 120;
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  // Add color legend
function drawColorLegend() {
      var xx = 6;
      var y1 = 20;
      var y2 = 34;
      var y3 = 48;
      var y4 = 62;
      var rr = 6;

      
      svg.append("circle")
        .attr("class", "nodeLegend")
        .attr("cx", xx)
        .attr("cy", y1)
        .attr("r", rr)
        .style("fill", "#00aa00");
      
      svg.append("text")
        .attr("class", "nodeLegend")
        .attr("x", xx+10)
        .attr("y", y1+1)
        .text("Person")
        .attr("dy", ".21em")
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .style("text-anchor", "left")
        .style("fill", "#00aa00");
   
      svg.append("circle")
        .attr("class", "nodeLegend")
        .attr("cx", xx)
        .attr("cy", y2)
        .attr("r", rr)
        .style("fill", "#cc0000");  

      svg.append("text")
        .attr("class", "nodeLegend")
        .attr("x", xx+10)
        .attr("y", y2+1)
        .text("Location")
        .attr("dy", ".21em")
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .style("text-anchor", "left")
        .style("fill", "#cc0000");  

       svg.append("circle")
        .attr("class", "nodeLegend")
        .attr("cx", xx)
        .attr("cy", y3)
        .attr("r", rr)
        .style("fill", "#0000cc");  

      svg.append("text")
        .attr("class", "nodeLegend")
        .attr("x", xx+10)
        .attr("y", y3+1)
        .text("Organization")
        .attr("dy", ".21em")
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .style("text-anchor", "left")
        .style("fill", "#0000cc");  
        
       svg.append("circle")
        .attr("class", "nodeLegend")
        .attr("cx", xx)
        .attr("cy", y4)
        .attr("r", rr)
        .style("fill", "#aaaa00");  

      svg.append("text")
        .attr("class", "nodeLegend")
        .attr("x", xx+10)
        .attr("y", y4+1)
        .text("Miscellaneous")
        .attr("dy", ".21em")
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .style("text-anchor", "left")
        .style("fill", "#aaaa00");     

      // number of input terms  
      svg.append("text")
        .attr("class", "nodeLegend")
        .attr("x", xx-6)
        .attr("y", y4+20)
        .text(numberInputTerms+" terms of "+ data.length +" blogs" )
        .attr("dy", ".21em")
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .style("text-anchor", "left")
        .style("fill", "#000000");       
}

function removeColorLegend() {
 svg.selectAll(".nodeLegend").remove();
}

function drawTimeLegend() {
  var listX=[];
  for (var i=minYear; i<maxYear;i++){
    for (var j=0; j<12;j++){
      var xx = xStep+xScale((i-minYear)*12+j);
      var obj = {};
      obj.x = xx;
      obj.year = i;
      listX.push(obj);
    }  
  }

  svg.selectAll(".timeLegendLine").data(listX)
    .enter().append("line")
      .attr("class", "timeLegendLine")
      .style("stroke", "000") 
      .style("stroke-dasharray", "1, 2")
      .style("stroke-opacity", 1)
      .style("stroke-width", 0.2)
      .attr("x1", function(d){ return d.x; })
      .attr("x2", function(d){ return d.x; })
      .attr("y1", function(d){ return 0; })
      .attr("y2", function(d){ return height; });
  svg.selectAll(".timeLegendText").data(listX)
    .enter().append("text")
      .attr("class", "timeLegendText")
      .style("fill", "#000000")   
      .style("text-anchor","start")
      .style("text-shadow", "1px 1px 0 rgba(255, 255, 255, 0.6")
      .attr("x", function(d){ return d.x; })
      .attr("y", function(d,i) { 
        if (i%12==0)
          return height-7;
        else
          return height-15;   
      })
      .attr("dy", ".21em")
      .attr("font-family", "sans-serif")
      .attr("font-size", "12px")
      .text(function(d,i) { 
        if (i%12==0)
          return d.year;
        else
          return months[i%12];  
      });     
}

function updateTimeLegend() {
  console.log("updateTimeLegend");
  var listX=[];
  for (var i=minYear; i<maxYear;i++){
    for (var j=0; j<12;j++){
      var xx = xStep+xScale((i-minYear)*12+j);
      var obj = {};
      obj.x = xx;
      obj.year = i;
      listX.push(obj);
    }  
  }

  svg.selectAll(".timeLegendLine").data(listX).transition().duration(250)
      .style("stroke-dasharray",  function(d,i){ 
        if (!isLensing)
          return "1, 2";
        else  
          return i%12==0 ? "2, 1" : "1, 3"})
      .style("stroke-opacity", function(d,i){
        if (i%12==0)
          return 1;
        else {
          if (isLensing && lMonth-lensingMul<=i && i<=lMonth+lensingMul)
              return 1;
          else 
            return 0; 
        }
      }) 
      .attr("x1", function(d){return d.x; })
      .attr("x2", function(d){ return d.x; });
  svg.selectAll(".timeLegendText").data(listX).transition().duration(250)
      .style("fill-opacity", function(d,i){
        if (i%12==0)
          return 1;
        else {
          if (isLensing && lMonth-lensingMul<=i && i<=lMonth+lensingMul)
              return 1;
          else 
            return 0; 
        }
      }) 
      .attr("x", function(d,i){ 
        return d.x; });  
}

function drawTimeBox(){  
  svg.append("rect")
    .attr("class", "timeBox")
    .style("fill", "#aaa")
    .style("fill-opacity", 0.2)
    .attr("x", xStep)
    .attr("y", height-25)
    .attr("width", XGAP_*numMonth)
    .attr("height", 16)
    .on("mouseout", function(){
      isLensing = false;
      coordinate = d3.mouse(this);
      lMonth = Math.floor((coordinate[0]-xStep)/XGAP_);
      updateTransition(250);
    })
    .on("mousemove", function(){
      isLensing = true;
      coordinate = d3.mouse(this);
      lMonth = Math.floor((coordinate[0]-xStep)/XGAP_);
      updateTransition(250);
    });
}  

function updateTimeBox(durationTime){  
  var maxY=0; 
  for (var i=0; i< nodes.length; i++) {
    if (nodes[i].y>maxY)
      maxY = nodes[i].y;
  }
  svg.selectAll(".timeBox").transition().duration(durationTime)
      .attr("y", maxY+12);
  svg.selectAll(".timeLegendText").transition().duration(durationTime)
    .style("fill-opacity", function(d,i){
        if (i%12==0)
          return 1;
        else {
          if (isLensing && lMonth-lensingMul<=i && i<=lMonth+lensingMul)
              return 1;
          else 
            return 0; 
        }
      }) 
    .attr("y", function(d,i) { 
      if (i%12==0)
        return maxY+21;
      else
        return maxY+21;   
    })
    .attr("x", function(d,i){ 
      return d.x; });   
}

var buttonLensingWidth =80;
var buttonheight =15;
var roundConner = 4;
var colorHighlight = "#fc8";
var buttonColor = "#ddd";

function drawLensingButton(){  
  svg.append('rect')
    .attr("class", "lensingRect")
    .attr("x", 1)
    .attr("y", 170)
    .attr("rx", roundConner)
    .attr("ry", roundConner)
    .attr("width", buttonLensingWidth)
    .attr("height", buttonheight)
    .style("stroke", "#000")
    .style("stroke-width", 0.1)
    .style("fill", buttonColor)
    .on('mouseover', function(d2){
      svg.selectAll(".lensingRect")
          .style("fill", colorHighlight);
    })
    .on('mouseout', function(d2){
      svg.selectAll(".lensingRect")
          .style("fill", buttonColor);
    })
    .on('click', turnLensing);         
  svg.append('text')
    .attr("class", "lensingText")
    .attr("font-family", "sans-serif")
    .attr("font-size", "11px")
    .attr("x", buttonLensingWidth/2)
    .attr("y", 181)
    .text("Lensing")
    .style("text-anchor", "middle")
    .style("fill", "#000")
    .on('mouseover', function(d2){
        svg.selectAll(".lensingRect")
          .style("fill", colorHighlight);
    })
    .on('mouseout', function(d2){
        svg.selectAll(".lensingRect")
          .style("fill", buttonColor);
    })
    .on('click', turnLensing);
}
function turnLensing() {
  isLensing = !isLensing;
  svg.selectAll('.lensingRect')
    .style("stroke-width", function(){
      return isLensing ? 1 : 0.1;
    });
  svg.selectAll('.lensingText')
    .style("font-weight", function() { 
      return isLensing ? "bold" : "";
    });
   svg.append('rect')
    .attr("class", "lensingRect")
    .style("fill-opacity", 0)
    .attr("x", xStep)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .on('mousemove', function(){
      coordinate = d3.mouse(this);
      lMonth = Math.floor((coordinate[0]-xStep)/XGAP_);
      updateTransition(250);  
      updateTimeLegend();
    });
    updateTransition(250);     
    updateTimeLegend(); 
}  

function getColor(category, count) {
  var minSat = 80;
  var maxSat = 180;
  var percent = count/maxCount[category];
  var sat = minSat+Math.round(percent*(maxSat-minSat));
 
  if (category=="person")
    return "rgb("+sat+", "+255+", "+sat+")" ; // leaf node
  else if (category=="location")
    return "rgb("+255+", "+sat+", "+sat+")" ; // leaf node
  else if (category=="organization")
    return "rgb("+sat+", "+sat+", "+255+")" ; // leaf node
  else if (category=="miscellaneous")
    return "rgb("+(215)+", "+(215)+", "+(sat)+")" ; // leaf node
  else
    return "#000000";
   
}

function colorFaded(d) {
  var minSat = 80;
  var maxSat = 230;
  var step = (maxSat-minSat)/maxDepth;
  var sat = Math.round(maxSat-d.depth*step);
 
  //console.log("maxDepth = "+maxDepth+"  sat="+sat+" d.depth = "+d.depth+" step="+step);
  return d._children ? "rgb("+sat+", "+sat+", "+sat+")"  // collapsed package
    : d.children ? "rgb("+sat+", "+sat+", "+sat+")" // expanded package
    : "#aaaacc"; // leaf node
}


function getBranchingAngle1(radius3, numChild) {
  if (numChild<=2){
    return Math.pow(radius3,2);
  }  
  else
    return Math.pow(radius3,1);
 } 

function getRadius(d) {
 // console.log("scaleCircle = "+scaleCircle +" scaleRadius="+scaleRadius);
return d._children ? scaleCircle*Math.pow(d.childCount1, scaleRadius)// collapsed package
      : d.children ? scaleCircle*Math.pow(d.childCount1, scaleRadius) // expanded package
      : scaleCircle;
     // : 1; // leaf node
}


function childCount1(level, n) {
    count = 0;
    if(n.children && n.children.length > 0) {
      count += n.children.length;
      n.children.forEach(function(d) {
        count += childCount1(level + 1, d);
      });
      n.childCount1 = count;
    }
    else{
       n.childCount1 = 0;
    }
    return count;
};

function childCount2(level, n) {
    var arr = [];
    if(n.children && n.children.length > 0) {
      n.children.forEach(function(d) {
        arr.push(d);
      });
    }
    arr.sort(function(a,b) { return parseFloat(a.childCount1) - parseFloat(b.childCount1) } );
    var arr2 = [];
    arr.forEach(function(d, i) {
        d.order1 = i;
        arr2.splice(arr2.length/2,0, d);
    });
    arr2.forEach(function(d, i) {
        d.order2 = i;
        childCount2(level + 1, d);
        d.idDFS = nodeDFSCount++;   // this set DFS id for nodes
    });

};

d3.select(self.frameElement).style("height", diameter + "px");

/*
function tick(event) {
  link_selection.attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; }); 
  var force_influence = 0.9;
  node_selection
    .each(function(d) {
      d.x += (d.treeX - d.x) * (force_influence); //*event.alpha;
      d.y += (d.treeY - d.y) * (force_influence); //*event.alpha;
    });
 // circles.attr("cx", function(d) { return d.x; })
  //    .attr("cy", function(d) { return d.y; });  
  
}*/


// Toggle children on click.
function click(d) {

}

/*
function collide(alpha) {
  var quadtree = d3.geom.quadtree(tree_nodes);
  return function(d) {
    quadtree.visit(function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== d) && (quad.point !== d.parent) && (quad.point.parent !== d)) {
         var rb = getRadius(d) + getRadius(quad.point),
        nx1 = d.x - rb,
        nx2 = d.x + rb,
        ny1 = d.y - rb,
        ny2 = d.y + rb;

        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y);
          if (l < rb) {
          l = (l - rb) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });
  };
}
*/
`,slider:`
//===============================================
var brush;
var slider;
var handle;
var xScaleSlider;
var xSlider = 3;
var ySlider = 125;
var valueSlider = 30;
var valueMax = 30;
function setupSliderScale(svg) {
  xScaleSlider = d3.scale.linear()
    .domain([0, valueMax])
    .range([xSlider, 120]);

  brush = d3.svg.brush()
    .x(xScaleSlider)
    .extent([valueSlider, valueSlider])
    .on("brush", brushed)
    .on("brushend", brushend);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + ySlider + ")")
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .call(d3.svg.axis()
      .scale(xScaleSlider)
      .ticks(5)
      .orient("bottom")
      .tickFormat(function(d) { return d; })
      .tickSize(0)
      .tickPadding(5))
  .select(".domain")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "halo");

  svg.append("text")
    .attr("class", "sliderText")
    .attr("x", xSlider)
    .attr("y", ySlider-12)
    .attr("dy", ".21em")
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .text("Mentioned together")
    .style("text-anchor","start"); 

  slider = svg.append("g")
    .attr("class", "slider")
    .call(brush);

  slider.selectAll(".extent,.resize")
    .remove();

  slider.select(".background")
    .attr("y",ySlider-5)
    .attr("height", 10);

 handle = slider.append("circle")
    .attr("class", "handle")
    .attr("transform", "translate(0," + ySlider + ")")
    .attr("r", 5)
    .attr("cx", xScaleSlider(valueSlider));
}

function brushed() {
  //console.log("Slider brushed ************** valueSlider="+valueSlider);
  valueSlider = brush.extent()[0];
  if (d3.event.sourceEvent) { // not a programmatic event
    valueSlider = Math.max(xScaleSlider.invert(d3.mouse(this)[0]),0.5);
    valueSlider = Math.min(valueSlider, valueMax);
    brush.extent([valueSlider, valueSlider]);
  }
  handle.attr("cx", xScaleSlider(valueSlider));
  
}
function brushend() {
  // console.log("Slider brushed ************** valueSlider="+valueSlider);
  recompute();
}

`,stream:` // Stream graph******************************************
   

function drawStreamTerm(svg, data_, ymin, ymax) {
    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([ymax, ymin]);

    
    var stack = d3.layout.stack()
        .offset("silhouette")
        .order("inside-out")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.date; })
        .y(function(d) { return d.value; });

    var nest = d3.nest()
        .key(function(d) { return d.key; });

   var layers = stack(nest.entries(data_));
      x.domain(d3.extent(data_, function(d) { return d.monthId; }));
  //    y.domain([0, d3.max(data_, function(d) { return d.yNode+d.y/2; })]);
   y.domain([0, d3.max(data_, function(d) { return d.y0 + d.y; })]);

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return x(d.monthId); })
        .y0(function(d) { return y(d.yNode-d.y/2); })
    //    .y1(function(d) { return y(d.yNode+d.y/2); });
          .y0(function(d) { return y(d.y0); })
          .y1(function(d) { return y(d.y0+d.y); });

      svg.selectAll(".layer2")
          .data(layers)
        .enter().append("path")
          .attr("class", "layer2")
          .attr("d", function(d) { return area(d.values); })
          .style("fill-opacity",1)
          .style("fill", function(d, i) { 
            return getColor(d.values[0].category, d.values[0].max); 
        });    
}          

function drawStreamSource(svg, data_, colorScale, ymin, ymax) {
    if (colorScale == "blue") {
      colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
    }
    else if (colorScale == "pink") {
      colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
    }
    else if (colorScale == "orange") {
      colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
    }
    var z = d3.scale.ordinal()
        .range(colorrange);

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([ymax, ymin]);

    
    var stack = d3.layout.stack()
        .offset("silhouette")
        .order("inside-out")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.date; })
        .y(function(d) { return d.value; });

    var nest = d3.nest()
        .key(function(d) { return d.key; });

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return x(d.monthId); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0+d.y); });

      var layers = stack(nest.entries(data_));
     // debugger;
      x.domain(d3.extent(data_, function(d) { return d.monthId; }));
      y.domain([0, d3.max(data_, function(d) { return d.y0 + d.y; })]);

      svg.selectAll(".layer")
          .data(layers)
        .enter().append("path")
          .attr("class", "layer")
          .attr("d", function(d) { return area(d.values); })
          .style("fill-opacity",1)
          .style("fill", function(d, i) { return z(i); });    
}          `,stopList:`var stopList = {};
stopList.america = 1;
stopList.american = 1;
stopList.republican = 1;`,mainRaw:`//Constants for the SVG
var margin = {top: 0, right: 0, bottom: 5, left: 5};
var width = document.body.clientWidth - margin.left - margin.right;
var height = 780 - margin.top - margin.bottom;

//---End Insert------

//Append a SVG to the body of the html page. Assign this SVG as an object to svg
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
var svg2 = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height-100);

var topTermMode = 0;
//******************* Forced-directed layout    

//Set up the force layout
var force = d3.layout.force()
    .charge(-12)
    //.linkStrength(5)
    .linkDistance(0)
    .gravity(0.01)
    //.friction(0.95)
    .alpha(0.05)
    .size([width, height]);

 var force2 = d3.layout.force()
    .charge(-180)
    .linkDistance(80)
    .gravity(0.15)
    .alpha(0.1)
    .size([width, height]);     

//---Insert-------
var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);

    function dragstart(d, i) {
        force.stop() // stops the force auto positioning before you start dragging
    }

    function dragmove(d, i) {
        d.px += d3.event.dx;
        d.py += d3.event.dy;
        d.x += d3.event.dx;
        d.y += d3.event.dy; 
    }

    function dragend(d, i) {
        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        force.resume();
    }

    function releasenode(d) {
        d.fixed = false; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        //force.resume();
    }


var data, data2;
var firstDate = Date.parse("2005-01-01T00:00:00");
var numSecondADay = 24*60*60;
var numSecondAMonth = 30*numSecondADay;
var minYear = 2006;
var maxYear = 2015;
var numMonth = 12*(maxYear-minYear);

var sourceList = {};
var numSource = {};
var maxCount = {}; // contain the max frequency for 4 categories

var nodes;
var numNode, numNode2;

var link;
var links;
var linkArcs;
var termArray, termArray2, termArray3;
var relationship;
var termMaxMax, termMaxMax2;
var terms;
var NodeG; 
var xStep =100;
//var xScale = d3.time.scale().range([0, (width-xStep-100)/numMonth]);
var yScale;
var linkScale;
var searchTerm ="";

var nodeY_byName = {};

var isLensing = false;
var lensingMul = 5;
var lMonth = -lensingMul*2;
var coordinate = [0,0];
var XGAP_ = 9; // gap between months on xAxis

function xScale(m){
    if (isLensing){
        var numLens = 5;
        var maxM = Math.max(0, lMonth-numLens-1);
        var numMonthInLense = (lMonth+numLens-maxM+1);
        
        //compute the new xGap
        var total= numMonth+numMonthInLense*(lensingMul-1);
        var xGap = (XGAP_*numMonth)/total;
        
        if (m<lMonth-numLens)
            return m*xGap;
        else if (m>lMonth+numLens){
            return maxM*xGap+ numMonthInLense*xGap*lensingMul + (m-(lMonth+numLens+1))*xGap;
        }   
        else{
            return maxM*xGap+(m-maxM)*xGap*lensingMul;
        }  
    }
    else{
       return m*XGAP_; 
    }           
}


var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return xStep+xScale(d.monthId); })
        .y0(function(d) { return d.yNode-yScale(d.value); })
        .y1(function(d) {  return d.yNode +yScale(d.value); });
  
var optArray = [];   // FOR search box

var numberInputTerms =0;
var listMonth;


 var nodes2 = [];
 var links2 = [];
var nodes2List = {};
var links2List = {};

//d3.tsv("data/corpus_ner_geo.tsv", function(error, data_) {
d3.tsv("data/huffington.tsv", function(error, data_) {
//d3.tsv("data/wikinews.tsv", function(error, data_) {
      if (error) throw error;
    data = data_;
    
    terms = new Object();
    termMaxMax = 1;
    data.forEach(function(d) {
        d.source = d["source"];
        // Process date
        var curDate = Date.parse(d["time"]);
        d.date = new Date(d["time"]);
        var year = d.date.getFullYear();
        var m =  12*(year-minYear) + d.date.getMonth();
        d.m = m;
         
        if (year>=minYear && year<=maxYear){
            // Add source to sourceList
            if (!sourceList[d.source])
                sourceList[d.source]=1;
            else
                sourceList[d.source]++;    
        }

        if (d["person"] != ""){
            var list = d["person"].split("|");
            for (var i=0; i<list.length;i++){
                var term = list[i];
                d[term] = 1;
                if (!terms[term]){
                    terms[term] = new Object();
                    terms[term].max = 0;
                    terms[term].maxMonth = -100;   // initialized negative
                    terms[term].category = "person";
                }    
                if (!terms[term][m])
                    terms[term][m] = 1;
                else{
                    terms[term][m] ++;
                    if (terms[term][m]>terms[term].max){
                        terms[term].max = terms[term][m];
                        terms[term].maxMonth = m;
                        if (terms[term].max>termMaxMax)
                            termMaxMax = terms[term].max;
                    }    
                }    
            }
        }

        if (d["location"] != "" && d["location"] != 1){
            var list = d["location"].split("|");
            for (var i=0; i<list.length;i++){
                var term = list[i];
                d[term] = 1;
                if (!terms[term]){
                    terms[term] = new Object();
                    terms[term].max = 0;
                    terms[term].maxMonth = -100;   // initialized negative
                    terms[term].category = "location";
                }    
                if (!terms[term][m])
                    terms[term][m] = 1;
                else{
                    terms[term][m] ++;
                    if (terms[term][m]>terms[term].max){
                        terms[term].max = terms[term][m];
                        terms[term].maxMonth = m;
                        if (terms[term].max>termMaxMax)
                            termMaxMax = terms[term].max;
                        
                    }    
                }    
            }
        }
        if (d["organization"] != "" && d["organization"] != 1){
            var list = d["organization"].split("|");
            for (var i=0; i<list.length;i++){
                var term = list[i];
                d[term] = 1;
                if (!terms[term]){
                    terms[term] = new Object();
                    terms[term].max = 0;
                    terms[term].maxMonth = -100;   // initialized negative
                    terms[term].category = "organization";
                }    
                if (!terms[term][m])
                    terms[term][m] = 1;
                else{
                    terms[term][m] ++;
                    if (terms[term][m]>terms[term].max){
                        terms[term].max = terms[term][m];
                        terms[term].maxMonth = m;
                        if (terms[term].max>termMaxMax)
                            termMaxMax = terms[term].max;
                        
                    }    
                }    
            }
        }
        if (d["miscellaneous"] != "" && d["miscellaneous"] != 1){
            var list = d["miscellaneous"].split("|");
            for (var i=0; i<list.length;i++){
                var term = list[i];
                d[term] = 1;
                if (!terms[term]){
                    terms[term] = new Object();
                    terms[term].max = 0;
                    terms[term].maxMonth = -100;   // initialized negative
                    terms[term].category = "miscellaneous";
                }    
                if (!terms[term][m])
                    terms[term][m] = 1;
                else{
                    terms[term][m] ++;
                    if (terms[term][m]>terms[term].max){
                        terms[term].max = terms[term][m];
                        terms[term].maxMonth = m;
                        if (terms[term].max>termMaxMax)
                            termMaxMax = terms[term].max;
                        
                    }    
                }    
            }
        }
        
    });

    console.log("DONE reading the input file = "+data.length); 

    setupSliderScale(svg);
    
    readTermsAndRelationships();  
    
    drawColorLegend();
    drawTimeLegend();
    drawTimeBox(); // This box is for brushing
    drawLensingButton();

    computeNodes();
    computeLinks();


    force.linkStrength(function(l) {
        if (l.value)
            return (8+l.value*2);
        else 
            return 1;       
    });
    
    force.linkDistance(function(l) {
        if (searchTerm!=""){
            if (l.source.name == searchTerm || l.target.name == searchTerm){
                var order = isContainedInteger(listMonth,l.m)
                return (12*order);  
            }    
            else
                return 0;    
        }
        else{
            if (l.value)
                return 0;
            else 
                return 12;           
        }
    });

    //Creates the graph data structure out of the json data
        force.nodes(nodes)
            .links(links)
            .start();

        force.on("tick", function () {
            update();
        });
        force.on("end", function () {
            detactTimeSeries();
        });

        




        /// The second force directed layout ***********
    for (var i=0;i<nodes.length;i++){
        var nod = nodes[i];
        if (!nodes2List[nod.name] && nodes2List[nod.name]!=0){
            var newNod = {};
            newNod.name = nod.name;
            newNod.id = nodes2.length;
            newNod.group = nod.group;
            newNod.max = nod.max;
            
            nodes2List[newNod.name] = newNod.id;
            nodes2.push(newNod);
        }
    }

    for (var i=0;i<links.length;i++){
        var l = links[i];
        var name1 = l.source.name;
        var name2 = l.target.name;
        var node1 = nodes2[nodes2List[name1]];
        var node2 = nodes2[nodes2List[name2]];
        if (!links2List[name1+"_"+name2] && links2List[name1+"_"+name2]!=0){
            var newl = {};
            newl.source = node1;
            newl.target = node2;
            links2List[name1+"_"+name2] =  links2.length; 
            links2.push(newl); 
        }
    }
    for (var i=0;i<links2.length;i++){
        var name1 = links2[i].source.name;
        var name2 = links2[i].target.name;
        var ccc=0;
        for (var m=0;m<numMonth;m++){
            if (relationship[name1+"__"+name2][m]){
                if (relationship[name1+"__"+name2][m]>valueSlider) //relationship[name1+"__"+name2][m]>ccc && 
                    ccc+=relationship[name1+"__"+name2][m];
            }
         }   
        links2[i].count = ccc;
    }     
    
    

    force2.nodes(nodes2)
        .links(links2)
        .start();    


    var link2 = svg2.selectAll(".link2")
      .data(links2)
    .enter().append("line")
      .attr("class", "link2")
      .style("stroke","#777")
      .style("stroke-width", function(d) { return 0.2+linkScale(d.count); });

    var node2 = svg2.selectAll(".nodeText2")
        .data(nodes2)
        .enter().append("text")
      .attr("class", ".nodeText2")  
            .text(function(d) { return d.name })           
            .attr("dy", ".35em")
            .style("fill", function(d) { return getColor(d.group, d.max) ;})
            .style("text-anchor","middle")
            .style("text-shadow", "1px 1px 0 rgba(55, 55, 55, 0.6")
            .style("font-weight", function(d) { return d.isSearchTerm ? "bold" : ""; })
            .attr("dy", ".21em")
            .attr("font-family", "sans-serif")
            .attr("font-size", "12px"); 

    force2.on("tick", function() {
        link2.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        
        node2.attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; });
    });    

    

    for (var i = 0; i < termArray.length/10; i++) {
        optArray.push(termArray[i].term);
    }
    optArray = optArray.sort();
    $(function () {
        $("#search").autocomplete({
            source: optArray
        });
    });
});

    function recompute() {
        var bar = document.getElementById('progBar'),
            fallback = document.getElementById('downloadProgress'),
            loaded = 0;

        var load = function() {
            loaded += 1;
            bar.value = loaded;

            /* The below will be visible if the progress tag is not supported */
            $(fallback).empty().append("HTML5 progress tag not supported: ");
            $('#progUpdate').empty().append(loaded + "% loaded");

            if (loaded == 100) {
                clearInterval(beginLoad);
                $('#progUpdate').empty().append("Complete");
            }
        };

        var beginLoad = setInterval(function() {load();}, 10);
        setTimeout(alertFunc, 333);
        
        function alertFunc() {
            readTermsAndRelationships();
            computeNodes();
            computeLinks()
            force.nodes(nodes)
                .links(links)
                .start();
        }
    } 

    function readTermsAndRelationships() {
        data2 = data.filter(function (d, i) {
            if (!searchTerm || searchTerm=="" ) {
                return d;
            }
            else if (d[searchTerm])
                return d;
        });

        var selected  ={}
        if (searchTerm && searchTerm!=""){
            data2.forEach(function(d) {
                 for (var term1 in d) {
                    if (!selected[term1])
                        selected[term1] = {};
                    else{
                        if (!selected[term1].isSelected)
                            selected[term1].isSelected = 1;
                        else
                            selected[term1].isSelected ++;
                    }    
               }
            } );
        }

        var removeList = {};   // remove list **************
       // removeList["russia"] =1;
       // removeList["china"] =1;
        
        removeList["barack obama"] =1;
        removeList["john mccain"] =1;
        removeList["mitt romney"] =1;
      //  removeList["hillary clinton"] =1; 
      //  removeList["paul ryan"] =1;
        removeList["sarah palin"] =1;
        removeList["israel"] =1;
        
        
        removeList["source"] =1;
        removeList["person"] =1;
        removeList["location"] =1;
        removeList["organization"] =1;
        removeList["miscellaneous"] =1;

        removeList["muckreads weekly deadly force"] = 1
        removeList["propublica"] =1;
        removeList["white this alabama judge has figured out how"] =1;
        removeList["dea ’s facebook impersonato"] =1;
        removeList["dismantle roe"] =1;
        removeList["huffington post"] =1;
        
        
        termArray = [];
        for (var att in terms) {
            var e =  {};
            e.term = att;
            if (removeList[e.term] || (searchTerm && searchTerm!="" && !selected[e.term])) // remove list **************
                continue;

            var maxNet = 0;
            var maxMonth = -1;
            for (var m=1; m<numMonth;m++){
                if (terms[att][m]){
                    var previous = 0;
                    if (terms[att][m-1])
                        previous = terms[att][m-1];
                    var net = (terms[att][m]+1)/(previous+1);
                    if (net>maxNet){
                        maxNet=net;
                        maxMonth = m;
                    }    
                }
            }
            e.max = maxNet;
            e.maxMonth = maxMonth;
            e.category = terms[att].category;   
            
            if (e.term==searchTerm){
                e.max = 10000;
                e.isSearchTerm = 1;
            }
              
            else if (searchTerm && searchTerm!="" && selected[e.term] && selected[e.term].isSelected){
                e.max = 5000+ selected[e.term].isSelected;
             //   console.log("e.term = "+e.term+" e.max =" +e.max );          
            }    

            if (!e.max && e.max!=0)
                console.log("What the e.term = "+e.term+" e.max =" +e.max );       

            termArray.push(e);
        }
        
        termArray.sort(function (a, b) {
          if (a.max < b.max) {
            return 1;
          }
          if (a.max > b.max) {
            return -1;
          }
          return 0;
        });    

        //if (searchTerm)
        numberInputTerms = termArray.length;
       console.log("numberInputTerms="+numberInputTerms) ; 
 
    // Compute relationship **********************************************************
        numNode = Math.min(80, termArray.length);
        numNode2 = Math.min(numNode*3, termArray.length);
        var selectedTerms = {};
        for (var i=0; i<numNode2;i++){
           selectedTerms[termArray[i].term] = termArray[i].max;
        }
        

        relationship ={};
        relationshipMaxMax =0;
        data2.forEach(function(d) { 
            var year = d.date.getFullYear();
            if (year>=minYear && year<=maxYear){
                var m = d.m;
                for (var term1 in d) {
                    if (selectedTerms[term1]){   // if the term is in the selected 100 terms
                        for (var term2 in d) {
                            if (selectedTerms[term2]){   // if the term is in the selected 100 terms
                                if (!relationship[term1+"__"+term2]){
                                    relationship[term1+"__"+term2] = new Object();
                                    relationship[term1+"__"+term2].max = 1;
                                    relationship[term1+"__"+term2].maxMonth =m;
                                }    
                                if (!relationship[term1+"__"+term2][m])
                                    relationship[term1+"__"+term2][m] = 1;
                                else{
                                    relationship[term1+"__"+term2][m]++;
                                    if (relationship[term1+"__"+term2][m]>relationship[term1+"__"+term2].max){
                                        relationship[term1+"__"+term2].max = relationship[term1+"__"+term2][m];
                                        relationship[term1+"__"+term2].maxMonth =m; 
                                        
                                        if (relationship[term1+"__"+term2].max>relationshipMaxMax) // max over time
                                            relationshipMaxMax = relationship[term1+"__"+term2].max;
                                    }  
                                }    
                            }
                        }
                    }
                }
            }
        });
        debugger;

        console.log("DONE computing realtionships relationshipMaxMax="+relationshipMaxMax);
    }
     
    function computeConnectivity(a, num) {
        for (var i=0; i<num;i++){
            a[i].isConnected=-100;
            a[i].isConnectedMaxMonth= a[i].maxMonth;
        }    
        
        for (var i=0; i<num;i++){
            var term1 =  a[i].term;
            for (var j=i+1; j<num;j++){
                var term2 =  a[j].term;
                if (relationship[term1+"__"+term2] && relationship[term1+"__"+term2].max>=valueSlider){
                    if (relationship[term1+"__"+term2].max> a[i].isConnected){
                        a[i].isConnected = relationship[term1+"__"+term2].max;
                        a[i].isConnectedMaxMonth = relationship[term1+"__"+term2].maxMonth;
                    }    
                    if (relationship[term1+"__"+term2].max> a[j].isConnected){
                        a[j].isConnected = relationship[term1+"__"+term2].max;
                        a[j].isConnectedMaxMonth = relationship[term1+"__"+term2].maxMonth;
                    }  
                }
                else if (relationship[term2+"__"+term1] && relationship[term2+"__"+term1].max>=valueSlider){
                    if (relationship[term2+"__"+term1].max>a[i].isConnected){
                        a[i].isConnected = relationship[term2+"__"+term1].max;
                        a[i].isConnectedMaxMonth = relationship[term1+"__"+term2].maxMonth;
                    }
                    if (relationship[term2+"__"+term1].max>a[j].isConnected){
                        a[j].isConnected = relationship[term2+"__"+term1].max;
                        a[j].isConnectedMaxMonth = relationship[term1+"__"+term2].maxMonth;
                    }    
                }
                 //if (term2=="beijing")
                 //   console.log(term2+" "+a[j].isConnectedMaxMonth);
            }
           
        }
       
    }    

    function computeNodes() {
       
        // check substrings of 100 first terms
        console.log("termArray.length = "+termArray.length);
        
        for (var i=0; i<numNode2;i++){
          for (var j=0; j<numNode2;j++){
                if (i==j) continue;
                if (termArray[j].term.indexOf(termArray[i].term)>-1)
                    termArray[i].isSubtring = 1;
            } 
        }
        
        termArray2 = [];
        for (var i=0; i<numNode2;i++){
            if (termArray.length<numberInputTerms/3 || !termArray[i].isSubtring)  // only remove substring when there are too many of them
                termArray2.push(termArray[i])
        }
        console.log("termArray2.length = "+termArray2.length);
        

        computeConnectivity(termArray2, termArray2.length);

        
        termArray3 = [];
        for (var i=0; i<termArray2.length;i++){
            if (termArray2[i].isSearchTerm || termArray2[i].isConnected>0)
                termArray3.push(termArray2[i]);
        }
        console.log("termArray3.length = "+termArray3.length);
        

        termArray3.sort(function (a, b) {
         if (a.isConnected < b.isConnected) {
            return 1;
          }
          else if (a.isConnected > b.isConnected) {
            return -1;
          }
          else{
                if (a.max < b.max) {
                    return 1;
                }
                if (a.max > b.max) {
                    return -1;
                }
                return 0;
            }
        });    


        computeConnectivity(termArray3, termArray3.length);

        nodes = [];
        for (var i=0; i<termArray3.length;i++){
            var nod = new Object();
            nod.id = i;
            nod.group = termArray3[i].category;
            nod.name = termArray3[i].term;
            nod.max = termArray3[i].max;
            var maxMonthRelationship = termArray3[i].maxMonth;
            nod.isConnectedMaxMonth = termArray3[i].isConnectedMaxMonth;
            nod.maxMonth = termArray3[i].isConnectedMaxMonth;
            nod.month = termArray3[i].isConnectedMaxMonth;
            nod.x=xStep+xScale(nod.month);   // 2016 initialize x position
            nod.y=height/2;
            if (nodeY_byName[nod.name]!=undefined)
                nod.y = nodeY_byName[nod.name];
            
            if (termArray3[i].isSearchTerm){
                nod.isSearchTerm =1;
                if (!nod.month)
                    nod.month = termArray3[i].maxMonth;
                if (!nod.isConnectedMaxMonth)
                    nod.isConnectedMaxMonth = termArray3[i].maxMonth;
            }    
            
            if (!maxCount[nod.group] || nod.max>maxCount[nod.group])
                maxCount[nod.group] = nod.max;
            
            if (termArray3[i].isConnected>0)  // Only allow connected items
                nodes.push(nod);
            if (i>numNode)
                break;
        }
        numNode = nodes.length;
        
        console.log("numNode="+numNode);
        

        // compute the monthly data      
        termMaxMax2 = 0;
        for (var i=0; i<numNode; i++){
            nodes[i].monthly = [];
            for (var m=0; m<numMonth; m++){
                var mon = new Object();
                if (terms[nodes[i].name][m]){
                    mon.value = terms[nodes[i].name][m];
                    if (mon.value >termMaxMax2)
                         termMaxMax2 = mon.value ;
                    mon.monthId = m;
                    mon.yNode = nodes[i].y;
                    nodes[i].monthly.push(mon);
                }
            }
            // Add another item to first
            if (nodes[i].monthly.length>0){
               var firstObj = nodes[i].monthly[0];
               if (firstObj.monthId>0){
                    var mon = new Object();
                    mon.value = 0;
                    mon.monthId = firstObj.monthId-1;
                    mon.yNode = firstObj.yNode;
                    nodes[i].monthly.unshift(mon);
               }

                // Add another item
               var lastObj = nodes[i].monthly[nodes[i].monthly.length-1];
               if (lastObj.monthId<numMonth-1){
                    var mon = new Object();
                    mon.value = 0;
                    mon.monthId = lastObj.monthId+1;
                    mon.yNode = lastObj.yNode;
                    nodes[i].monthly.push(mon);
               }
            }
        } 


        // Construct an array of only parent nodes
        pNodes = new Array(numNode); //nodes;
        for (var i=0; i<numNode;i++){
            pNodes[i] = nodes[i];
        }
        
     //   drawStreamTerm(svg, pNodes, 100, 600) ;

        svg.selectAll(".layer").remove();
        svg.selectAll(".layer")
              .data(pNodes)
              .enter().append("path")
              .attr("class", "layer")
              .style("stroke", function(d) { return d.isSearchTerm ? "#000" : "#000"; })
              .style("stroke-width",0.05)
              .style("stroke-opacity",0.5)
              .style("fill-opacity",1)
              .style("fill", function(d, i) { 
                return getColor(d.group, d.max); 
            });
        
          
    }    

    function computeLinks() {
        links = [];
        relationshipMaxMax2 =1;
        
       for (var i=0; i<numNode;i++){
            var term1 =  nodes[i].name;
            for (var j=i+1; j<numNode;j++){
                var term2 =  nodes[j].name;
                if (relationship[term1+"__"+term2] && relationship[term1+"__"+term2].max>=valueSlider){
                    for (var m=1; m<numMonth;m++){
                        if (relationship[term1+"__"+term2][m] && relationship[term1+"__"+term2][m]>=valueSlider){
                            var sourceNodeId = i;
                            var targetNodeId = j;
                            
                            if (!nodes[i].connect)
                                nodes[i].connect = new Array();
                            nodes[i].connect.push(j)
                            if (!nodes[j].connect)
                                nodes[j].connect = new Array();
                            nodes[j].connect.push(i)

                            if (m != nodes[i].maxMonth){
                                if (isContainedChild(nodes[i].childNodes,m)>=0){  // already have the child node for that month
                                    sourceNodeId =  nodes[i].childNodes[isContainedChild(nodes[i].childNodes,m)];
                                }  
                                else{  
                                    var nod = new Object();
                                    nod.id = nodes.length;
                                    nod.group = nodes[i].group;
                                    nod.name = nodes[i].name;
                                    nod.max = nodes[i].max;
                                    nod.maxMonth = nodes[i].maxMonth;
                                    nod.month = m;
                                    
                                    nod.parentNode = i;   // this is the new property to define the parent node
                                    if (!nodes[i].childNodes)
                                         nodes[i].childNodes = new Array();
                                    nodes[i].childNodes.push(nod.id);
                                    
                                    sourceNodeId = nod.id;
                                    nodes.push(nod);
                                }
                            }
                            if (m != nodes[j].maxMonth){
                                if (isContainedChild(nodes[j].childNodes,m)>=0){
                                    targetNodeId = nodes[j].childNodes[isContainedChild(nodes[j].childNodes,m)];
                                }
                                else{    
                                    var nod = new Object();
                                    nod.id = nodes.length;
                                    nod.group = nodes[j].group;
                                    nod.name = nodes[j].name;
                                    nod.max = nodes[j].max;
                                    nod.maxMonth = nodes[j].maxMonth;
                                    nod.month = m;
                                    
                                    nod.parentNode = j;   // this is the new property to define the parent node
                                     if (!nodes[j].childNodes)
                                         nodes[j].childNodes = new Array();
                                    nodes[j].childNodes.push(nod.id);
                                    
                                    targetNodeId = nod.id;
                                    nodes.push(nod);
                                }    
                            }
                            
                            var l = new Object();
                            l.source = sourceNodeId;
                            l.target = targetNodeId;
                            l.m = m; 
                            //l.value = linkScale(relationship[term1+"__"+term2][m]); 
                            links.push(l);
                            if (relationship[term1+"__"+term2][m] > relationshipMaxMax2)
                                relationshipMaxMax2 = relationship[term1+"__"+term2][m];
                        }
                    }
                }
            }
        }
        
       // var linear = (150+numNode)/200;
        var hhh = Math.min(height/numNode,20);
        
        yScale = d3.scale.linear()
            .range([0, hhh*1.25])
            .domain([0, termMaxMax2]);
        linkScale = d3.scale.linear()
            .range([0.5, 2])
            .domain([Math.round(valueSlider)-0.4, Math.max(relationshipMaxMax2,10)]);  

        links.forEach(function(l) { 
            var term1 = nodes[l.source].name;
            var term2 = nodes[l.target].name;
            var month = l.m;
            l.value = linkScale(relationship[term1+"__"+term2][month]); 
        }  );  

        console.log("DONE links relationshipMaxMax2="+relationshipMaxMax2);

        //Create all the line svgs but without locations yet
        svg.selectAll(".linkArc").remove();
        linkArcs = svg.append("g").selectAll("path")
        .data(links)
        .enter().append("path")
        .attr("class", "linkArc")
        .style("stroke-width", function (d) {
            return d.value;
        });   

        svg.selectAll(".nodeG").remove();
        nodeG = svg.selectAll(".nodeG")
            .data(pNodes).enter().append("g")
            .attr("class", "nodeG")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")"
            })
         /*
        nodeG.append("circle")
            .attr("class", "node")
            .attr("r", function(d) { return Math.sqrt(d.max) })
            .style("fill", function (d) {return getColor(d.group, d.max);})
            .on('dblclick', releasenode)
            .call(node_drag); //Added
        */
     // console.log("  nodes.length="+nodes.length) ; 
          
        svg.selectAll(".nodeText").remove();
        nodeG.append("text")
            .attr("class", ".nodeText")           
            .attr("dy", ".35em")
            .style("fill", "#000000")   
            .style("text-anchor","end")
            .style("text-shadow", "1px 1px 0 rgba(255, 255, 255, 0.6")
            .style("font-weight", function(d) { return d.isSearchTerm ? "bold" : ""; })
            .attr("dy", ".21em")
            .attr("font-family", "sans-serif")
            .attr("font-size", function(d) { return d.isSearchTerm ? "12px" : "11px"; })
            .text(function(d) { return d.name });  
        nodeG.on('mouseover', mouseovered)
               .on("mouseout", mouseouted); 

          // console.log("gggg**************************"+searchTerm);
        listMonth = [];
        links.forEach(function(l) { 
            if (searchTerm!=""){
                if (nodes[l.source].name == searchTerm || nodes[l.target].name == searchTerm){
                    if (isContainedInteger(listMonth,l.m)<0)
                        listMonth.push(l.m);
                }
            }    
        }); 
        listMonth.sort(function (a, b) {
          if (a > b) {
            return 1;
          }
          else if (a < b) {
            return -1;
          }
          else
            return 0;
        });    
         
    }    


$('#btnUpload').click(function() {
    var bar = document.getElementById('progBar'),
        fallback = document.getElementById('downloadProgress'),
        loaded = 0;

    var load = function() {
        loaded += 1;
        bar.value = loaded;

        /* The below will be visible if the progress tag is not supported */
        $(fallback).empty().append("HTML5 progress tag not supported: ");
        $('#progUpdate').empty().append(loaded + "% loaded");

        if (loaded == 100) {
            clearInterval(beginLoad);
            $('#progUpdate').empty().append("Upload Complete");
            console.log('Load was performed.');
        }
    };

    var beginLoad = setInterval(function() {
        load();
    }, 50);

});

function mouseovered(d) {
    if (force.alpha()==0) {
        var list = new Object();
        list[d.name] = new Object();

        svg.selectAll(".linkArc")
            .style("stroke-opacity" , function(l) {  
                if (l.source.name==d.name){
                    if (!list[l.target.name]){
                        list[l.target.name] = new Object();
                        list[l.target.name].count=1; 
                        list[l.target.name].year=l.m;  
                        list[l.target.name].linkcount=l.count;    
                    }    
                    else{
                        list[l.target.name].count++; 
                        if (l.count>list[l.target.name].linkcount){
                            list[l.target.name].linkcount = l.count;
                            list[l.target.name].year=l.m;  
                        }
                    }    
                    return 1;
                }  
                else if (l.target.name==d.name){
                    if (!list[l.source.name]){
                        list[l.source.name] = new Object();
                        list[l.source.name].count=1; 
                        list[l.source.name].year=l.m;  
                        list[l.source.name].linkcount=l.count;  
                    }    
                    else{
                        list[l.source.name].count++; 
                        if (l.count>list[l.source.name].linkcount){
                            list[l.source.name].linkcount = l.count;
                            list[l.source.name].year=l.m;  
                        } 
                    }    
                    return 1;
                }    
                else
                  return 0.01;  
        });
        nodeG.style("fill-opacity" , function(n) {  
            if (list[n.name])
                return 1;
            else
              return 0.1;  
            })
            .style("font-weight", function(n) { return d.name==n.name ? "bold" : ""; })  
        ;

       nodeG.transition().duration(500).attr("transform", function(n) {
            if (list[n.name] && n.name!=d.name){
                var newX =xStep+xScale(list[n.name].year);
                return "translate(" + newX + "," + n.y + ")"
            }
            else{
                return "translate(" + n.xConnected + "," + n.y + ")"
            }
        })
        svg.selectAll(".layer")
            .style("fill-opacity" , function(n) {  
                if (list[n.name])
                    return 1;
                else
                  return 0.1;  
            })
            .style("stroke-opacity" , function(n) {  
                if (list[n.name])
                    return 1;
                else
                  return 0;  
            });
    }                 
}
function mouseouted(d) {
    if (force.alpha()==0) {
        nodeG.style("fill-opacity" , 1);
        svg.selectAll(".layer")
            .style("fill-opacity" ,1)
            .style("stroke-opacity" , 0.5);
        svg.selectAll(".linkArc")
            .style("stroke-opacity" , 1);    
        nodeG.transition().duration(500).attr("transform", function(n) {
            return "translate(" +n.xConnected + "," + n.y + ")"
        })   
    }      
}


function searchNode() {
    searchTerm = document.getElementById('search').value;
    valueSlider =2;
    handle.attr("cx", xScaleSlider(valueSlider));   
    
    recompute();
}

   


    // check if a node for a month m already exist.
    function isContainedChild(a, m) {
        if (a){
            for (var i=0; i<a.length;i++){
                var index = a[i];
                if (nodes[index].month==m)
                    return i;
            }
        }
        return -1;
    }

    // check if a node for a month m already exist.
    function isContainedInteger(a, m) {
        if (a){
            for (var i=0; i<a.length;i++){
                if (a[i]==m)
                    return i;
            }
        }
        return -1;
    }

    function linkArc(d) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy)/2;
        if (d.source.y<d.target.y )
            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        else
            return "M" + d.target.x + "," + d.target.y + "A" + dr + "," + dr + " 0 0,1 " + d.source.x + "," + d.source.y;
    }

    function update(){
        nodes.forEach(function(d) {
            // if (searchTerm!="")
            //    d.x += (xScale(d.month)-d.x)*0.1;
            //else
            //     d.x += (xScale(d.month)-d.x)*0.005;
            d.x += (width/2-d.x)*0.005;
           
            if  (d.parentNode>=0){
                d.y += (nodes[d.parentNode].y- d.y)*0.5;
              // d.y = nodes[d.parentNode].y;
            } 
            else if (d.childNodes){
                var yy = 0;
                for (var i=0; i< d.childNodes.length;i++){
                    var child = d.childNodes[i];
                    yy += nodes[child].y;
                }
                if (d.childNodes.length>0){
                    yy = yy/d.childNodes.length; // average y coordinate
                    d.y += (yy-d.y)*0.2;
                }
            }
        });    

        if (document.getElementById("checkbox1").checked){
             linkArcs.style("stroke-width", 0);
            
             nodeG.transition().duration(500).attr("transform", function(d) {
                return "translate(" + 200 + "," + d.y + ")"
            })
            svg.selectAll(".nodeText").style("text-anchor","start")
        
        }
        else{
            nodeG.attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")"
            })
            linkArcs.style("stroke-width", function (d) {
                return d.value;
            });
         }   

        svg.selectAll(".layer")
            .attr("d", function(d) { 
                for (var i=0; i<d.monthly.length; i++){
                    d.monthly[i].yNode = d.y;     // Copy node y coordinate
                }
               return area(d.monthly); 
            });
        linkArcs.attr("d", linkArc);
       // if (force.alpha()<0.03)
       //     force.stop();

       updateTimeLegend();       
    } 

    function updateTransition(durationTime){
        nodes.forEach(function(d) {
           d.x=xStep+xScale(d.month);
            if (d.parentNode>=0){
                d.y= nodes[d.parentNode].y;
            }
            nodeY_byName[d.name]=d.y;      
        });    


        nodeG.transition().duration(durationTime).attr("transform", function(d) {
           d.xConnected=xStep+xScale(d.isConnectedMaxMonth);
           return "translate(" + d.xConnected + "," + d.y + ")"
        })
         
        /*
        nodeG.style("fill" , function(d) {  
            var color = nodes.forEach(function(node) {
                if (d.name == node.name && d.month!=node.month ){
                    console.log("d.name="+d.name +" node.name="+node.name);
                    console.log("d.month="+d.month +" node.month="+node.month);
                    return "#f0f";
                }      
                else
                    return "#000";
            }); 
            return "#00f";  
        });*/

        /*nodeG.forEach(function(d) {
           d.xConnected=xStep+xScale(d.isConnectedMaxMonth);
        });*/

        /*
        nodeG.attr("transform", function(d) {
            var step = 0;
            d.step=0;
            nodes.forEach(function(node) {
                if (d.name == node.name && d.month!=node.month && node.x<d.x && d.x<node.x+100){
                    d.step=-5000;
                }
            });       
            return "translate(" + (d.x+d.step) + "," + d.y + ")";
        });*/

        svg.selectAll(".layer").transition().duration(durationTime)
          .attr("d", function(d) { 
            for (var i=0; i<d.monthly.length; i++){
                d.monthly[i].yNode = d.y;     // Copy node y coordinate
            }
           return area(d.monthly); }) ;
        linkArcs.transition().duration(250).attr("d", linkArc);     
        updateTimeLegend();
        updateTimeBox(durationTime);
    }    

    function detactTimeSeries(){
       // console.log("DetactTimeSeries ************************************" +data);
        var termArray = [];
        for (var i=0; i< numNode; i++) {
            var e =  {};
            e.y = nodes[i].y;
            e.nodeId = i;
            termArray.push(e);
        }

        termArray.sort(function (a, b) {
          if (a.y > b.y) {
            return 1;
          }
          if (a.y < b.y) {
            return -1;
          }
          return 0;
        });  

        var step = Math.min((height-25)/(numNode+1),15);
        //var totalH = termArray.length*step;
        for (var i=0; i< termArray.length; i++) {
            nodes[termArray[i].nodeId].y = 12+i*step;
        }
        force.stop();

        updateTransition(1000);
}


`};function f(e,t){let n=u(t,d),r=document.createElement(`iframe`);r.srcdoc=n,r.style.cssText=`border:0;width:100%;height:100%;display:block`,e.appendChild(r)}function p(e){let t=u(e,d);document.documentElement.innerHTML=t}e.mount=f,e.mountInBody=p});