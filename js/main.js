let dropdown = document.getElementById("countries");
dropdown.length = 0;

let defaultOption = document.createElement("option");
defaultOption.text = "Global";

dropdown.add(defaultOption);
dropdown.selectedIndex = 0;

var dates = [];
var newcases = [];
//Global
fetch("https://corona.lmao.ninja/v2/all", {
	method: "GET",
	headers: {
		"Content-Type": "application/json",
	},
})
	.then(function (response) {
		if (response.status !== 200) {
			console.warn(
				"Looks like there was a problem. Status Code: " + response.status
			);
			return;
		}

		// Examine the text in the response
		response.json().then(function (data) {
			GlobalData = data;
			GlobalInsert(GlobalData);
		});
	})
	.catch(function (err) {
		console.error("Fetch Error -", err);
	});
function GlobalInsert(GlobalData) {
	nfObject = new Intl.NumberFormat("en-US");
	document.getElementById("tc-count").innerHTML = nfObject.format(
		GlobalData.cases
	);

	document.getElementById("tr-count").innerHTML = nfObject.format(
		GlobalData.recovered
	);
	document.getElementById("td-count").innerHTML = nfObject.format(
		GlobalData.deaths
	);
	document.getElementById("active-cases").innerHTML =
		"Active: " + nfObject.format(GlobalData.active);
	tobeRoundedDeathRate = (GlobalData.deaths / GlobalData.cases) * 100;
	document.getElementById("deathRate").innerHTML =
		"Death Rate: " + tobeRoundedDeathRate.toFixed(2) + "%";

	tobeRoundedRecoveryRate = (GlobalData.recovered / GlobalData.cases) * 100;
	document.getElementById("recoveryRate").innerHTML =
		"Recovery Rate: " + tobeRoundedRecoveryRate.toFixed(2) + "%";
}
//All Countries

fetch("https://corona.lmao.ninja/v2/countries", {
	method: "GET",
	headers: {
		"Content-Type": "application/json",
	},
})
	.then(function (response) {
		if (response.status !== 200) {
			console.warn(
				"Looks like there was a problem. Status Code: " + response.status
			);
			return;
		}

		// Examine the text in the response
		response.json().then(function (data) {
			let option;
			CountriesData = data;

			for (let i = 0; i < CountriesData.length; i++) {
				option = document.createElement("option");
				option.text = CountriesData[i].country;
				option.value = CountriesData[i].country;
				dropdown.add(option);
			}
		});
	})
	.catch(function (err) {
		console.error("Fetch Error -", err);
	});

//graph data fetch
fetch("https://covid.ourworldindata.org/data/owid-covid-data.json", {
	method: "GET",
	headers: {},
})
	.then(function (response) {
		if (response.status !== 200) {
			console.warn(
				"Looks like there was a problem. Status Code: " + response.status
			);
			return;
		}

		// Examine the text in the response
		response.json().then(function (data) {
			GraphRawData = data;
			GraphData = GraphRawData["OWID_WRL"].data;
			StartingDate = GraphData.length - 8;
			EndingDate = GraphData.length;
			for (i = StartingDate; i < EndingDate; i++) {
				dates.push(GraphData[i].date);
				newcases.push(GraphData[i].new_cases);
			}

			NewCasesChart.update();
		});
	})
	.catch(function (err) {
		console.error("Fetch Error -", err);
	});

function changecountry() {
	SelectedArray = CountriesData.filter((CountriesData) => {
		return CountriesData.country === dropdown.value;
	});

	if (dropdown.value === "Global") {
		GlobalInsert(GlobalData);
		SelectedIso = "OWID_WRL";
		changeGraph(SelectedIso);
	} else {
		SelectedIso = SelectedArray[0].countryInfo.iso3;
		changeGraph(SelectedIso);
		//Data INSERT IN HTML
		nfObject = new Intl.NumberFormat("en-US");
		document.getElementById("tc-count").innerHTML = nfObject.format(
			SelectedArray[0].cases
		);

		document.getElementById("tr-count").innerHTML = nfObject.format(
			SelectedArray[0].recovered
		);
		document.getElementById("td-count").innerHTML = nfObject.format(
			SelectedArray[0].deaths
		);
		document.getElementById("active-cases").innerHTML =
			"Active: " + nfObject.format(SelectedArray[0].active);
		tobeRoundedDeathRate =
			(SelectedArray[0].deaths / SelectedArray[0].cases) * 100;
		document.getElementById("deathRate").innerHTML =
			"Death Rate: " + tobeRoundedDeathRate.toFixed(2) + "%";

		tobeRoundedRecoveryRate =
			(SelectedArray[0].recovered / SelectedArray[0].cases) * 100;
		document.getElementById("recoveryRate").innerHTML =
			"Recovery Rate: " + tobeRoundedRecoveryRate.toFixed(2) + "%";
	}
}

dropdown.onchange = changecountry;

function changeGraph(SelectedIso) {
	GraphData = GraphRawData[SelectedIso].data;
	StartingDate = GraphData.length - 8;
	EndingDate = GraphData.length;
	while (dates.length) {
		newcases.pop();
		dates.pop();
	}
	console.log(GraphData);
	for (i = StartingDate; i < EndingDate; i++) {
		dates.push(GraphData[i].date);
		newcases.push(GraphData[i].new_cases);
	}

	NewCasesChart.update();
}
var ncv = document.getElementById("casesGraph").getContext("2d");
var NewCasesChart = new Chart(ncv, {
	type: "line",
	data: {
		labels: dates,
		datasets: [
			{
				label: "Daily Cases",
				data: newcases,
				backgroundColor: ["#e53e3e"],
				borderColor: ["#e53e3e"],
				borderWidth: 2,
				datalabels: {
					color: "yellow",
				},
			},
		],

		options: {
			scales: {
				x: {
					ticks: {
						callback: function (val, index) {
							return index % 2 === 0 ? this.getLabelForValue(val) : "";
						},
					},
				},
			},
		},
	},
});
