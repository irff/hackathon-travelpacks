$(function () {
    // SETUP
    $(".no_results_wrapper").hide();
    $("#outbounddate").datepicker({
        showOn: "focus",
        dateFormat: "yy-mm-dd"

    }).datepicker("setDate", "+7");

    $("#inbounddate").datepicker({
        showOn: "focus",
        dateFormat: 'yy-mm-dd'
    }).datepicker("setDate", "+14");

    $("input.text-input").blur(function () {
        $(this).css({ backgroundColor: "#FFFFFF" });
    });

    $(document).keyup(function (e) {
        if (e.which == 27) {
            $("#bookingdetails_row").remove();
        }
    });

    // FILL IN FIELDS BASED ON QUERY STRING
    var querystring = location.search.replace('?', '').split('&');
    for (var i = 0; i < querystring.length; i++) {
        var name = querystring[i].split('=')[0];
        var value = querystring[i].split('=')[1];
        var input = $("#" + name);
        input.val(value);
    }

    $.server = "http://partners.api.skyscanner.net";

    // CREATE SESSION
    $("#createsession_btn").click(function () {
        $.baseUrl = "/apiservices/pricing/v1.0";
        clearResultsAndStartSpinner();
        $("#pollsession_btn").removeAttr("disabled");
        $("#resultstable").empty();
        $.ajax({
            type: "POST",
            url: $.baseUrl,
            data: getDataString()
        }).always(function (a, textStatus, b) {
            stopSpinner();
            var xhr = (a != null ? a.status : void 0) != null ? a : b;
            switch (xhr.status) {
                case 201:
                    var location = xhr.getResponseHeader("Location") + "?" + $.apiKey;
                    setRequestInfo(this.type, this.url, this.data);
                    setResponseInfo(xhr.statusText, location);
                    location = location.replace(/^.*\/\/[^\/]+/, ''); // remove domain
                    $("#pollsession_btn").attr("data-url", location);
                    $("#pollsession_btn").attr("style", "visibility:visible");
                    showPollSessionBtn();
                    break;
                case 400:
                    setResponseInfo(xhr.statusText, null);
                    var msg = $.parseJSON(xhr.responseText);
                    var validationErrors = msg.ValidationErrors;
                    createValidationErrors(validationErrors);
                    break;
                default:
                    setResponseInfo(xhr.statusText, null);
                    break;
            }
        });
        return false;
    });

    // POLL SESSION
    $("#pollsession_btn").on("click", function () {
        clearResultsAndStartSpinner();
        $.ajax({
            type: "GET",
            url: $(this).attr("data-url")
        }).always(function (a, textStatus, b) {
            stopSpinner();
            var xhr = (a != null ? a.status : void 0) != null ? a : b;
            switch (xhr.status) {
                case 200:
                    showPollSessionBtn();
                    setRequestInfo(this.type, this.url, null);
                    setResponseInfo(xhr.statusText, null);

                    var msg = $.parseJSON(xhr.responseText);
                    var pollsessionstatus = "<p class='infodata'>Poll session status: <b>" + msg.Status + "</b></p>";
                    $("#responseinfo_div").append(pollsessionstatus);

                    if (msg.Status === "UpdatesComplete")
                        $("#pollsession_btn").attr("disabled", "disabled");

                    buildItinerariesTable(msg);
                    break;
                default:
                    setRequestInfo(this.type, this.url, null);
                    setResponseInfo(xhr.statusText, null);
                    break;
            }
        });
        return false;
    });

    // SELECT ITINERARY
    $(".selectbooking_btn").on('click', function () {
        clearResultsAndStartSpinner();
        $("#bookingdetails_row").remove();

        var rowId = this.id.match("booking_btn_(.*)")[1];
        $.ajax({
            type: "PUT",
            url: $(this).attr("data-url"),
            data: $(this).attr("data-body") + "&" + $.apiKey
        }).always(function (a, textStatus, b) {
            stopSpinner();
            showPollSessionBtn();
            var xhr = (a != null ? a.status : void 0) != null ? a : b;
            switch (xhr.status) {
                case 201:
                    var location = xhr.getResponseHeader("Location") + '?' + $.apiKey;
                    location = location.replace(/^.*\/\/[^\/]+/, ''); // remove domain
                    setRequestInfo(this.type, this.url, this.data);
                    setResponseInfo(xhr.statusText, location);
                    createRowWithBookingDetails(rowId, location);
                    break;
                default:
                    setRequestInfo(this.type, this.url, null);
                    setResponseInfo(xhr.statusText, null);
                    break;
            }
        });
        return false;
    });

    // POLL BOOKING
    $(".pollbooking_btn").on("click", function () {
        clearResultsAndStartSpinner();
        $("#bookingdetails_div").empty();

        $.ajax({
            type: "GET",
            url: $(this).attr("data-url")
        }).always(function (a, textStatus, b) {
            stopSpinner();
            showPollSessionBtn();
            var xhr = (a != null ? a.status : void 0) != null ? a : b;
            switch (xhr.status) {
                case 200:
                    setRequestInfo(this.type, this.url, null);
                    setResponseInfo(xhr.statusText, null);

                    var msg = $.parseJSON(xhr.responseText);
                    buildBookingDetails(msg);
                    break;
                default:
                    setRequestInfo(this.type, this.url, null);
                    setResponseInfo(xhr.statusText, null);
                    stopSpinnerAndShowPollSessionBtn();
                    break;
            }
        });
        return false;
    });

    // BOOK
    $(".deeplink_btn").on("click", function () {
        window.open($(this).attr("url"));
        return false;
    });

    // CREATE SESSION HELPER METHODS
    function getDataString() {
        $.baseUrl = "/apiservices/pricing/v1.0";
        $.returnquery = $("#inbounddate").val() != "";
        $.apiKey = "apikey=" + $("#apikey").val();

        var datastring = "";
        $('.query-input').each(function () {
            if ($(this).val() != "") {
                if (datastring != "") {
                    datastring = datastring + "&";
                }
                datastring = datastring + this.id + "=" + $(this).val();
            }
        });

        return datastring;
    }

    function createValidationErrors(validationErrors) {
        var table = "<table><tr><th>Parameter Name</th><th>Parameter Value</th><th>Message</th><th>Valid format</th><th>Valid values</th></tr>";
        for (var i = 0; i < validationErrors.length; i++) {
            var validationError = validationErrors[i];

            var validFormat = (typeof validationError.ValidFormat === 'undefined') ? "-" : validationError.ValidFormat;
            var validValues = (typeof validationError.ValidValues === 'undefined') ? "-" : validationError.ValidValues;

            table = table + "<tr><td>" + validationError.ParameterName + "</td><td>" + validationError.ParameterValue + "</td><td>" + validationError.Message + "</td>";
            table = table + "<td>" + validFormat + "</td><td>" + validValues + "</td></tr>";
        }
        table = table + "</table>";
        $("#resultstable").append(table);
    };

    // POLL SESSION HELPER METHODS
    function buildItinerariesTable(msg) {
        $("#resultstable").empty();
        var outboundData, inboundData;

        var legsLookup = getLegsLookup(msg.Legs);
        var placesLookup = getPlacesLookup(msg.Places);
        buildAgentsLookup(msg.Agents);

        if (msg.Itineraries.length == 0) {
            return;
        }
        else {
            var table = "<table><tr><th>Outbound Leg</th>";
            if ($.returnquery)
                table += "<th>Inbound Leg</th>";
            table += "<th>Pricing Options</th><th/></tr>";

            for (var i = 0; i < msg.Itineraries.length; i++) {
                var itinerary = msg.Itineraries[i];
                var link = itinerary.BookingDetailsLink;
                var selectButton = "<td><input type='submit' class='selectbooking_btn' value='Select Itinerary' id='selectbooking_btn_" + i + "' data-url='" + link.Uri + "' data-body='" + link.Body + "'/></td>";

                outboundData = legsLookup[itinerary.OutboundLegId];
                var outboundSection = getSegmentSectionPollSession(outboundData, placesLookup);
                var outboundLegCell = "<td id='outboundlegid_" + i + "' data-id=" + itinerary.OutboundLegId + ">" + outboundSection + "</td>";

                table += "<tr id='rowid_" + i + "'> " + outboundLegCell;
                if ($.returnquery) {
                    inboundData = legsLookup[itinerary.InboundLegId];
                    var inboundSection = getSegmentSectionPollSession(inboundData, placesLookup);
                    var inboundLegCell = "<td id='inboundlegid_" + i + "' data-id=" + itinerary.InboundLegId + ">" + inboundSection + "</td>";
                    table += inboundLegCell;
                }

                table += getPricingOptionsSection(itinerary.PricingOptions) + selectButton + "</tr>";
            }
            table = table + "</table>";
            $("#resultstable").append(table);
        }
    };

    function getSegmentSectionPollSession(element, placesLookup) {
        var result = "<b>Id: " + element.Id + "</b>";
        result += "<br>OriginStation: " + placesLookup[element.OriginStation];
        result += "<br>DestinationStation: " + placesLookup[element.DestinationStation];
        result += "<br>Departure: " + element.Departure;
        result += "<br>Arrival: " + element.Arrival;
        result += "<br>Stops: " + element.Stops.length;
        result += "<br>JourneyMode: " + element.JourneyMode;
        result += "<br>Duration: " + element.Duration + " (minutes)";
        return result;
    };

    function getPricingOptionsSection(pricingOptions) {
        var result = "<td>";
        for (var i = 0; i < pricingOptions.length; i++) {
            var option = pricingOptions[i];
            if (i > 0)
                result += "<br>";
            result += "Agents: ";

            if (typeof option.Agents !== "undefined") {
                for (var j = 0; j < option.Agents.length; j++) {
                    if (j > 0)
                        result += ", ";
                    result += $.agentsLookup[option.Agents[j]].Name;
                }
            };
            result += "<br>QuoteAge: " + option.QuoteAgeInMinutes + " (minutes)";
            result += "<br>Price: " + option.Price + "<br>";
        }
        return result + "</td>";
    };


    // POLL BOOKING DETAILS HELPER METHODS
    function buildBookingDetails(msg) {
        var segmentsTable = getSegmentsTable(msg);
        var bookingOptionsTable = getBookingOptionsTable(msg);
        $("#bookingdetails_div").append("<p class='infoheader'>Segments</p>");
        $("#bookingdetails_div").append(segmentsTable);
        $("#bookingdetails_div").append("<p class='infoheader'>Booking options</p>");
        $("#bookingdetails_div").append(bookingOptionsTable);
    };


    function createRowWithBookingDetails(rowId, location) {
        var bookingdetails = "<tr id='bookingdetails_row' ></tr>";
        $(bookingdetails).insertAfter("#rowid_" + rowId);
        var bookingdetailsrow = "<td colspan='4'><input type='submit' class='pollbooking_btn' value='Poll Itinerary' id='pollbooking_btn' data-url='" + location + "' /><div id='bookingdetails_div'></div></td>";
        $("#bookingdetails_row").html(bookingdetailsrow);
    };

    function getSegmentsTable(msg) {
        var outboundSegments = "";
        var inboundSegments = "";

        var placesLookup = getPlacesLookup(msg.Places);
        var carriersLookup = getCarriersLookup(msg.Carriers);

        var table = "<table class='bookingdetails'><tr><th>Outbound Segments</th>";
        if ($.returnquery) {
            table += "<th>Inbound Segments</th>";
        }
        table += "</tr>";

        for (var i = 0; i < msg.Segments.length; i++) {
            var segment = msg.Segments[i];
            var segmentString = getSegmentSectionPollBooking(segment, placesLookup, carriersLookup);

            if (segment.Directionality == "Outbound") {
                outboundSegments += segmentString;
            }
            else {
                inboundSegments += segmentString;
            }
        }

        table += "<tr><td>" + outboundSegments + "</td>";
        if ($.returnquery)
            table += "<td>" + inboundSegments + "</td>";
        table += "</tr></table>";

        return table;
    }

    function getSegmentSectionPollBooking(element, placesLookup, carriersLookup) {
        var result = "OriginStation: " + placesLookup[element.OriginStation];
        result += "<br>DestinationStation: " + placesLookup[element.DestinationStation];
        result += "<br>DepartureDateTime: " + element.DepartureDateTime;
        result += "<br>ArrivalDateTime: " + element.ArrivalDateTime;
        result += "<br>Carrier: " + carriersLookup[element.Carrier].Name + " (" + carriersLookup[element.Carrier].Code + ")";
        result += "<br>FlightNumber: " + element.FlightNumber;
        result += "<br>JourneyMode: " + element.JourneyMode;
        result += "<br>Duration: " + element.Duration + " (minutes) <br><br>";
        return result;
    };

    function getBookingOptionsTable(msg) {
        var table = "<table class='bookingdetails'><tr><th>Agent</th><th>Price</th><th>Status</th><th>Deeplink</th></tr>";
        var pending = 0;

        for (var i = 0; i < msg.BookingOptions.length; i++) {
            var option = msg.BookingOptions[i];

            for (var j = 0; j < option.BookingItems.length; j++) {
                var item = option.BookingItems[j];

                var bookButton = '<td><input type="submit" class="deeplink_btn" value="Deeplink" id="deeplink_btn_' + i + '" url="' + item.Deeplink + '" /></td>';
                var agentcell = "<td>Name: " + $.agentsLookup[item.AgentID].Name + "</td>";
                table += "<tr>" + agentcell;
                table += "<td>" + item.Price + "</td>";
                table += "<td>" + item.Status + "</td>";
                table += bookButton + "</tr>";
                if (item.Status === "Pending")
                    pending += 1;
            }
        }

        if (pending === 0)
            $("#pollbooking_btn").attr("disabled", "disabled");


        return table + "</table>";
    }

    // HELPER METHODS - COMMON
    function clearResultsAndStartSpinner() {
        $("#requestinfo_div").empty();
        $("#responseinfo_div").empty();
        $("#pollsession_btn").attr("style", "visibility:hidden");
        $("#spinner").attr("style", "visibility:visible");
    };

    function stopSpinner() {
        $("#spinner").attr("style", "visibility:hidden");
    };

    function showPollSessionBtn() {
        $("#pollsession_btn").attr("style", "visibility:visible");
    }

    function setRequestInfo(type, url, data) {
        var requestdiv = "<p class='infoheader'>Last Request</p>";
        requestdiv += "<p class='infodata'>Method: <b>" + type + "</b></p>";
        url = $.server + url;
        if (data !== null) {
            requestdiv += "<p class='infodata'>Url: <b>" + url + "</b></p>";
            requestdiv += "<p class='infodata'>Body: <b>" + data + "</b></p>";
        }
        else {
            requestdiv += "<p class='infodata'>Url: <b><a href='" + url + "' target='_blank'>" + url + "</a></b></p>";
        }
        $("#requestinfo_div").html(requestdiv);
        var htmlWithCorrectParam = $("#requestinfo_div").html().replace('¤', '&amp;curren');
        $("#requestinfo_div").html(htmlWithCorrectParam);
    };

    function setResponseInfo(statusText, location) {
        var responsediv = "<p class='infoheader'>Last Response</p>";
        responsediv += "<p class='infodata'>Status: <b>" + statusText + "</b></p>";

        if (location !== null) {
            responsediv += "<p class='infodata'><a href='" + location + "' target='_blank'>Location</a>" + "</p>";
        }

        $("#responseinfo_div").html(responsediv);
    };

    function getLegsLookup(legs) {
        var legsLookup = {};
        for (var k = 0; k < legs.length; k++) {
            legsLookup[legs[k].Id] = legs[k];
        }
        return legsLookup;
    };

    function getPlacesLookup(places) {
        var placesLookup = {};
        for (var k = 0; k < places.length; k++) {
            placesLookup[places[k].Id] = places[k].Code;
        }
        return placesLookup;
    };

    function getCarriersLookup(carriers) {
        var carriersLookup = {};
        for (var k = 0; k < carriers.length; k++) {
            carriersLookup[carriers[k].Id] = { Code: carriers[k].Code, Name: carriers[k].Name, ImageUrl: carriers[k].ImageUrl };
        }
        return carriersLookup;
    };

    function buildAgentsLookup(agents) {
        $.agentsLookup = {};
        for (var k = 0; k < agents.length; k++) {
            $.agentsLookup[agents[k].Id] = { Code: agents[k].Code, Name: agents[k].Name, ImageUrl: agents[k].ImageUrl };
        }
    };

});
