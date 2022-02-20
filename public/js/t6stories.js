(function(){
  // Vertical Timeline - by CodyHouse.co
	function VerticalTimeline( element ) {
		this.element = element;
		this.blocks = this.element.getElementsByClassName("cd-timeline__block");
		this.images = this.element.getElementsByClassName("cd-timeline__img");
		this.contents = this.element.getElementsByClassName("cd-timeline__content");
		this.offset = 0.8;
		this.hideBlocks();
	}

	VerticalTimeline.prototype.hideBlocks = function() {
		if ( !("classList" in document.documentElement) ) {
			return; // no animation on older browsers
		}
		//hide timeline blocks which are outside the viewport
		var self = this;
		for( var i = 0; i < this.blocks.length; i++) {
			(function(i){
				if( self.blocks[i].getBoundingClientRect().top > window.innerHeight*self.offset ) {
					self.images[i].classList.add("cd-timeline__img--hidden"); 
					self.contents[i].classList.add("cd-timeline__content--hidden"); 
				}
			})(i);
		}
	};

	VerticalTimeline.prototype.showBlocks = function() {
		if ( !("classList" in document.documentElement) ) {
			return;
		}
		var self = this;
		for( var i = 0; i < this.blocks.length; i++) {
			(function(i){
				if( self.contents[i].classList.contains("cd-timeline__content--hidden") && self.blocks[i].getBoundingClientRect().top <= window.innerHeight*self.offset ) {
					// add bounce-in animation
					self.images[i].classList.add("cd-timeline__img--bounce-in");
					self.contents[i].classList.add("cd-timeline__content--bounce-in");
					self.images[i].classList.remove("cd-timeline__img--hidden");
					self.contents[i].classList.remove("cd-timeline__content--hidden");
				}
			})(i);
		}
	};

	let verticalTimelines = document.getElementsByClassName("js-cd-timeline");
	let verticalTimelinesArray = [];
	let scrolling = false;
	function checkTimelineScroll() {
		verticalTimelinesArray.forEach(function(timeline){
			timeline.showBlocks();
		});
		scrolling = false;
	}
	if( verticalTimelines.length > 0 ) {
		for( var i = 0; i < verticalTimelines.length; i++) {
			(function(i){
				verticalTimelinesArray.push(new VerticalTimeline(verticalTimelines[i]));
			})(i);
		}

		//show timeline blocks on scrolling
		window.addEventListener("scroll", function(event) {
			if( !scrolling ) {
				scrolling = true;
				(!window.requestAnimationFrame) ? setTimeout(checkTimelineScroll, 250) : window.requestAnimationFrame(checkTimelineScroll);
			}
		});
	}
})();

let optionsJson = {
	mode: "cors",
	method : "GET",
	Referer: t6Url,
	Origin: t6Url,
	cache: "no-cache",
	headers: {
		"Content-Type": "application/json",
		"Accept": "application/json",
		"Authorization": `Bearer ${bearer}`,
	},
};
let optionsSvg = optionsJson;

var toHHMMSS = function (value) {
	var seconds = parseInt(value / 1000, 10);
	var years = Math.floor(seconds / 31536000);
	var months = Math.floor((seconds % 31536000) / 2628000);
	var days = Math.floor(((seconds % 31536000) % 2628000) / 86400);
	var hours = Math.floor((((seconds % 31536000) % 2628000) % 86400) / 3600);
	var minutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
	seconds = Math.floor(((((seconds % 31536000) % 86400) % 3600) % 60) / 60);
	if (hours < 10) {hours = "0" + hours;}
	if (minutes < 10) {minutes = "0" + minutes;}
	if (seconds < 10) {seconds = "0" + seconds;}
	return (years > 0 ? `${years} years ` : "") +
		(months > 0 ? `${months} months ` : "") +
		(days > 0 ? `${days} days ` : "") +
		(hours > 0 ? `${hours} hours ` : "") +
		(minutes > 0 ? `${minutes} minutes ` : "") +
		(seconds > 0 ? `${seconds} seconds` : "");
};
var sprintf = function (format, ...args) {let i = 0; return format.replace(/%s/g, () => args[i++]);};
var formatTime = function (time) {let date = new Date(time); return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;};
var H1 = function (attrs) {
	document.title = attrs.value;
	header.insertAdjacentHTML("beforeend", `<h1>${attrs.value}</h1>`);
	[...document.querySelectorAll(".title")].map((n) => n.insertAdjacentHTML("beforeend", attrs.value));
};
var Headers = function (attrs) {
	header.insertAdjacentHTML("beforeend", `<p class="margin-top-sm">${attrs.value}</p>`);
};
var Insight = function (attrs) {
	root_timeline.insertAdjacentHTML("beforeend", `
		<div class="cd-timeline__block">
			<div class="cd-timeline__img">
				<span class="material-icons">${typeof attrs.icon !== "undefined" ? attrs.icon : "event"}</span>
			</div>
			<div class="cd-timeline__content text-component">
				<h2>${typeof attrs.title !== "undefined" ? attrs.title : ""}</h2>
				<p class="color-contrast-medium">${typeof attrs.text !== "undefined" ? attrs.text : ""}</p>
				<div class="flex justify-between items-center">
					<span class="cd-timeline__date">${typeof attrs.date !== "undefined" ? attrs.date : ""}</span>
				</div>
			</div>
		</div>`);
};
var gapCard = function (attrs) {
	root_timeline.insertAdjacentHTML("beforeend", `
		<div class="cd-timeline__block">
			<div class="cd-timeline__img">
				<span class="material-icons">${typeof attrs.icon !== "undefined" ? attrs.icon : "event"}</span>
			</div>
			<div class="cd-timeline__content text-component">
				<h2>${attrs.missing_values} missing values</h2>
				<p class="color-contrast-medium">Gap duration ${attrs.gap_duration}</p>
				<div class="flex justify-between items-center">
					<span class="cd-timeline__date">${typeof attrs.date !== "undefined" ? attrs.date : ""}</span>
				</div>
			</div>
		</div>`);
};
var PlotLine = function (attrs) {
	fetch(`${t6Api}/exploration/line?flow_id=${attrs.flow_id}&start=${attrs.start}&end=${attrs.end}&limit=100000&width=${width}&height=300&xAxis=Values`, optionsSvg).then((response) => {
			if (response.status === 401) {
				if ( new Date() < refreshTokenExp ) {
					console.log("401, but I can refresh jwt");
					Auth(refresh_token);
				} else {
					console.log("401 and I need to auth again");
				}
			} else {
				return response.text();
			}
		}).then((svg) => {
			root_plots.insertAdjacentHTML("beforeend", `
				<div class="card-v14 padding-sm grid-column col-12@xs col-12@lg">
					<h2 class="text-md line">${attrs.title}</h2>
				</div>`);
			root_plots.querySelector("div h2.line").insertAdjacentHTML("afterend", svg);
		}).catch((error) => {
			console.log("An error occured (PlotLine)");
			console.log(error);
		});
};
var Boxplot = function (attrs) {
	fetch(`${t6Api}/exploration/boxplot?flow_id=${attrs.flow_id}&start=${attrs.start}&end=${attrs.end}&limit=100000&width=${width}&height=300&xAxis=Values`, optionsSvg).then((response) => {
			if (response.status === 401) {
				if ( new Date() < refreshTokenExp ) {
					console.log("401, but I can refresh jwt");
					Auth(refresh_token);
				} else {
					console.log("401 and I need to auth again");
				}
			} else {
				return response.text();
			}
		}).then((svg) => {
			root_plots.insertAdjacentHTML("beforeend", `
				<div class="card-v14 padding-sm grid-column col-12@xs col-12@lg">
					<h2 class="text-md boxplot">${attrs.title}</h2>
				</div>`);
			root_plots.querySelector("div h2.boxplot").insertAdjacentHTML("afterend", svg);
		}).catch((error) => {
			console.log("An error occured (Boxplot)");
			console.log(error);
		});
};

// frequencyDistribution
var frequencyDistribution = function (attrs) {
	fetch(`${t6Api}/exploration/frequencyDistribution?flow_id=${attrs.flow_id}&start=${attrs.start}&end=${attrs.end}&ticks=20&group=1w&width=${width}&height=300&xAxis=Values`, optionsSvg).then((response) => {
			if (response.status === 401) {
				if ( new Date() < refreshTokenExp ) {
					console.log("401, but I can refresh jwt");
					Auth(refresh_token);
				} else {
					console.log("401 and I need to auth again");
				}
			} else {
				return response.text();
			}
		}).then((svg) => {
			root_plots.insertAdjacentHTML("beforeend", `
				<div class="card-v14 padding-sm grid-column col-12@xs col-12@lg">
					<h2 class="text-md frequencyDistribution">${attrs.title}</h2>
				</div>`);
			root_plots.querySelector("div h2.frequencyDistribution").insertAdjacentHTML("afterend", svg);
		}).catch((error) => {
			console.log("An error occured (frequencyDistribution)");
			console.log(error);
		});
};

//keyMetric
var keyMetric = function (attrs) {
	root_metrics.insertAdjacentHTML("beforeend", `
		<div class="card-v14 padding-sm grid-column col-4@xs col-4@lg">
			<figure class="cd-timeline__img margin-bottom-xs" aria-hidden="true">
				<span class="material-icons">${typeof attrs.icon !== "undefined" ? attrs.icon : "event"}</span>
			</figure>
			<h2 class="text-md">${attrs.title}</h2>
			<p class="color-contrast-medium line-height-md margin-y-xs big">${typeof attrs.text !== "undefined" ? attrs.text : ""}</p>
		</div>`);
};

// Insights
fetch(`${t6Api}/stories/${story}/insights`, optionsJson).then((response) => {
		if (response.status === 401 || response.status === 403) {
			if ( new Date() < refreshTokenExp ) {
				console.log("401, but I can refresh jwt");
				Auth(refresh_token);
			} else {
				console.log("401 and I need to auth again");
			}
		} else if (response.status === 404) {
			console.log("No data");
		} else {
			return response.json();
		}
	}).then((insights) => {
		H1({value: insights.links.meta.name});
		Headers({value: `Story created: ${formatTime(insights.links.meta.created)}`});
		Headers({value: `From ${formatTime(insights.links.meta.start)} to ${formatTime(insights.links.meta.end)}`});
		Headers({value: `Retention: ${insights.links.meta.retention}`});
		keyMetric({title: "Story duration", icon: "grade", text: `${toHHMMSS(((insights.data[(insights.data.length - 1)]).attributes.timestamp - (insights.data[0]).attributes.timestamp))}`});
		insights.data = (insights.data).sort(function (a, b) {return new Date(a.attributes.timestamp) - new Date(b.attributes.timestamp);});
		if(new Date(insights.links.meta.end) > new Date()) {
			console.log("Not ended story");
		}
		
		PlotLine({title: "Plot line", flow_id: insights.links.meta.flow_id, start: insights.links.meta.start,end: insights.links.meta.end});
		Boxplot({title: "Boxplot", flow_id: insights.links.meta.flow_id, start: insights.links.meta.start,end: insights.links.meta.end});
		frequencyDistribution({title: "Frequency Distribution", flow_id: insights.links.meta.flow_id, start: insights.links.meta.start,end: insights.links.meta.end});

		(insights.data).map((item) => {
			if(item.type === "insights") {
				let insight = item.attributes;
				if (insight.type === "firstData" || insight.type === "lastData") {
					Insight({title: insight.title, icon: "event", text: insight.text, date: formatTime(insight.timestamp)});
				} else if (insight.type === "peak") {
					Insight({title: `${insight.title} at ${sprintf(insight.unit, insight.value)}`, date: formatTime(insight.timestamp), icon: "insights", text: insight.text});
				} else if (insight.type === "outlier") {
					Insight({title: `${insight.title} at ${sprintf(insight.unit, insight.value)}`, date: formatTime(insight.timestamp), icon: "insights", text: insight.text});
				}
			}
		});
	}).catch((error) => {
		console.log("An error occured (Insights)");
		console.log(error);
	});

// Metrics
fetch(`${t6Api}/stories/${story}/metrics`, optionsJson).then((response) => {
		if (response.status === 401 || response.status === 403) {
			if ( new Date() < refreshTokenExp ) {
				console.log("401, but I can refresh jwt");
				Auth(refresh_token);
			} else {
				console.log("401 and I need to auth again");
			}
		} else if (response.status === 404) {
			console.log("No data");
		} else {
			return response.json();
		}
	}).then((metrics) => {
		(metrics.data).map((item) => {
			if(item.type === "metrics") {
				let metric = item.attributes;
				keyMetric({title: metric.title, icon: "grade", text: `${metric.value}`});
				if(metric.name === "size") {
					size = metric.value; // async !!!
				}
			}
		});
	}).catch((error) => {
		console.log("An error occured (Metrics)");
		console.log(error);
	});

// Gaps
fetch(`${t6Api}/stories/${story}/gaps`, optionsJson).then((response) => {
		if (response.status === 401 || response.status === 403) {
			if ( new Date() < refreshTokenExp ) {
				console.log("401, but I can refresh jwt");
				Auth(refresh_token);
			} else {
				console.log("401 and I need to auth again");
			}
		} else if (response.status === 404) {
			console.log("No data");
		} else {
			return response.json();
		}
	}).then((gaps) => {
		(gaps.data).map((item) => {
			if(item.type === "gaps") {
				let gap = item.attributes;
				gapCard({missing_values: gap.gap, gap_duration: gap.gap_duration, icon: "grade", date: formatTime(gap.timestamp)});
			}
		});
		keyMetric({title: "Total Missing Values", icon: "grade", text: `${gaps.links.meta.total_missing_values}`});
		keyMetric({title: "Missing Rate", icon: "grade", text: `${(gaps.links.meta.total_missing_values*100/size).toPrecision(4)}%`});
	}).catch((error) => {
		console.log("An error occured (Gaps)");
		console.log(error);
	});
	
function Auth(refresh_token) {
	if(!authInProcess) {
		authInProcess = true;
		let AuthOptions = {
			mode: "cors",
			method : "POST",
			Referer: t6Url,
			Origin: t6Url,
			cache: "no-cache",
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json",
				"Authorization": `Bearer ${bearer}`,
			},
			body: JSON.stringify({
				"grant_type": "refresh_token",
				"refresh_token": refresh_token
			})
		}
		fetch(`${t6Api}/authenticate`, AuthOptions).then((response) => {
				if (response.status === 200) {
					return response.json();
				}
			}).then((auth) => {
				bearer = auth.token;
				refresh_token = auth.refresh_token;
				refreshTokenExp = auth.refreshTokenExp;
			}).catch((error) => {
				console.log("An error occured (Auth)");
				console.log(error);
			});
	}
}

document.getElementsByTagName("html")[0].className += " js";
