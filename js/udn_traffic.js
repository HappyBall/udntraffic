//An extract of address points from the LINZ bulk extract: http://www.linz.govt.nz/survey-titles/landonline-data/landonline-bde
//Should be this data set: http://data.linz.govt.nz/#/layer/779-nz-street-address-electoral/

var deathPar = 30;
var hurtPar = 15;


$(document).ready(function(){

	var bestFitZoom = 13;

	//section one
	$("#go-down").click(function(){

		console.log("in click");
		$('body,html').animate({
			scrollTop: $(window).height() + $("#big-anchors").height()
		}, 800);
	
		return true;

	});

	$("#go-down").on("click", function(){
		$('body,html').animate({
			scrollTop: $(window).height() + $("#big-anchors").height()
		}, 800);

		return true;
	})


	d3.csv("../data/county-zoom-center.csv", function(data){

		console.log(data);

		var latlngDict = {};
		for (var i = 0; i < data.length; i++) {
			latlngDict[data[i]["county_name"]] = {
				"lat":data[i]["lat"],
				"lng":data[i]["lng"]
			};

		};

		window.GeoData = latlngDict;

	});


	// d3.json("../data/a1_accident_data.json", function(data){
	d3.json("../data/a1_accident_data_2015_05_26.json", function(data){

		//cope with the data here.
		var arr = data["results"];
		/*for (var i = 0; i < arr.length; i++) {
			var death = parseInt(arr[i]["casualty"].slice( arr[i]["casualty"].indexOf("亡")+1, arr[i]["casualty"].indexOf(";") ) );
			var hurt = parseInt(arr[i]["casualty"].slice( arr[i]["casualty"].indexOf("傷")+1 ) );

			arr[i] = [arr[i]["lat"], arr[i]["lng"], death * deathPar + hurt * hurtPar];
			//arr[i] = [arr[i]["lat"], arr[i]["lng"], 25];

		};*/


		window.map = L.map('map').setView([25.04516, 121.540892], 11);// add an OpenStreetMap tile layer
		// map.scrollWheelZoom.disable();

		L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
		  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
		}).addTo(map);
		// var heat = L.heatLayer(arr, {radius: 10}).addTo(map);


		var markers = L.markerClusterGroup({
			disableClusteringAtZoom: 17, 
			// singleMarkerMode: true, 
			maxClusterRadius: 60, 
			iconCreateFunction: function(cluster){

				// console.log(cluster["_childClusters"]);

				if(cluster.getChildCount() == 1){
					return new L.DivIcon({
						html: "<div></div>", className: "marker-one"
					});	
				}else{
					return new L.DivIcon({
						html: "<div><div class='cluster-number'>" + cluster.getChildCount() + "</div></div>", className: "marker-big", iconSize:[30,30]
					});
				}

			}
		});

		var trafficIcon = L.divIcon({
			className: "traffic-icon",
			popupAnchor: [0,-10],
			iconSize:[10,10],
			html: "<div></div>"
		});

		for (var i = 0; i < arr.length; i++) {
			var a = arr[i];
			// console.log(a);
			// var casualtyString = a["casualty"];
			
			var casualtyString = "死亡人數： " + a["casualty"].split(",")[0] + "，" + "受傷人數： " + a["casualty"].split(",")[1];

			var title = a["date"] + " " + a["time"] + "<br>" + a["loc"] + "<br>" + casualtyString;
			var popUp = L.popup("map-popup").setContent('<div class="map-popup">' + title + '</div>');
			// console.log(a["lat"]);
			var marker = L.marker(L.latLng( a["lat"], a["lng"]),{icon: trafficIcon}, { title: title });
			marker.bindPopup(popUp);
			markers.addLayer(marker);
		};

		markers.on("mouseover", function(a){
			console.log("marker" + a.layer);
			a.layer.openPopup();
			// console.log(this);
			// this.openPopup();
		});

		var clusterPopup = L.popup().setContent('<div> Hello </div>');

		markers.on("clustermouseover", function(a){

			a.layer.getAllChildMarkers()[0].openPopup();
			console.log(a.layer.getAllChildMarkers()[0]._popup._content);

			$("#map-cluster-tooltip").css({"position": "fixed"})

			// this.bindPopup(clusterPopup);
			// this.openPopup();
		});

		map.addLayer(markers);
		// add a marker in the given location, attach some popup content to it and open the popup


	});


	$("#big-anchors").on("click", "div.big-anchor", function(){
		var idx = $(this).index();
		var targetst = 0;

		switch(idx){
			case 0: 
				// console.log("0");
				targetst = $("#video-wrap").height() + $("#big-anchors").height();
				// return;
				break;
			case 1:
				// console.log("1");
				targetst = $("#video-wrap").height() + $("#big-anchors").height() + $("#map").height();
				// return;
				break;
			case 2:
				// console.log("2");
				targetst = $("#video-wrap").height() + $("#big-anchors").height() + $("#map").height() + $("#analysis-103").height();
				
				// because the section 4 is too long, therefore when scrolling to anchor in small/ short screens,
				// we need to scroll it back down a little bit
				if( targetst > $("#s4-title").offset().top - 77 ){
					targetst = $("#s4-title").offset().top - 77;
				}

				// return;
				break;
			case 3:
				// console.log("3");
				targetst = $("#video-wrap").height() + $("#big-anchors").height() + $("#map").height() + $("#analysis-103").height()
					+ $("#s4").height();
				// return;
				break;
			case 4:
				// console.log("4");
				targetst = $("#video-wrap").height() + $("#big-anchors").height() + $("#map").height() + $("#analysis-103").height()
					+ $("#s4").height() + $("#s5").height();
				// return;
				break;
		}


		$('body,html').animate({
			"scrollTop": targetst
		}, 500);



	});	// big anchor on click function end

	

	setTimeout(function(){

		//add the counties list onto #map
		var counties = ["臺北市", "新北市", "桃園市", "臺中市", "臺南市", "高雄市", "宜蘭縣", "新竹縣", "苗栗縣", "彰化縣", "南投縣", "雲林縣", "嘉義縣", "屏東縣", "臺東縣", "花蓮縣", "澎湖縣", "基隆市", "新竹市", "嘉義市", "金門縣", "連江縣"];
		$("#map").append("<div id='county-list'></div>");
		for (var i = 0; i < counties.length; i++) {

			if (i == 0) {
				$("#county-list").append('\
					<div class="county-wrap">\
						<a class="county-a county-in-view">' + counties[i] + '</a>\
					</div>\
				');


			}else{
				$("#county-list").append('\
					<div class="county-wrap">\
						<a class="county-a">' + counties[i] + '</a>\
					</div>\
				');
				
			}
			
		};

		$("#map").append('<div id="go-down-map"><img src="img/down.png"></div>');

		var GoDownleft = ($(window).width() - 80)/2;
		$("#go-down-map").css({"left": GoDownleft});
		$("#go-down-map").click(function(){
			console.log("map page down clicked");
			$('body,html').animate({
				scrollTop: $("#video-wrap").height() + $("#big-anchors").height() + $("#map").height()
			}, 800, function(){
				console.log("call back of map go down");
			})
		});


		//init the color for the county names on map
		$("a.county-a").css({"color": "#424242", "cursor": "pointer"});
		$("#county-list").on("click", "div.county-wrap" ,function(){
			// console.log($(this).index());

			var key = $(this).find("a").text();
			console.log(key);

			var thisA = $(this).find("a");
			thisA.addClass("county-in-view").removeClass("county-no-view");
			$("a.county-a").not(thisA).removeClass("county-in-view").addClass("county-no-view");

			// window.map.panTo(new L.LatLng(GeoData[key]["lat"], GeoData[key]["lng"]));
			window.map.setView(new L.LatLng(GeoData[key]["lat"], GeoData[key]["lng"]), bestFitZoom, true);

		});
		

		//move the zoom control of leaflet
		$(".leaflet-top").css({marginTop: 72});

		//set first page ui position
		$("#go-down-wrap").width($("#title-intro-wrap").width());


		// so that we can know the direction user scrolled
		var lastScrollTop = 0;

		// an array saving the heights of sections, avoiding re-calculation, jQuery is slow...
		sectionHeights = [$("#video-wrap").height(), $("#map").height(),  $("#analysis-103").height(), $("#s4").height(), $("#s5").height()];
		var anchorHeight = $("#big-anchors").height();

		$(window).scroll(function(){
			var st = $(this).scrollTop();
			// console.log($(this).scrollTop());

			var targetH = $("#video-wrap").height();

			if ( st > targetH/2 && st < targetH + $("#big-anchors").height()) {// 805+62
						
						if (st > lastScrollTop) {
							disable_scroll();
							if (!$(this).is(':animated')) {
								
								$('body,html').animate({
									scrollTop: $(window).height() + $("#big-anchors").height()
								}, 800, function(){
									$('body,html').clearQueue();
									enable_scroll();
								});


							}
						}
				}


			if ( st > targetH ) {

				$("#big-anchors").addClass("fixed");
				$("#map").css({marginTop: anchorHeight}).after($("#fake-scroll"));

				if ( st >= sectionHeights[0] + anchorHeight && st < arrSum(sectionHeights.slice(0,2)) + anchorHeight ){
					setColorForBigAnchorsWithIndex(0);
				}else if(st >= arrSum(sectionHeights.slice(0,2)) && st < arrSum(sectionHeights.slice(0,3)) ){
					setColorForBigAnchorsWithIndex(1);
				}else if(st >= arrSum(sectionHeights.slice(0,3)) && st < arrSum(sectionHeights.slice(0,4)) ){
					setColorForBigAnchorsWithIndex(2);
				}else if(st >= arrSum(sectionHeights.slice(0,4)) && st < arrSum(sectionHeights) ){
					setColorForBigAnchorsWithIndex(3);
					$("#s6-tall-wrap").css({"position": "absolute", "marginTop":0});
				}
				else if ( st >=  arrSum(sectionHeights) /*+ $("#big-anchors").height()*/){

					setColorForBigAnchorsWithIndex(4);

					var s6Scroll = st - arrSum( sectionHeights);

					//save the four sections height into an array
					//so that we can change image during scroll
					var s6ContentHeights = $.map($("#s6").children(".s6-group"), function(div){return $(div).height()});
					var scrollPreview = 280;
					var animationTime = 200;
					//some good way to select second children element, not used.
					//$("#s6").children(".s6-group").eq(1)
					
					if (s6Scroll >= 0) {
						
						$("#s6-tall-wrap").css({"position": "fixed", "marginTop": 62});

						//change the image while scrolling down in section 6
						if( $("#s6-tall-wrap").is(':animated') ) {
							// console.log("animated!!!");
							return;
						}
						
						// we start from the back, checking it's scrolled to the bottom.
						if (s6Scroll > s6ContentHeights.slice(0,3).reduce(function(a,b){return a+b;}, 0) - scrollPreview) {

							// if it's the right image, we return
							if ( $("#s6-tall-wrap").css("background-image").indexOf("s6-side-4.jpg") != -1) {
								return ;
							};

							// or else, we fade into the right image.
							$("#s6-tall-wrap").fadeOut(animationTime, function(){
								//change image
								$(this).css({"background-image":"url('../img/s6-side-4.jpg')"});	
								//fade in again
								$(this).fadeIn(animationTime);
							});
							
						}else if(s6Scroll > s6ContentHeights.slice(0,2).reduce(function(a,b){return a + b;}, 0) - scrollPreview){

							if ( $("#s6-tall-wrap").css("background-image").indexOf("s6-side-3.jpg") != -1) {
								return ;
							}

							$("#s6-tall-wrap").fadeOut(animationTime, function(){
								//change image
								$(this).css({"background-image":"url('../img/s6-side-3.jpg')"});	
								//fade in again
								$(this).fadeIn(animationTime);
							});
						}else if(s6Scroll > s6ContentHeights.slice(0,1).reduce(function(a,b){return a + b;}, 0) - scrollPreview){
							// $("#s6-tall-wrap").attr("img-tag", 1);
							// $("#s6-tall-wrap").css({"background":"url('../img/s6-side-2.jpg')"});

							if ( $("#s6-tall-wrap").css("background-image").indexOf("s6-side-2.jpg") != -1) {
								// console.log("2");
								return ;
							};
							$("#s6-tall-wrap").fadeOut(animationTime, function(){
								//change image
								$(this).css({"background-image":"url('../img/s6-side-2.jpg')"});	
								//fade in again
								$(this).fadeIn(animationTime);
							});
						}else if(s6Scroll > s6ContentHeights.slice(0,1).reduce(function(a,b){return a + b;}, 0) - scrollPreview * 2){

							if ( $("#s6-tall-wrap").css("background-image").indexOf("s6-side-1.jpg") != -1) {
								// console.log("1");
								return ;
							};
							$("#s6-tall-wrap").fadeOut(animationTime, function(){
								//change image
								$(this).css({"background-image":"url('../img/s6-side-1.jpg')"});	
								//fade in again
								$(this).fadeIn(animationTime);
							});
						}


					}else{
						$("#s6-tall-wrap").css({"position": "absolute"});
					}


				}else{
					//not into section 6
					$("#s6-tall-wrap").css({"position": "absolute", "marginTop":0});

				}



			}else if( $(this).scrollTop() < targetH ){

				// console.log("in here dudde");
				$("#map").css({marginTop: 0}).after($("#fake-scroll"));
				$("#big-anchors").removeClass("fixed");

			//section 3,4,5
			}

			lastScrollTop = st;


		});	
	}, 1000);
	

	//section 3
	$("#change-s3-btn").click(function(){
		var dir = $(this).attr("dir");
		//rotate to left
		if (dir == "103") {
			// $(this).addClass("s3-btn-left");
			$(this).attr("dir", "years");
			$(this).attr("data-original-title", "看103年");
			$(this).find('img').attr('src', 'img/103.png');
			moveBarsOf103();
			
		}else if(dir == "years"){
			//rotate to right
			// $(this).removeClass("s3-btn-left");
			$(this).attr("dir", "103");
			$(this).attr("data-original-title", "看歷年");
			$(this).find('img').attr('src', 'img/years.png');
			showOnlyBarsOf103();

		}
	});

	// $("#change-s3-btn").tooltip();


	d3.csv("../data/a1-age.csv", function(data){

		var marginBottom = 25;
		var s3svg = d3.select("#s3-chart").select("svg")
			.attr("width", 1140)
			.attr("height", 282);

		var data103 = data[data.length - 1];
		window.keys = Object.keys(data103).slice(1);


		var sumAgeData = [];
		for (var l = 0; l < data.length; l++) {
			var sum = 0;
			for (var d = 0; d < keys.length; d++) {
				sum = sum + parseInt( data[l][keys[d]] );
			};
			sumAgeData.push(sum);
		};

		console.log(sumAgeData);


		var dataArr103 = [];
		for (var i = 0; i < keys.length; i++) {
			dataArr103.push(
			{	
				"val" : parseInt(data103[keys[i]]),
				"idx" : keys[i],
				"rate": parseInt((parseInt(data103[keys[i]])/sumAgeData[data.length - 1])*10000)/100
			});
		};

		var y = d3.scale.linear().range([282 - marginBottom, 0]).domain([0, 439]);
		var x = d3.scale.ordinal().domain(keys).rangeRoundBands([0, 741], 0.28, 0);

		//group for 103 bars.
		var g103 = s3svg.append("g").attr("id", "bars-103").attr("class","age-bargroup")
		.attr("transform", function(d){
			return "translate(" + 199.5 + ",2)"; 
		});
		var barText = g103.selectAll("g.bar").data(dataArr103).enter()
			.append("g").attr("class", "bar");
		
		window.barTip = d3.tip().attr("class", "bar-tip").html(function(d){

			if ($("#change-s3-btn").attr("dir") == "left") {
				return d["idx"] + "<br>死亡人數：" + d["val"] + "<br>" + "佔比：" + d["rate"] + "%";	
			}else{
				return "103年<br>" +  d["idx"] + "<br>死亡人數：" + d["val"] + "<br>" + "佔比：" + d["rate"] + "%";
			}	

		});

		s3svg.call(barTip);

		barText.append("rect")
			.attr("x", function(d){
				return x(d["idx"]);
			})
			.attr("width", x.rangeBand())
			.attr("height", function(d){
				/*console.log(d);
				console.log(y(d["val"]));*/
				return 282 - marginBottom - y(d["val"]);
			})
			.attr("y", function(d){
				return y(d["val"]);
			} )
			.attr("fill", "rgba(86,210,239, 0.7)")
			.attr("stroke", "#ffffff")
			.attr("stroke-width", 1)
			.on("mouseover", function(d){
				
				var rect = this;
				if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
				    // Do Firefox-related activities
					barTip.offset(function(d){
						console.log(rect.getBBox());
						return [-350, 0];
					});
				}

				barTip.show(d);
				
				d3.select(this).attr("fill", "rgba(86,210,239, 1)").attr("stroke-width", 2);
			})
			.on("mouseout", function(d){
				barTip.hide();
				d3.select(this).attr("fill", "rgba(86,210,239, 0.7)").attr("stroke-width", 1);
			});

		barText.append("text")
			.attr("class", "s3-chart-text font-msb")
			.text(function(d){
				return d["idx"];
			})
			.attr("x", function(d){
				return x(d["idx"]);
			})
			.attr("y", function(d){
				return 282 - 3;
			})
			.attr("fill", "#ffffff")
			.attr("dx", 3);


		// other five years bars
		for (var i = 0; i < 5; i++) {

			var dataArr = [];
			for (var j = 0; j < keys.length; j++) {
				dataArr.push(
				{	
					"val" : parseInt(data[i][keys[j]]),
					"idx" : keys[j],
					"rate": parseInt((parseInt(data[i][keys[j]])/sumAgeData[i])*10000)/100
				});
			};

			var y = d3.scale.linear().range([282 - marginBottom, 0]).domain([0, d3.max(dataArr103, function(d){return d.val})]);
			// console.log("===" + d3.max(dataArr103, function(d){return d.val}) + "===");
			var marginLeft = 15;
			var oneYearWidth = 185;
			var smallX = d3.scale.ordinal().domain(keys).rangeRoundBands([0, oneYearWidth], 0, 2);

			var gYear = s3svg.append("g").attr("id", function(d){
				return "bars-" + (i+98).toString();
			}).attr("class","age-bargroup grow-five")
			.attr("transform", function(d){
				return "translate(" + (marginLeft + 185 * i) + ",2)"; 
			});

			var barText = gYear.selectAll("g.bar").data(dataArr).enter()
				.append("g").attr("class", "bar");
			
			barText.append("rect")
				.attr("x", function(d){
					return smallX(d["idx"]);
				})
				.attr("width", smallX.rangeBand())
				.attr("height", 0)
				.attr("y", function(d){
					return 282 - marginBottom;
				})
				.attr("fill", "rgba(160,160,160, 0.7)")
				.attr("stroke", "#ffffff")
				.attr("stroke-width", 1)
				.on("mouseover", function(d){


					if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
					    // Do Firefox-related activities
						barTip.offset(function(d){
							return [-350, 0];
						});
					}

					barTip.show(d);

					var lineY = y(d["val"]);
					d3.select(this).attr("fill", "rgba(86,210,239, 1)").attr("stroke-width", 2);
					var adjustLine = 6;

					//check if the line is visible
					if (parseInt(d3.select("#s3-svg").select("#s3-chart-line").style("stroke-opacity")) != 0) {
						// console.log("oooooooooooooooooooooo");
						d3.select("#s3-svg").select("#s3-chart-line")
							.attr("y1", lineY + adjustLine)
							.attr("y2", lineY + adjustLine);

					}else{
						// console.log("xxxxxxxxxxxxxxxxxxxxxx");
						d3.select("#s3-svg").select("#s3-chart-line")
							.attr("y1", lineY + adjustLine)
							.attr("y2", lineY + adjustLine)
							.transition().duration(300)
							.style("stroke-opacity", 0.7)
							.each("end", function(d){
								//d3.select("#s3-svg").select("#s3-chart-line")	
							});
							
					}

					var indexOfAges = keys.indexOf(d["idx"]);
					highLightAllBarsWithIdx(indexOfAges);

					for (var p = 0; p < 9; p++) {
						if (p == indexOfAges) {continue;}
						else{
							unhighlightAllBarsWithIdx(p);	
						}
						
					};
					
				})
				.on("mouseout", function(d){
					barTip.hide();
					// d3.select(this).attr("fill", "rgba(160,160,160, 0.7)").attr("stroke-width", 1);

					var indexOfAges = keys.indexOf(d["idx"]);
					// unhighlightAllBarsWithIdx(indexOfAges);

				});

		};

	});
	

});


function moveBarsOf103(){

	var marginLeft = 15;
	oneYearWidth = 185;
	var marginBottom = 25;
	var smallX = d3.scale.ordinal().domain(keys).rangeRoundBands([0, oneYearWidth], 0, 2);
	var y = d3.scale.linear().range([282 - marginBottom, 0]).domain([0, 439]);


	// move the bars to the correct position
	d3.select("#s3-svg").select("#bars-103")
		.transition().duration(800)
		.attr("transform", function(d){
			return "translate(" + oneYearWidth * 5 + ",0)";
		});

	//change the bars size of 103
	var bars = d3.select("#s3-svg").select("#bars-103").selectAll(".bar");
	bars.selectAll("rect").transition().duration(800)
		.attr("x", function(d){
			return smallX(d["idx"]);
		})
		.attr("width", function(d){
			return smallX.rangeBand();
		})
		.each("end", function(d){
			//reset the color and reset the on mouseover listener of 103
			d3.select(this).attr("fill", "rgba(160,160,160, 0.7)")
				.on("mouseover", function(d){
					barTip.show(d);
					d3.select(this).attr("fill", "rgba(86,210,239, 1)").attr("stroke-width", 2);
					var lineY = y(d["val"]);
					var adLine = 0;

					if (parseInt(d3.select("#s3-svg").select("#s3-chart-line").style("stroke-opacity")) != 0) {
						console.log("ooooooooooooooooooo=====");
						d3.select("#s3-svg").select("#s3-chart-line")
							.attr("y1", lineY + adLine)
							.attr("y2", lineY + adLine);
					}else{
						// console.log("xxxxxxxxxxxxxxxxxxx=====");
						d3.select("#s3-svg").select("#s3-chart-line")
							.attr("y1", lineY + adLine)
							.attr("y2", lineY + adLine)
							.transition().duration(300)
							.style("stroke-opacity", 0.7);
							
					}

					var indexOfAges = keys.indexOf(d["idx"]);
					highLightAllBarsWithIdx(indexOfAges);

					for (var p = 0; p < 9; p++) {
						if (p == indexOfAges) {continue;}
						else{
							unhighlightAllBarsWithIdx(p);	
						}
						
					};


				})
				.on("mouseout", function(d){
					barTip.hide();
					// d3.select(this).attr("fill", "rgba(160,160,160, 0.7)").attr("stroke-width", 1);
					var indexOfAges = keys.indexOf(d["idx"]);
					// unhighlightAllBarsWithIdx(indexOfAges);
				});
		});

	//hide text
	d3.select("#s3-svg").select("#bars-103").selectAll("text")
		.attr("visibility", "hidden");

	setTimeout(function(){

		//other five 98~102
		d3.select("#s3-svg").selectAll(".grow-five").selectAll("rect")
			.transition().duration(800)
			.attr("height", function(d){
				return 282 - marginBottom - y(d["val"]);
			})
			.attr("y", function(d){
				return y(d["val"]);
			})
			.each("end", function(){
				highLightAllBarsWithIdx(8);
			});

		d3.selectAll(".age-bargroup").append("text")
			.text(function(d){
				// console.log(this);
				var id = d3.select(d3.select(this).node().parentNode).attr("id");
				id = id.slice(id.indexOf("-")+1) + "年";
				// console.log(id);
				return id;

			})
			.attr("class","year-txt")
			.attr("dx", 80)
			.attr("dy", 275)
			.attr("fill", "#ffffff");


		if(d3.select("#s3-svg").select("#s3-chart-line")[0][0] == null){
				d3.select("#s3-svg").append("svg:line")
                    .attr("id", 's3-chart-line')
                    .attr("x1", 0)
                    .attr("y1", 200)
                    .attr("x2", 1140)
                    .attr("y2", 200)
                    .style("stroke-width", 2)
                    .style("stroke-dasharray", ("3, 3"))
                    .style("stroke-opacity", 0)
                    .style("stroke", "#ffffff")
                    .attr("fill", "#ffffff");	
		}else{
			//hide the line
			d3.select("#s3-svg").select("#s3-chart-line")
				.attr("visibility", "visible");
		}
		 

	},750);

	
	

}

function showOnlyBarsOf103(){

	var x = d3.scale.ordinal().domain(keys).rangeRoundBands([0, 741], 0.28, 0);
	d3.select("#s3-svg").select("#bars-103")
		.transition().duration(800)
		.attr("transform", function(d){
			return "translate(" + 199.5 + ",0)"; 
		});

	var bars = d3.select("#s3-svg").select("#bars-103").selectAll(".bar");
	bars.selectAll("rect").transition().duration(800)
		.attr("x", function(d){
			return x(d["idx"]);
		})
		.attr("width", function(d){
			return x.rangeBand();
		})
		.each("end", function(d){
			// console.log(d);
			// console.log();
			var parentNode = d3.select(this).node().parentNode;
			// console.log(parentNode);
			d3.select(parentNode).select("text").attr("visibility", "visible");
			d3.select(this).attr("fill", "rgba(86,210,239, 0.7)");
		});
		

	bars.selectAll("rect")
		.on("mouseover", function(d){
			barTip.show(d);
			d3.select(this).attr("fill", "rgba(86,210,239, 1)").attr("stroke-width", 2);
		})
		.on("mouseout", function(d){
			barTip.hide();
			d3.select(this).attr("fill", "rgba(86,210,239, 0.7)").attr("stroke-width", 1);
		});

	//show text
	/*d3.select("#s3-svg").select("#bars-103").selectAll("text")
		.attr("visibility", "visible");*/

	//other five
	var marginBottom = 25;
	d3.select("#s3-svg").selectAll(".grow-five").selectAll("rect")
		.transition().duration(400)
		.attr("height", function(d){
			return 0;
		})
		.attr("y", function(d){
			return 282 - marginBottom;
		});

	d3.selectAll(".age-bargroup").selectAll("text.year-txt")
		.transition().duration(300)
		// .attr("class","year-txt")
		// .attr("dx", 80)
		// .attr("dy", 275)
		.attr("visibility", "hidden")
		.each("end", function(d){
			d3.select(this).remove();
		});

	//hide the line
	d3.select("#s3-svg").select("#s3-chart-line")
		.attr("visibility", "hidden");

}


function highLightAllBarsWithIdx(idx){
	// console.log(idx);
	var gs = d3.selectAll(".age-bargroup").selectAll("g");
	for (var i = 0; i < gs.length; i++) {
		d3.select(gs[i][idx]).select("rect")
			.attr("fill", "rgba(86,210,239, 0.7)");
	};
}

function unhighlightAllBarsWithIdx(idx){
	var gs = d3.selectAll(".age-bargroup").selectAll("g");
	for (var i = 0; i < gs.length; i++) {
		d3.select(gs[i][idx]).select("rect")
			.attr("fill", "rgba(160,160,160, 0.7)");
	};
}


function getKeys(){
	return keys;
}


var downKeys = [37, 38, 39, 40];
function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;  
}

function keydown(e) {
    for (var i = keys.length; i--;) {
        if (e.keyCode === downKeys[i]) {
            preventDefault(e);
            return;
        }
    }
}

function wheel(e) {
  preventDefault(e);
}

function disable_scroll() {
  if (window.addEventListener) {
      window.addEventListener('DOMMouseScroll', wheel, false);
  }
  window.onmousewheel = document.onmousewheel = wheel;
  document.onkeydown = keydown;

}

function enable_scroll() {
    if (window.removeEventListener) {
        window.removeEventListener('DOMMouseScroll', wheel, false);
    }
    window.onmousewheel = document.onmousewheel = document.onkeydown = null;  
}


function setColorForBigAnchorsWithIndex(index){
	
	$(".big-anchor").each(function(idx){

		if (idx != index) {
			//change the color of bg color
			$(this).css({"background-color": "rgba(57,57,57,1)"});
			$(this).find(".inner-anchor").css({"color":"#b2b2b2"});
			
		}else{
			//change to common color of bg color
			$(this).css({"background-color": "#141414"});
			$(this).find(".inner-anchor").css({"color":"#ffffff"});
		}

	});


}


function arrSum(arr){
	return arr.reduce(function(a,b){
		return a + b;
	});
}

$(window).on("resize", function(){
	
	// reset the height of image for section 6
	// set the height to full screen height
	$("#s6-tall-wrap").height($(window).height());

	sectionHeights = [$("#video-wrap").height(), $("#map").height(),  $("#analysis-103").height(), $("#s4").height(), $("#s5").height()];

});

