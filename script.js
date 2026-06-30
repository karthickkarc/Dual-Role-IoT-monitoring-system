// ===============================
// MQTT Configuration
// ===============================

const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");

// ===============================
// Chart
// ===============================

const ctx = document.getElementById("summaryChart");

const chart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: [
            "Heart Rate",
            "SpO2",
            "Body Temp",
            "Room Temp",
            "Oxygen",
            "AQI"
        ],
        datasets: [{
            label: "Current Values",
            data: [0,0,0,0,0,0]
        }]
    },
    options:{
        responsive:true,
        scales:{
            y:{
                beginAtZero:true
            }
        }
    }
});

// ===============================
// MQTT Connected
// ===============================

client.on("connect", ()=>{

    console.log("Connected to MQTT");

    client.subscribe("hospital/medical");
    client.subscribe("hospital/facility");
    client.subscribe("hospital/alerts");

});

// ===============================
// Receive MQTT Messages
// ===============================

client.on("message",(topic,message)=>{

    const payload = message.toString();

    // ---------- Medical ----------
    if(topic==="hospital/medical"){

        const data = JSON.parse(payload);

        document.getElementById("heartRate").innerHTML =
        data.heartRate+" BPM";

        document.getElementById("spo2").innerHTML =
        data.spo2+" %";

        document.getElementById("bodyTemp").innerHTML =
        data.bodyTemp+" °C";

        document.getElementById("heartBar").style.width =
        data.heartRate+"%";

        document.getElementById("spo2Bar").style.width =
        data.spo2+"%";

        document.getElementById("bodyBar").style.width =
        (data.bodyTemp*2)+"%";

        chart.data.datasets[0].data[0]=data.heartRate;
        chart.data.datasets[0].data[1]=data.spo2;
        chart.data.datasets[0].data[2]=data.bodyTemp;

    }

    // ---------- Facility ----------

    if(topic==="hospital/facility"){

        const data = JSON.parse(payload);

        document.getElementById("roomTemp").innerHTML =
        data.roomTemp+" °C";

        document.getElementById("oxygen").innerHTML =
        data.oxygen+" %";

        document.getElementById("aqi").innerHTML =
        data.aqi;

        document.getElementById("roomBar").style.width =
        (data.roomTemp*3)+"%";

        document.getElementById("oxygenBar").style.width =
        (data.oxygen*4)+"%";

        document.getElementById("aqiBar").style.width =
        (data.aqi/2)+"%";

        chart.data.datasets[0].data[3]=data.roomTemp;
        chart.data.datasets[0].data[4]=data.oxygen;
        chart.data.datasets[0].data[5]=data.aqi;

    }

    // ---------- Alerts ----------

    if(topic==="hospital/alerts"){

        const li=document.createElement("li");

        li.innerHTML=payload;

        document.getElementById("alerts").prepend(li);

        if(document.getElementById("alerts").children.length>8){

            document.getElementById("alerts").lastChild.remove();

        }

    }

    chart.update();

});

// ===============================
// MQTT Errors
// ===============================

client.on("error",(err)=>{

    console.log(err);

});

client.on("offline",()=>{

    console.log("MQTT Offline");

});