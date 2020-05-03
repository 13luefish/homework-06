$(document).ready(function () {
  var apiKey = "8da8223fa9427133bd5a64cf0f8be8df";
  var cityNameArr = [];
  renderHistory();
  $("#searchBtn").on("click", function (event) {
    event.preventDefault();
    var cityInput = $("#search-city").val().trim();
    $(".right").empty();
    $(".forecast").empty();
    $("#search-city").val("");
    if (cityNameArr.indexOf(cityInput) === -1) {
      cityNameArr.push(cityInput)
    }
    currentWeather(cityInput);
    forecastWeather(cityInput);
    storeHistory();
    renderHistory();
  });
  $("#clearBtn").on("click", function (event) {
    event.preventDefault();
    $(".left-bottom").empty();
    window.localStorage.clear()
    cityNameArr = []
  })
  $(".left-bottom").on("click", function (event) {
    event.preventDefault();
    var element = $(event.target);
    $(".right").empty();
    $(".forecast").empty();
    currentWeather(element.text());
    forecastWeather(element.text());
  });

  function tempConvert(number) {
    return ((number - 273.15) * 1.8 + 32).toFixed(0);
  }

  function currentWeather(cityInput) {
    $.ajax({
      url: "https://api.openweathermap.org/data/2.5/weather?q=" +
        cityInput + "&appid=" +
        apiKey,
      method: "GET",
    }).then(function (response) {
      console.log(response);
      var latNum = response.coord.lat;
      var lonNum = response.coord.lon;
      var icon = response.weather[0].icon;
      var weatherImg = $("<img>")
        .attr("src", "https://openweathermap.org/img/wn/" + icon + "@2x.png")
        .attr("height", "100")
        .attr("width", "100");
      var tempNum = response.main.temp;
      var cityName = $("<h1>").text(response.name);
      var today = moment().format("MM/DD/YYYY");
      var date = $("<h2>").text(today);
      var temp = $("<p>").text("Temperature: " + tempConvert(tempNum) + " ºF");
      var humidity = $("<p>").text("Humidity: " + response.main.humidity + "%");
      var windSpeed = $("<p>").text(
        "Wind Speed: " + response.wind.speed + " MPH"
      );
      $(".right").attr("style", "display")
      $(".right").prepend(date, cityName, weatherImg, temp, humidity, windSpeed);
      UVindex(latNum, lonNum);
    });

    function UVindex(num1, num2) {
      $.ajax({
        url: "https://api.openweathermap.org/data/2.5/uvi?appid=" +
          apiKey +
          "&lat=" +
          num1 +
          "&lon=" +
          num2,
        method: "GET",
      }).then(function (response) {
        console.log(response);
        var index = $("<span>").addClass("btn-sm").text(response.value);
        var UV = $("<p>").text("UV Index: ");
        if (response.value < 4) {
          index.attr("style", "background-color: green");
        } else if (response.value > 4 && response.value < 7) {
          index.attr("style", "background-color: orange");
        } else if (response.value > 7) {
          index.attr("style", "background-color: red");
        }
        $(".right").append(UV.append(index));
      });
    }
  }

  function forecastWeather(cityInput) {
    $.ajax({
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" +
        cityInput +
        "&appid=" +
        apiKey,
      method: "GET",
    }).then(function (response) {
      var forecastArr = [
        response.list[5],
        response.list[13],
        response.list[21],
        response.list[29],
        response.list[37],
      ];
      var tempArr = [];
      $(".five-day").attr("style", "display");
      for (var i = 0; i < forecastArr.length; i++) {
        var timeStamp = forecastArr[i].dt_txt;
        var timerFormatted = moment(timeStamp).format("MM/DD/YYYY");
        var forecastIcon = forecastArr[i].weather[0].icon;
        var forecastPic = $("<img>")
          .attr(
            "src",
            "https://openweathermap.org/img/wn/" + forecastIcon + "@2x.png"
          )
          .attr("height", "100")
          .attr("width", "100");
        var forecastTempNum = forecastArr[i].main.temp;
        var tempConvertForecast = tempConvert(forecastTempNum);
        tempArr.push(tempConvertForecast);
        var forecastDiv = $("<div>").addClass("col");
        var forecastDate = $("<h4>")
          .text(timerFormatted)
          .attr("style", "font-size: 20px");
        var forecastTemp = $("<p>")
          .text("Temperature: " + tempArr[i] + "ºF")
          .attr("style", "font-size: 15px");
        var forecastHumidity = $("<p>")
          .text("Humidity: " + forecastArr[i].main.humidity + "%")
          .attr("style", "font-size: 15px");
        forecastDiv.prepend(
          forecastDate,
          forecastPic,
          forecastTemp,
          forecastHumidity
        );
        $(".forecast").append(forecastDiv);
      }
    });
  }

  function storeHistory() {
    window.localStorage.setItem("history", JSON.stringify(cityNameArr));
  }

  function renderHistory() {
    cityNameArr = JSON.parse(window.localStorage.getItem("history")) || []
    $(".left-bottom").empty()
    for (var i = 0; i < cityNameArr.length; i++) {
      var li = $("<li>")
        .attr("class", "list-group-item")
        .text(cityNameArr[i]);
      $(".left-bottom").prepend(li);
    }
  }
})