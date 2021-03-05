let newP = document.createElement("p");
let newP2 = document.createElement("p");
let newP3 = document.createElement("p");
let newP4 = document.createElement("p");
let p = 0;
let x = 0;
let r = 0;
let rand1;
let rand2;
let rand3;
let destTime;
let destName;
let destNum = 0;
let tot;
let points = 0;
let sparad;
let poäng = [0, 0, 0, 0];
let originName;
let originTime;
let label = ['0', '1', '2', 'Alla rätt!'];

let stationer = ["9021014001410000", "9022014004527001", "9022014001050003", "9021014005160000", "9022014002210004", "9022014012130011", "9021014003680000", "9022014004850005", "9022014002043002", "9022014004000004", "9022014007880030", "9022014005740001", "9022014001420004", "9022014001960001", "9021014003760000", "9022014007220002", "9022014003127001", "9022014004945002"]


// Local storage är en funktion som sparar data i webbläsaren, även efter att du stängt den, här sparar jag de 
// antalet omgångar som spelaren klarat av. 

let localPoints = localStorage.getItem('points');
if (localStorage.getItem("points") < 1000) {
    document.querySelector("#vunnaSpel").innerHTML = "&#128081;" + localPoints;
} else {
    document.querySelector("#vunnaSpel").innerHTML = "&#128081;0"
}


// Här skapar jag tre randomiserade tal. Två stycken för att få fram två randomiserade stationer, och ett randomiserat tal för vilken 
// avgångstid som resan ska ha

function newRands() {
    rand1 = Math.floor(Math.random() * 17);
    rand2 = Math.floor(Math.random() * 17);
    rand3 = Math.floor(Math.random() * 14 + 7);
    if (rand1 === rand2) {
        rand1 + 2; {
            if (rand1 > 17) {
                rand1 -= 10;
            }
        }
    }
}


// Här är huvudfunktionen. 

function nyResa() {
    newRands();
    document.querySelector("#star").src = "bilder/star.svg";


    // Här anropar jag vässtrafik för att få en personlig nyckel för att få använda deras API. 
    // Många APIer behöver inte denna funktion.

    fetch('https://api.vasttrafik.se/token', {
            body: 'grant_type=client_credentials&scope=0',
            headers: {
                Authorization: 'Basic NUlqcjFkQlhxWjFWREpTOHpSX2ZDTWY5Tm1ZYTpsdTdNb0Y4eFFlTzNwS0hKamZNYmZ3b3paMndh',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'POST'
        })
        .then((response) => response.json())
        .then((result) => {
            let accessToken = result.access_token
            console.log(accessToken);


            // Här gör jag mitt anrop för att få tag i ett nytt reseobjekt. Där inkluderar jag vilka två stationer jag vill resa mellan och vilken tid

            fetch('https://api.vasttrafik.se/bin/rest.exe/v2/trip?originId=' + stationer[rand1] + '&destId=' + stationer[rand2] + '&time=' + rand3 + '&format=json', {
                    headers: {
                        Authorization: 'Bearer ' + accessToken
                    }
                })
                .then((response) => response.json())
                .then((result) => {

                    // Denna consol log kan vara intressant att titta på, det är hela objektet som jag tar emot. Förstår man objektet så förstår man också varför jag skriver som jag skriver sen. 
                    console.log(result)

                    if ('error' in result.TripList || result.TripList.Trip[0].Leg.length == -1) {
                        nyResa();
                    }

                    if (Array.isArray(result.TripList.Trip[0].Leg)) {
                        originName = result.TripList.Trip[0].Leg[0].Origin.name;
                    } else {
                        originName = result.TripList.Trip[0].Leg.Origin.name
                    }

                    if (Array.isArray(result.TripList.Trip[0].Leg)) {
                        destNum = (result.TripList.Trip[0].Leg.length) - 1;
                    } else { destNum = 0 }


                    // Här tar jag reda på ifall "Leg" är en array. Ifall det inte är det så tar jag datan som den är.
                    if (Array.isArray(result.TripList.Trip[0].Leg) == false) {
                        result = result.TripList.Trip[0].Leg.Destination;
                        destTime = result.TripList.Trip[0].Leg.Destination.time;
                        destName = result.TripList.Trip[0].Leg.Destination.name;
                        originTime = result.TripList.Trip[0].Leg.Origin.time;
                        console.log("endast ett objekt")
                        if (originName == destName) {
                            nyResa();
                        }

                        // Ifall Leg ÄR en array - så tar jag den sista anhalten på resan som en destination... förstår om detta kan verka rörigt.
                    } else {
                        destTime = result.TripList.Trip[0].Leg[destNum].Destination.time;
                        destName = result.TripList.Trip[0].Leg[destNum].Destination.name;
                        originTime = result.TripList.Trip[0].Leg[0].Origin.time;

                    }


                    destTime.toString(10).split("").map(function(t) { return parseInt(t) })


                    // Fixtime är en funktion jag använder för att göra om tiden från t ex 14:05 till minuter. Dvs 14x60 + 05. Ifall ankomst är 15:05 så blir det (15x60+05)-(14x60+05) = 60. 
                    destTimeFixed = fixTime(destTime);
                    originTimeFixed = fixTime(originTime);

                    tot = destTimeFixed - originTimeFixed;

                    // Ibland kommer objektet i konstig form, då gjorde jag en fullösning och startar om funktionen :)
                    if (tot > 200) {
                        nyResa();
                    }

                    // NewP är en variabel som skapar ett nytt P-element.
                    newP.innerHTML = originName;
                    newP.id = "newP1";
                    document.querySelector(".resor").appendChild(newP);

                    newP2.innerHTML = destName;
                    newP2.id = "newP2";
                    document.querySelector(".resor").appendChild(newP2);

                    newP3.innerHTML = "Avg: " + originTime;
                    document.querySelector(".avgangsTid").appendChild(newP3);

                    console.log("Denna resa tar " + tot + " minuter")

                    sparad = originName + " - " + destName + "<br>Avgång " + originTime + " Ankomst: " + destTime + ".";
                })
        });

}


// Denna funktion aktiveras av att klicka på stjärnan uppe i höger
function sparaResa() {
    sessionStorage.setItem("savedTrip", sparad)
    newP4.innerHTML = sessionStorage.getItem("savedTrip")
    document.querySelector("#sparad").appendChild(newP4)
    console.log("yea")
    document.querySelector("#star").src = "bilder/starGold.svg";
}

// Här ger jag användaren en marginal på +-20% för att slippa svara rätt på minuten.
function checkAnswer() {
    let max = tot * 1.2;
    let min = tot * 0.8;


    let answer = document.getElementById("answer").value;
    if (answer == tot) {
        document.getElementById("return").innerHTML = "MITT I PRICK!"
        document.getElementById("points-" + points).src = "bilder/correct.svg"
        document.getElementById("points-" + points).style.transform = "rotate(90deg)"
        points++;
    } else if (answer < max && answer > min) {
        document.getElementById("return").innerHTML = "Nära nog! Rätt svar: " + tot + "min";
        document.getElementById("points-" + points).src = "bilder/correct.svg";
        document.getElementById("points-" + points).style.transform = "rotate(90deg)"
        points++;
    } else {
        document.getElementById("return").innerHTML = "Fel :( denna resa tar " + tot + " minuter";
        document.getElementById("points-0").src = "bilder/wrong.svg"
        document.getElementById("points-1").src = "bilder/wrong.svg"

        poäng[points]++;
        points = 0;
        console.log(poäng[0], poäng[1], poäng[2], poäng[3])

    }

    if (points == 3) {
        document.getElementById("return2").innerHTML += " Grattis, du vann!"

        document.getElementById("vunnaSpel").style.fontSize = "8vh"
        document.getElementById("vunnaSpel").style.transform = "rotate(360deg)"
        for (i = 0; i < 6; i++) {}

        document.getElementById("skicka").textContent = "Spela igen"
        document.getElementById("skicka").style.backgroundColor = "green";
        document.querySelector("#skicka").addEventListener("click", reload)
        poäng[3]++;
        let newPoints = parseInt(localPoints) + 1;

        console.log(localPoints)
        console.log(newPoints)
        localStorage.setItem('points', newPoints);
        document.querySelector("#vunnaSpel").innerHTML = "&#128081;" + newPoints;
        document.getElementById("newP1").innerHTML = "";
        document.getElementById("newP2").innerHTML = "";

    }

    if (points < 4) {
        nyResa();
    }
}
document.querySelector("#skicka").addEventListener("click", checkAnswer)



function reload() {
    location.reload();
}

function fixTime(x) {
    x = x.replace(/:/g, '')
    hours = x.slice(0, 2);
    min = x.slice(2, 4);
    hours = (hours * 60);
    hours += min;
    return hours;
}

nyResa();


// Detta gäller menyerna i Headern samt statistiken nere i Footern.
function showMenu() {
    let x = document.querySelector(".myMenu").style.visibility;
    x === "visible" ? x = "hidden" : x = "visible";
    document.querySelector(".myMenu").style.visibility = x;
    document.querySelector("#sparad").style.visibility = "hidden";
    document.querySelector("#sparad2").style.visibility = "hidden";

}

function toggle() {
    let x = document.querySelector("#sparad").style.visibility;
    x === "visible" ? x = "hidden" : x = "visible";
    document.querySelector("#sparad").style.visibility = x;
}

function toggle2() {
    let x = document.querySelector("#sparad2").style.visibility;
    x === "visible" ? x = "hidden" : x = "visible";
    document.querySelector("#sparad2").style.visibility = x;
}

function toggle3() {

    let x = document.querySelector("#myChart").style.visibility;
    x === "visible" ? x = "hidden" : x = "visible";
    document.querySelector("#myChart").style.visibility = x;
    console.log(poäng)
    myChart.data.datasets[0].data = poäng;
    myChart.update();
}


let ctx = document.getElementById('myChart').getContext('2d');
let myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['0', '1', '2', 'Alla rätt!'],
        datasets: [{
            label: 'Antal rätt',
            data: [poäng[0], poäng[1], poäng[2], poäng[3]],
            backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    stepSize: 1
                }
            }]
        }
    }
});