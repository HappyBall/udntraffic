$(document).ready(function(){
	var s5_btn_selected = "number";

	// init slider
	$('#map-slider').noUiSlider({
		start: 103,
		connect: "lower",
		orientation: "horizontal",
		range: {
			'min': 94,
			'max': 103
		},
		step: 1
	});

	// $("#s5-map-btn").tooltip();

	// init map
	d3.json("data/tw_county_topo_fill.json", function (data) {
		

		for (var i = 0; i < data["objects"]["layer1"]["geometries"].length; i++) {
			
			if(data["objects"]["layer1"]["geometries"][i]["properties"]["COUNTYNAME"] == "桃園市"){

				data["objects"]["layer1"]["geometries"][i]["properties"]["COUNTYNAME"] = "桃園縣";				

			};

		};	

		topo = topojson.feature(data, data.objects.layer1);
		prjScale = 0;

		prj = d3.geo.mercator().center([120.971864, 23.960998])
	    	.scale(7500).translate([230, 225]);
	  	path = d3.geo.path().projection(prj);
		width = 456;
		// height = 640;
		height = 530;

		blocks = d3.select("svg#s5-svg")
	           .attr("width",width)
	           .attr("height", height)
	           //.on("click", function(d){
	            //console.log("svg clicked");
	            //if (zoomedInCounty) {
	              //console.log("gotta zoom out");
	            //};
	           //})
	          .append("g")
	           .attr("id","map-g")
	           .selectAll("path").data(topo.features).enter()
	          .append("path")
	           .attr("d",path)
	           .attr("class", "block")
	           .attr("fill", "none")
	           .attr("stroke", "rgba(255,255,255,0.5)")
	           .attr("stroke-width",function(d){
	           		// console.log(d);
	           		return "1.5";
				})
	           .on("mouseover", function(d){
	           	// console.log(d.properties.COUNTYNAME);
	           });

		window.currentSliderYear = 103;
	    d3.csv("data/death_county.csv", function(deathData){
	    	d3.csv("data/death_rate_county.csv", function(deathRateData){

	    		//array recording which county's circle has been drawn. 
	    		var foundCounties = [];
	    		circleFeatures = [];
	    		//avoiding circles to be drawn on small islands
	    		for (var f = 0; f < topo.features.length; f++) {

	    			// console.log(topo.features[f]["properties"]);

	    			if (foundCounties.indexOf(topo.features[f]["properties"]["COUNTYNAME"]) == -1) {

	    				//avoid Taidong island
	    				if (topo.features[f]["properties"]["COUNTYSN"]=="10014065") {continue;};
	    				//avoid YiLan island
	    				if (topo.features[f]["properties"]["COUNTYSN"]=="10002046") {continue;};
	    				//avoid pingdon island
	    				if (topo.features[f]["properties"]["COUNTYSN"]=="10013002") {continue;};

	    				foundCounties.push(topo.features[f]["properties"]["COUNTYNAME"]);
	    				circleFeatures.push(topo.features[f]);	
	    			};
	    		};

	    		//turn the data into circle radius
				var data2Radius = d3.scale.linear().domain([0, 354]).range([0, 62]);
				var rateData2Radius = d3.scale.linear().domain([0, 35.1]).range([0, 62]);

				// var circle = d3.select("svg#s5-svg").select("#map-g").selectAll("circle")
				var circleGroups = d3.select("svg#s5-svg").select("#map-g").selectAll("g.circle-group")
					.data(circleFeatures).enter()
				  	 .append("g")
					.attr("class", "circle-group")
					.each(function(it) {

						// console.log(it.properties);
						var deathVal = parseFloat(deathData[9][it["properties"]["COUNTYNAME"]]);
						if (!deathVal) {
							it.properties.r = 0;
						}else{
							it.properties.r = data2Radius(deathData[9][it["properties"]["COUNTYNAME"]]);	
						}

						it.properties.raw = deathData[9][it["properties"]["COUNTYNAME"]];
				    	it.properties.c = path.centroid(it);
				    	it.properties.x = 400;
				    	it.properties.y = 300;

				    });


				circleGroups.append("circle")
					.each(function(it){

						//init the tip
						var circleTip = d3.tip().attr("class", "circle-tip bar-tip").html(function(it){
							var unit = "";
							if ($("#content-index").text() == "死亡人數") {
								unit = "人";
							}else{
								unit = "%";
							}
				    		return it.properties.COUNTYNAME + "<br>" + it.properties.raw + unit;
				    	});

						
						d3.select(d3.select(this).node().parentNode).call(circleTip);
						d3.select(this).on("mouseover", function(it){
							// console.log(it.properties.COUNTYNAME);
							// console.log( d3.select(this).attr("fill") );
							if ($("#content-index").text() == "死亡率") {
								d3.select(this).attr("fill", "rgba(187, 234, 139, 1)").attr("stroke", 2);
							}else{
								d3.select(this).attr("fill", "rgba(86, 210, 239, 1)").attr("stroke", 2);	
							}

							if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
							    // Do Firefox-related activities
								circleTip.offset(function(d){
									// console.log(rect.getBBox());
									return [-350, 0];
								});
							}

							circleTip.show(it);
						})
						.on("mouseout", function(it){

							if ($("#content-index").text() == "死亡率") {
								d3.select(this).attr("fill", "rgba(187, 234, 139, 0.7)").attr("stroke", 0);
							}else{
								d3.select(this).attr("fill", "rgba(86, 210, 239, 0.7)").attr("stroke", 0);
							}
							circleTip.hide();
						});

					})
					.attr("cx",function(it) { return it.properties.x + it.properties.c[0] - 400; })
					.attr("cy",function(it) { return it.properties.y + it.properties.c[1] - 300; })
					.attr("r", function(it) { return it.properties.r; })
					.attr("fill", "rgba(86, 210, 239, 0.7)")
					.attr("stroke", "#ffffff")
					.attr("stroke-width", 0);

				forceNodes = [];
			    for(i = 0 ; i < circleFeatures.length ; i++ ) {
			      // if(circleFeatures[i].properties.value != 0)
			        forceNodes.push(circleFeatures[i].properties);
			    }

			    addTextToTopThree(deathData, deathRateData, data2Radius, rateData2Radius );

				force = d3.layout.force().gravity(3.0).size([800,600]).charge(-1).nodes(forceNodes);

			    force.on("tick", function() {
			      for(i = 0 ; i < circleFeatures.length ; i++) {
			        for(j = 0 ; j < circleFeatures.length ; j++) { 
			          it = circleFeatures[i].properties; 
			          jt = circleFeatures[j].properties; 
			          if(i==j) continue; 
			          // not collide with self 
			          r = it.r + jt.r; 
			          // it.c is the centroid of each county and initial position of circle 
			          itx = it.x + it.c[0]; ity = it.y + it.c[1]; jtx = jt.x + jt.c[0]; jty = jt.y + jt.c[1]; 
			          // distance between centroid of two circles 
			          d = Math.sqrt((itx - jtx) * (itx - jtx) + (ity - jty) * (ity - jty)) ; 
			          if(r > d) { 
			            // there's a collision if distance is smaller than radius
			            dr = ( r - d ) / ( d * 1 );
			            it.x = it.x + ( itx - jtx ) * dr;
			            // console.log(( itx - jtx ) * dr );
			            it.y = it.y + ( ity - jty ) * dr;
			            // console.log(( ity - jty ) * dr);
			            // console.log("==========================");
			          }
			        }
			      }
			      /*circleGroups.attr("transform", function(it){
			      	return "translate(" + (it.properties.x - it.properties.r) + "," + (it.properties.y - it.properties.r) + ")" 
			      });*/

			      circleGroups.selectAll("circle")
			      		.attr("cx",function(it) { return it.properties.x + it.properties.c[0] - 400; })
			        	.attr("cy",function(it) { return it.properties.y + it.properties.c[1] - 300; });

			    })
				.on("end", function(){

					// console.log("the function ends here");

					var refData, refScale;
					if ($("#content-index").text() == "死亡人數") {
						refData = deathData;
						refScale = data2Radius;
					}else{
						refData = deathRateData;
						refScale = rateData2Radius;
					}
						
					var targetYearIdx = parseInt($("#map-slider").val() - 94);

					var tempArr = [];
					for (county in refData[targetYearIdx]) {
						// console.log(county);
						if (county == ""){
							// console.log("dude");
							continue;
						}else{
							// console.log(refData[targetYearIdx][county]);
							tempArr.push({
								"c_n": county,
								"val": refData[targetYearIdx][county]!="-"?parseFloat(refData[targetYearIdx][county]):0
							});
						}
					};

					tempArr = tempArr.sort(function(a,b){
						return b["val"] - a["val"];
					}).slice(0,3).map(function(c){
						return c["c_n"];
					});

					// console.log(tempArr);
					d3.select("#s5-svg").selectAll("circle").each(function(it){

						if ( tempArr.indexOf(it.properties.COUNTYNAME)!= -1 ) {
							// console.log("found something");
						};
					});


				});
			    
			    force.start();

			    $("#map-slider").on({
			    	slide: function(){
					// set: function(){
						// console.log("slide to year: " + $("#map-slider").val());

						d3.select("#s5-svg").selectAll(".circle-group").selectAll("text").remove();
						//the data ref, changes when arrow button clicked
						//sometimes death count, sometimes death rate.
						var refData, refScale;
						if ($("#content-index").text() == "死亡人數") {
							refData = deathData;
							refScale = data2Radius;
						}else{
							refData = deathRateData;
							refScale = rateData2Radius;
						}

						var targetYearIdx = parseInt($("#map-slider").val() - 94);

						var circles = d3.select("svg#s5-svg").select("#map-g").selectAll("circle")
							.each(function(it) {

								// console.log(it.properties.COUNTYNAME);
								var deathVal = parseFloat(refData[targetYearIdx][it["properties"]["COUNTYNAME"]]);
								if (!deathVal) {
									it.properties.r = 0;
								}else{
									it.properties.r = refScale(refData[targetYearIdx][it["properties"]["COUNTYNAME"]]);	
								}
								it.properties.raw = refData[targetYearIdx][it["properties"]["COUNTYNAME"]];
						    	it.properties.c = path.centroid(it);
						    	it.properties.x = 400;
						    	it.properties.y = 300;

						    })

						    // .transition().duration(500)
						    .attr("cx",function(it) { return it.properties.x + it.properties.c[0] - 400; })
							.attr("cy",function(it) { return it.properties.y + it.properties.c[1] - 300; })
							.transition().duration(200)
							.attr("r", function(it) { return it.properties.r; });

						/*for (var i = 0; i < 200; i++) {
							force.tick();
						};*/
						force.start();
						
						//set the display year
						$("#map-current-year").text(parseInt($("#map-slider").val()) + "年");							
					},
					set: function(){

						var refData, refScale;
						if ($("#content-index").text() == "死亡人數") {
							refData = deathData;
							refScale = data2Radius;
						}else{
							refData = deathRateData;
							refScale = rateData2Radius;
						}
						

						var targetYearIdx = parseInt($("#map-slider").val() - 94);

						// console.log("=====================");
						// console.log(refData[targetYearIdx]);

						var tempArr = [];
						for (county in refData[targetYearIdx]) {
							// console.log(county);
							if (county == ""){
								// console.log("dude");
								continue;
							}else{
								// console.log(refData[targetYearIdx][county]);
								tempArr.push({
									"c_n": county,
									"val": refData[targetYearIdx][county]!="-"?parseFloat(refData[targetYearIdx][county]):0
								});
							}
						};

						tempArr = tempArr.sort(function(a,b){
							return b["val"] - a["val"];
						}).slice(0,3).map(function(c){
							return c["c_n"];
						});

						addTextToTopThree(deathData, deathRateData, data2Radius, rateData2Radius );

						// console.log(tempArr);

					}
				});

				// init btn
				$(".s5-map-btn").click(function(){

					var dir = $(this).attr("dir");

					if(dir !== s5_btn_selected){

						s5_btn_selected = dir;

						if ( dir == "percentage") {
							//change data to rate
							// $(this).addClass("s5-btn-left");
							// $(this).attr("dir", "percentage");
							// $(this).attr("data-original-title", "看死亡人數");
							//
							$("#content-index").text("死亡率");
							$("#content-index").removeClass("index-death").addClass("index-death-rate");
							$(this).css('opacity', '1');
							$('#s5-map-btn-num').css('opacity', '0.5');
							// $(this).find('img').attr('src', 'img/number.png');


						}else{

							//change data back to death count
							// $(this).removeClass("s5-btn-left");
							// $(this).attr("dir", "number");
							// $(this).attr("data-original-title", "看死亡率");

							$("#content-index").text("死亡人數");
							$("#content-index").removeClass("index-death-rate").addClass("index-death");
							$(this).css('opacity', '1');
							$('#s5-map-btn-percent').css('opacity', '0.5');
							// $(this).find('img').attr('src', 'img/percentage.png');

						}

						var refData, refScale, refColor;
						if ($("#content-index").text() == "死亡人數") {
							refData = deathData;
							refScale = data2Radius;
							refColor = "rgba(86, 210, 239, 0.7)";
						}else{
							refData = deathRateData;
							refScale = rateData2Radius;
							refColor = "rgba(187, 234, 139, 0.7)";
						}

						var targetYearIdx = parseInt($("#map-slider").val() - 94);
						var circles = d3.select("svg#s5-svg").select("#map-g").selectAll("circle")
							.each(function(it) {
								// console.log(it.properties);
								var deathVal = parseFloat(refData[targetYearIdx][it["properties"]["COUNTYNAME"]]);
								if (!deathVal) {
									it.properties.r = 0;
								}else{
									it.properties.r = refScale(refData[targetYearIdx][it["properties"]["COUNTYNAME"]]);
									it.properties.raw = refData[targetYearIdx][it["properties"]["COUNTYNAME"]];
								}
						    	it.properties.c = path.centroid(it);
						    	it.properties.x = 400;
						    	it.properties.y = 300;
						    })
						    // .transition().duration(500)
						    .attr("cx",function(it) { return it.properties.x + it.properties.c[0] - 400; })
							.attr("cy",function(it) { return it.properties.y + it.properties.c[1] - 300; })
							.attr("fill", refColor)
							.transition().duration(200)
							.attr("r", function(it) { return it.properties.r; });

						force.start();
						addTextToTopThree(deathData, deathRateData, data2Radius, rateData2Radius );

					}


				});



	    	});
	    });

		

    });//d3.json




});



function addTextToTopThree(deathData, deathRateData, data2Radius, rateData2Radius){

	
	// console.log("....");
	d3.select("#s5-svg").selectAll(".circle-group").selectAll("text").remove();


	var refData, refScale;
	if ($("#content-index").text() == "死亡人數") {
		refData = deathData;
		refScale = data2Radius;
	}else{
		refData = deathRateData;
		refScale = rateData2Radius;
	}
						
	var targetYearIdx = parseInt($("#map-slider").val() - 94);

	var tempArr = [];
	for (county in refData[targetYearIdx]) {
		if (county == ""){
		// console.log("dude");
			continue;
		}else{

			if (isNaN(refData[targetYearIdx][county])) {
				continue;
			}
			tempArr.push({
							"c_n": county,
							"val": refData[targetYearIdx][county]!="-"?parseFloat(refData[targetYearIdx][county]):0
						});
		}
	};



	tempArr = tempArr.sort(function(a,b){
				return b["val"] - a["val"];
			});

	// console.log(tempArr);

	tempArr = tempArr.slice(0,3).map(function(c){
				return c["c_n"];
			});
	

	// console.log(tempArr);

	setTimeout(function(){
		d3.select("#s5-svg").selectAll("circle").each(function(it){
			if ( tempArr.indexOf(it.properties.COUNTYNAME)!= -1 ) {

				var unit = "";
				if ($("#content-index").text() == "死亡人數") {
					unit = "人";
				}else{
					unit = "%";
				}

				var marginTop = 15;

				d3.select(d3.select(this).node().parentNode)
			     .append("text")
			     	.text(function(it){
			     		return it.properties.COUNTYNAME + "";
			     	})
			     	.attr("dx", function(it){
			     		// console.log(this.getBBox().width);
			     		var textAlignWidth = this.getBBox().width/2;
			     		return it.properties.x + it.properties.c[0] - 400 - textAlignWidth
			     	})
			     	.attr("dy", function(it){return it.properties.y + it.properties.c[1] - 300;})
			     	.attr("fill", "#ffffff");

			    d3.select(d3.select(this).node().parentNode)
			     .append("text")
			     	.text(function(it){
			     		return it.properties.raw;
			     	})
			     	.attr("dx", function(it){
			     		// console.log(this.getBBox().width);
			     		var textAlignWidth = this.getBBox().width/2;
			     		return it.properties.x + it.properties.c[0] - 400 - textAlignWidth
			     	})
			     	.attr("dy", function(it){return it.properties.y + it.properties.c[1] - 300 + marginTop;})
			     	.attr("fill", "#ffffff")
			     	.attr("stroke-width",0);

			};
		});
	}, 900);
	



}



