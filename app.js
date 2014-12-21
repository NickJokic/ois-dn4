var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';
var username = "ois.seminar";
var password = "ois4fri";


function getSessionId() {

var response = $.ajax({
type: "POST",
url: baseUrl + "/session?username=" + encodeURIComponent(username) +
"&password=" + encodeURIComponent(password),
async: false
});
    
return response.responseJSON.sessionId;
}

function kreirajEHR(){
    sessionId = getSessionId();
    var ime = $("#setName").val();
    var priimek = $("#setLastName").val();
    var datumRojstva = $("#setBirthDate").val();
    
    $.ajaxSetup({
    headers: {
        "Ehr-Session": sessionId
    }
});
    
$.ajax({
    url: baseUrl + "/ehr",
    type: 'POST',
    success: function (data) {
        var ehrId = data.ehrId;
        

        // build party data
        var partyData = {
            firstNames: ime,
            lastNames: priimek,
            dateOfBirth: datumRojstva,
            partyAdditionalInfo: [
                {
                    key: "ehrId",
                    value: ehrId
                }
            ]
        };
        
        $.ajax({
            url: baseUrl + "/demographics/party",
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(partyData),
            success: function (party) {
                if (party.action == 'CREATE') {
                    $("#kreirajEHRObvestilo").html("Dodana oseba z EHR ID: " + ehrId);
                }
            }
        });
    }//end of function
});
    
}

function dodajVitalnePodatke(){
    sessionId = getSessionId();
    var ehrId = $("#setEhrID").val();
    var visina = $("#setHeight").val();
    var teza = $("#setWeight").val();
    var temperatura = $("#setTemp").val();
    var sistolicni = $("#setSystolicBP").val();
    var diastolicni = $("#setDiastolicBP").val();
    var saturacija = $("#setOxygenSaturation").val();

    
    $.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "vital_signs/height_length/any_event/body_height_length": visina,
		    "vital_signs/body_weight/any_event/body_weight": teza,
		   	"vital_signs/body_temperature/any_event/temperature|magnitude": temperatura,
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/blood_pressure/any_event/systolic": sistolicni,
		    "vital_signs/blood_pressure/any_event/diastolic": diastolicni,
		    "vital_signs/indirect_oximetry:0/spo2|numerator": saturacija
		};
		var parametriZahteve = {
		    "ehrId": ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: 'Unknown'
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		    	console.log(res.meta.href);
		        $("#dodajMeritveSporocilo").html(res.meta.href);
		    },
		    error: function(err) {
		    	$("#dodajMeritveSporocilo").html("Napaka: " + JSON.parse(err.responseText).userMessage);
				console.log(JSON.parse(err.responseText).userMessage);
		    }
		});
	
    
    
    
    
}

function bmiCalc(visina, teza){
var bmi = (teza) / ((visina/100)*(visina/100));
bmi = bmi.toFixed(2);
    return bmi;

}

function izracunajBMI(){

    var visinaZaBMI = $("#setHeightBMI").val();
    var tezaZaBMI = $("#setWeightBMI").val();
    var valueOfBMI = (tezaZaBMI)/ ((visinaZaBMI/100)*(visinaZaBMI/100));
    valueOfBMI = valueOfBMI.toFixed(2);
    
    if (visinaZaBMI<10 || visinaZaBMI>270 || tezaZaBMI>400 || tezaZaBMI<1 || visinaZaBMI.trim==0 || tezaZaBMI.trim==0){
    $("#obvestiloBMI").html("<span class='obvestilo label label-success fade-in'>" +"Prosim, preverite vnos!" + "</span>");
    }else{
    
    
    if(valueOfBMI>=18.5 && valueOfBMI<=25.0){
    $("#obvestiloBMI").html("<span class='obvestilo label label-success fade-in'>" + valueOfBMI + ", ITM je normalen" + ".</span>");
    }
    else if (valueOfBMI<18.5 && valueOfBMI>=16.0){
    $("#obvestiloBMI").html("<span class='obvestilo label label-warning fade-in'>" + valueOfBMI + ", ITM je rahlo do zmerno prenizek" + ".</span>");
    }
    else if (valueOfBMI<16.0){
    $("#obvestiloBMI").html("<span class='obvestilo label label-danger fade-in'>" + valueOfBMI + ", ITM je zelo prenizek" + ".</span>");
    }
    
    
    else if (valueOfBMI>25.0 && valueOfBMI<30.0){
    $("#obvestiloBMI").html("<span class='obvestilo label label-danger fade-in'>" + valueOfBMI + ", ITM je rahlo do zmerno previsok" + ".</span>");
    }
    else if (valueOfBMI>30.0){
    $("#obvestiloBMI").html("<span class='obvestilo label label-danger fade-in'>" + valueOfBMI + ", ITM je zelo previsok" + ".</span>");
    }
    }
}

function preveriTrenutnoZdravje(){
    var visina = $("#setHeight").val();
    var teza = $("#setWeight").val();
    var temperatura = $("#setTemp").val();
    var sistolicni = $("#setSystolicBP").val();
    var diastolicni = $("#setDiastolicBP").val();
    var saturacija = $("#setOxygenSaturation").val();
    var bmi = bmiCalc(visina,teza);
    
    if (!visina || !teza || !temperatura || !sistolicni || !diastolicni || !saturacija) {
		$("#nasvetBMI").html("<span class='obvestilo label label-warning fade-in'>Izpolnite vsa polja!</span>");
	} else {
    
    
    
    
    if(bmi>=18.5 && bmi<=25.0){
        $("#nasvetBMI").html("<span class='obvestilo label label-success fade-in'>" + "ITM je normalen" + ".</span>");
    }
    
    else if(bmi<18.5){
        $("#nasvetBMI").html("<span class='obvestilo label label-warning fade-in'>" + "ITM je prenizek" + ".</span>");
    }
    
    else if (bmi>25.0){
        $("#nasvetBMI").html("<span class='obvestilo label label-warning fade-in'>" + "ITM je previsok" + ".</span>");
    }
    
    if (temperatura >= 36.5 && temperatura <= 37.5){
        $("#nasvetTemp").html("<span class='obvestilo label label-success fade-in'>" + "Temperatura je normalna" + ".</span>");
    }

    else if (temperatura < 36.5){
        $("#nasvetTemp").html("<span class='obvestilo label label-warning fade-in'>" + "Temperatura je prenizka" + ".</span>");
    }
    
    else if (temperatura > 37.5){
        $("#nasvetTemp").html("<span class='obvestilo label label-warning fade-in'>" + "Temperatura je previsoka" + ".</span>");
    }
    
    if (sistolicni >= 90 && sistolicni <= 119){
        $("#nasvetSistolicni").html("<span class='obvestilo label label-success fade-in'>" + "Sistolični tlak je normalen" + ".</span>");
    }
    
    else if (sistolicni > 119){
        $("#nasvetSistolicni").html("<span class='obvestilo label label-warning fade-in'>" + "Sistolični tlak je previsok" + ".</span>");
    }

    else if (sistolicni < 90){
        $("#nasvetSistolicni").html("<span class='obvestilo label label-warning fade-in'>" + "Sistolični tlak je prenizek" + ".</span>");
    }
    
    if(diastolicni >= 60 && diastolicni <= 79){
        $("#nasvetDiastolicni").html("<span class='obvestilo label label-success fade-in'>" + "Diastolični tlak je normalen" + ".</span>");
    }
    
    else if (diastolicni < 60){
        $("#nasvetDiastolicni").html("<span class='obvestilo label label-warning fade-in'>" + "Diastolični tlak je prenizek" + ".</span>");
    }
    
    else if (diastolicni > 79){
        $("#nasvetDiastolicni").html("<span class='obvestilo label label-warning fade-in'>" + "Diastolični tlak je previsok" + ".</span>");
    }
    
    if (saturacija >= 94 && saturacija < 100){
        $("#nasvetSaturacija").html("<span class='obvestilo label label-success fade-in'>" + "Delež kisika v krvi je normalen" + ".</span>");
    }
    
    else if (saturacija < 94){
        $("#nasvetSaturacija").html("<span class='obvestilo label label-warning fade-in'>" + "Delež kisika v krvi je prenizek" + ".</span>");
    }
    
    else if (saturacija > 100){
            $("#nasvetSaturacija").html("<span class='obvestilo label label-danger fade-in'>" + "Polje ni pravilno izpolnjeno! (x<100!)" + ".</span>");

    
    }
}
}


//onChange listener, ki napolni forme
$(document).ready(function() {
	$('#preberiPacienta').change(function() {
		var podatki = $(this).val().split(",");
		$("#setName").val(podatki[0]);
		$("#setLastName").val(podatki[1]);
		$("#setBirthDate").val(podatki[2]);
        $("#setHeight").val(podatki[3]);
		$("#setWeight").val(podatki[4]);
		$("#setTemp").val(podatki[5]);
        $("#setSystolicBP").val(podatki[6]);
		$("#setDiastolicBP").val(podatki[7]);
		$("#setOxygenSaturation").val(podatki[8]);
        
        

        
	});
    
    $('#preberiPacientaBMI').change(function(){
    var podatki = $(this).val().split(",");
    $("#setHeightBMI").val(podatki[0]);
    $("#setWeightBMI").val(podatki[1]);
    $("#setWeightBMI").val(podatki[1]);
    });
	
	
});




