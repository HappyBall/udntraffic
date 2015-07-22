$(document).ready(function(){
	
	//draw the buttons into the 

	d3.json("data/car-type.json", function(data){
		

		var carTypes = Object.keys(data);
		window.carKeys = carTypes;
		// var carColors = ["#56d2ef", "#cca5e5", "#cae8aa", "#ed9b72", "#e5d09c", "#d197cf", "#97d3b6", "#e8a6ae", "#a9b1ea"];
		var carColors = ["#97d3b6", "#cca5e5", "#ed9b72", "#cae8aa", "#a9b1ea", "#56d2ef", "#d197cf", "#e5d09c", "#e8a6ae"];

		// draw the transports icon here
		for (var i = 0; i < carTypes.length; i++) {

			var imgName = "img/trans_";
			if (i == 5) {
				imgName = imgName + "c0" + (i+1).toString(); 
			}else{
				imgName = imgName + "0" + (i+1).toString();
			}
			imgName = imgName + ".png";

			var carNameIcon	= '<div class="car-sel-group" sel="false" idx=' + i +  '>\
								<div class="car-name font-msb">' + carTypes[i] + '</div>\
								<div class="under-line"></div>\
								<div class="car-img-wrap"><img src="' + imgName + '"></div>\
							   </div>';

			$("#s4-car-select").append(carNameIcon);
		}

		// special case for motorcycle
		// the default to be selected
		$('#s4-car-select :nth-child(6)').find(".car-img-wrap").css({"opacity": 0.9});


		// set on click function for difference transport icons
		$(".car-sel-group").on("mouseover", function(){
			// console.log($(this));
			$(this).find("div.under-line").css({"visibility": "visible"});
		}).on("mouseout", function(){
			$(this).find("div.under-line").css({"visibility": "hidden"});
		}).on("click", function(){

			var selected = $(this).attr("sel");
			var idx = parseInt($(this).attr("idx"));
			// if this one is already selected
			if (selected == "true") {

				// change img
				$(this).find("img").attr("src", "img/trans_0" + (idx+1).toString() + ".png");
				$(this).find("div.car-img-wrap").css({"opacity": 0.5});
				// a value saved in the DOM attr, meaning whether this is selected.
				$(this).attr("sel", "false");

				d3.select("#car-" + idx).style("stroke", "#3d3d3d").attr("stroke", "#3d3d3d").attr("stroke-width", 1);
				d3.select("#s4-svg").select("#sel-cir-" + idx).remove();
				d3.select("#s4-svg").select("#wsel-cir-" + idx).remove();

				// an array where I saved the reference to all the tip,
				// hide the tip, if this transport is disabled
				tipArray[idx].hide();


			}else{

				//change img
				$(this).find("img").attr("src", "img/trans_c0" + (idx+1).toString() + ".png");
				$(this).find("div.car-img-wrap").css({"opacity": 0.9});
				$(this).attr("sel", "true");

				// update the line chart color of this specific transport
				d3.select("#car-" + idx).style("stroke", carColors[idx]).attr("stroke", carColors[idx]).attr("stroke-width", 2);

			}

		});


		//start to draw the fucking line chart here XD
		d3.select("#s4-line-chart").select("#s4-svg")
			.attr("width", 1140)
			.attr("height", 420);

		var margin = {
			"left": 80,
			"right": 80
		};

		var padding = {
			"left": 25,
			"right": 10,
			"bottom": 35 
		};

		// a group G where I render all the lines
		var lineG = d3.select("#s4-line-chart").select("#s4-svg")
		   .append("g")
			.attr("id", "s4-line-g")
			.attr("transform", function(d){
				return "translate(" + margin.left + ",0)"; 
			});
			

		var maxX = 1140 - margin.left - margin.right - padding.left - padding.right;
		var maxY = 400 - padding.bottom;

		var x = d3.time.scale().domain([new Date(2005,0,01), new Date(2014,11,12)])
			.range([0, 1140 - margin.left - margin.right - padding.left - padding.right]);

		var y = d3.scale.linear().domain([0, 60])
			.range([ 400 - padding.bottom, 0 ]);

		// draw the y axis grid line
		for( var k = 0; k < 6; k++){

			d3.select("#s4-svg")
				.append("text")
				.attr("transform", function(d){
					return "translate(45," + (y(k*10) + 5) + ")";
				})
				.text( k * 10)
				.attr("font-size", 15)
				.attr("fill", "#7c7c7c");

			lineG.append("svg:line")
                .attr("class", 'tick-line')
                .attr("x1", 0)
                .attr("y1", y(k*10) )
                .attr("x2", maxX)
                .attr("y2", y(k*10))
                .style("stroke-width", 1)
                .style("stroke-dasharray", ("1, 1"))
                // .style("stroke-opacity", 1)
				.style("stroke", "#ffffff")
				.attr("fill", "#ffffff")
				.style("stroke-opacity", 0.2);
				// .attr("stroke-opacity", 0.2);		
		}

		// draw x-axis ticks text
		for( var year = 0; year < 10; year++){
			d3.select("#s4-svg")
				.append("text")
				.attr("transform", function(d){
					return "translate(" + (padding.left + margin.left + x(new Date(2005+year,0,01))) + "," + (maxY + 22) + ")";
				})
				.text( (94 + year).toString() + "年" )
				.attr("font-size", 15)
				.attr("fill", "#7c7c7c");
		}

		// I facked a transparent rectangle under the lines
		lineG.append("rect")
			.attr("id", "line-bg-rect")
			.attr("width", maxX)
			.attr("height", maxY)
			.style("fill", "transparent");


		//draw the dotted line here
		var percentageData = {};
		d3.csv("data/car-type-sum.csv", function(sumData){

			var values = $.map(sumData, function(v) { return parseInt(v["sum"]); });
			var line = d3.svg.line()
				.x(function(d){
					// if (x( new Date(d["dt"])) < 0)
					// console.log(d["dt"] );
					return x( new Date(d["dt"]));
				})
				.y(function(d){
					return y(d["r"]);
				});

			// the tip array as a reference to all the tips
			// one tip per line
			tipArray = [];

			for (var j = 0; j < carTypes.length; j++) {
				
				var oneCarData = data[carTypes[j]];
				var oneCarFinalData = [];
				for (var k = 0; k < oneCarData.length; k++){
					var zeroString = "";
					if ( (k % 12) + 1 < 10 ) {
						// a string only to make format consistant while tackling months from Jan to Sep (1~9) 
						zeroString = "0";
					};
					var date = (Math.floor(k/12)+ 2005).toString()+ "-" + zeroString + ((k % 12)+1).toString() + "-01";
					oneCarFinalData.push({
						 // d -> raw data
						 "d": oneCarData[k],
						 // r -> rate
						 "r": parseInt(oneCarData[k]/values[k] * 10000)/100,
						"dt": date
					});
				}

				percentageData[carTypes[j]] = oneCarFinalData;
				var tip = d3.tip().attr('class', 'bar-tip').html(function(d) { return d["c_type"] + "，死亡人數：" + d["death"] + "，佔比：" + d["rate"] + "%"; }).direction("e");
				tipArray.push(tip);

				var pathG = lineG.append("g")
					.attr("class", "path-g")
					.call(tip);

				pathG.append("svg:path")
					.attr("id", function(){
						return "car-" + j;
					})
					.attr("d", function(d){
						return line(oneCarFinalData);
					})
					.style("stroke", function(d){
						if (j == 5) {
							return carColors[j];	
						}else{
							return "#3d3d3d";
						}
						
					})
					.attr("stroke", function(d){
						if (j == 5) {
							return carColors[j];	
						}else{
							return "#3d3d3d";
						}
					})
					.attr("stroke-width", function(d){
						if (j == 5) {
							return 2;
						}else{
							return 1;
						}
					})
					.attr("fill", "none");


			};


			d3.select("#s4-svg").select("#s4-line-g")
				.append("svg:line")
                    .attr("id", 's4-chart-line')
                    .attr("x1", 0)
                    .attr("y1", y(0) )
                    .attr("x2", 0)
                    .attr("y2", y(400 - padding.bottom))
                    .style("stroke-width", 1)
                    .style("stroke-dasharray", ("1, 1"))
                    // .style("stroke-opacity", 1)
					.style("stroke", "#ffffff")
					.attr("fill", "#ffffff");	
		

            var bisectArr = [];
            for(var k = 0; k < 120; k++){
            	bisectArr.push( x(new Date(2005 + Math.floor(k/12), k%12, 1) ) )
            }

			d3.select("#s4-svg").select("#line-bg-rect")
				.on("mouseover", function(){

				})
				// this is a important part XDD
				// when user mouse move in the line chart rectangle,
				// we move the vertical line and update the tips
				.on("mousemove", function(evt) {

					var m = d3.mouse(this);
					// console.log(m);
					var idxRight = d3.bisect(bisectArr, m[0]);
					var distance = bisectArr[idxRight] - bisectArr[idxRight - 1];

					if ( (m[0] - bisectArr[idxRight - 1]) < 2.3 ) {

						d3.select("#s4-svg").select("#s4-chart-line")
							.attr("x1", bisectArr[idxRight-1])
							.attr("x2", bisectArr[idxRight-1]);
							
							var selectedLines = d3.select("#s4-line-g").selectAll("path").filter(function(d){return d3.select(this).attr("stroke")  != "#3d3d3d" })
							.each(function(d){
								// console.log("in first");

								console.log("from left");
								console.log(d3.select(this).style("stroke"));

								var idName = d3.select(this).attr("id");
								var keyIdx = parseInt(idName.slice(idName.indexOf("-") + 1));

								d3.select("#s4-svg").select("#sel-cir-" + keyIdx).remove();
								d3.select("#s4-svg").select("#wsel-cir-" + keyIdx).remove();
								// d3.select("#s4-svg").selectAll("circle").remove();
								var circle = d3.select("#s4-svg").select("#s4-line-g")
									.append("circle")
									.attr("id", "sel-cir-" + keyIdx)
									.attr("cx", bisectArr[idxRight-1] )
									.attr("cy", y(percentageData[carKeys[keyIdx]][idxRight-1]["r"]))
									.attr("r", 3)
									.attr("fill", "#ffffff");

								d3.select("#s4-svg").select("#s4-line-g")
									.append("circle")
									.attr("id", "wsel-cir-" + keyIdx)
									.attr("cx", bisectArr[idxRight-1] )
									.attr("cy", y(percentageData[carKeys[keyIdx]][idxRight-1]["r"]))
									.attr("r", 8)
									.attr("fill", "transparent")
									.attr("stroke", "#ffffff")
									.attr("stroke-width", 1);
								

								var tipData = {
									"c_type": carKeys[keyIdx],
									"death": data[carKeys[keyIdx]][idxRight-1],
									"rate": percentageData[carKeys[keyIdx]][idxRight-1]["r"]
								}


								// solve the firefox tooltip position problem
								if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){

									tipArray[keyIdx].offset(function(d){
										return [-390, 0];
									});
								}
								tipArray[keyIdx].show(tipData, circle.node());

							});
								
								

					}else if( (bisectArr[idxRight] - m[0]) < 2.3 ){

						d3.select("#s4-svg").select("#s4-chart-line")
							.attr("x1", bisectArr[idxRight])
							.attr("x2", bisectArr[idxRight]);

							var selectedLines = d3.select("#s4-line-g").selectAll("path").filter(function(d){return d3.select(this).attr("stroke")  != "#3d3d3d" })
							.each(function(d){

								console.log("from right");
								console.log(d3.select(this).style("stroke"));

								var idName = d3.select(this).attr("id");
								var keyIdx = parseInt(idName.slice(idName.indexOf("-") + 1));

								d3.select("#s4-svg").select("#sel-cir-" + keyIdx).remove();
								d3.select("#s4-svg").select("#wsel-cir-" + keyIdx).remove();

								var circle = d3.select("#s4-svg").select("#s4-line-g")
									.append("circle")
									.attr("id", "sel-cir-" + keyIdx)
									.attr("cx", bisectArr[idxRight])
									.attr("cy", y(percentageData[carKeys[keyIdx]][idxRight]["r"]))
									.attr("r", 3)
									.attr("fill", "#ffffff");

								d3.select("#s4-svg").select("#s4-line-g")
									.append("circle")
									.attr("id", "wsel-cir-" + keyIdx)
									.attr("cx", bisectArr[idxRight] )
									.attr("cy", y(percentageData[carKeys[keyIdx]][idxRight]["r"]))
									.attr("r", 8)
									.attr("fill", "transparent")
									.attr("stroke", "#ffffff")
									.attr("stroke-width", 1);

								var tipData = {
									"c_type": carKeys[keyIdx],
									"death": data[carKeys[keyIdx]][idxRight],
									"rate": percentageData[carKeys[keyIdx]][idxRight]["r"]
								}

								tipArray[keyIdx].show(tipData, circle.node());

							});
							


					}else{
						console.log("don't move shit");

					}
					

				});




		});


	
	});
	

});


