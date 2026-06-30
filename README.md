# Dual-Role IoT Monitoring System (ESP32 \+ MQTT)

Wokwi file: https://wokwi.com/projects/468167658023070721
A simulated hospital IoT system built on an ESP32, demonstrating **role-based dashboards** for two different audiences from a single device: a **Medical Staff Dashboard** for patient vitals, and a **Facility Management Dashboard** for environmental conditions. Built and tested in [Wokwi](https://wokwi.com/).

## Overview

The system separates sensor data into two logical streams published over MQTT, enabling role-based access and monitoring without exposing irrelevant data to either audience:

- **Medical Dashboard** — patient vitals: Heart Rate, SpO₂, Body Temperature  
- **Facility Dashboard** — environmental conditions: Room Temperature, Oxygen Level, AQI (Air Quality Index)

Each dataset is published to its own MQTT topic. Gauge widgets (e.g. in an MQTT dashboard tool of your choice) can subscribe to the relevant topics with predefined safe thresholds, and a dedicated alert topic fires whenever a reading crosses into an abnormal range. The system also performs periodic aggregation (60-second rolling averages) and publishes a summarized JSON snapshot, giving it a more enterprise-style IoT architecture rather than just raw streaming values.

## Architecture

                ┌─────────────────────┐

                │        ESP32         │

                │  (sensors \+ WiFi)    │

                └─────────┬────────────┘

                          │ MQTT (broker.hivemq.com)

        ┌─────────────────┼─────────────────┐

        │                 │                 │

 hospital/medical/\*  hospital/facility/\*  hospital/alerts

        │                 │                 │

        ▼                 ▼                 ▼

 Medical Dashboard  Facility Dashboard   Alert Feed

                 hospital/summary

                 (60s aggregated averages)

## Hardware (Simulated in Wokwi)

| Component | Wokwi Part | Purpose |
| :---- | :---- | :---- |
| ESP32 DevKit V1 | `wokwi-esp32-devkit-v1` | Main controller, WiFi \+ MQTT client |
| DHT22 | `wokwi-dht22` | Room temperature (facility) |
| DS18B20 | `wokwi-ds18b20` | Body temperature (medical) |
| Potentiometer ×4 | `wokwi-potentiometer` | Simulated analog inputs for Heart Rate, SpO₂, Oxygen Level, AQI |
| Resistor (4.7kΩ) | `wokwi-resistor` | Pull-up resistor for the DS18B20 1-Wire data line |

### Pin Mapping

| Signal | ESP32 Pin |
| :---- | :---- |
| DHT22 data | GPIO 15 |
| DS18B20 data | GPIO 4 |
| Heart Rate (pot) | GPIO 34 |
| SpO₂ (pot) | GPIO 35 |
| Oxygen Level (pot) | GPIO 32 |
| AQI (pot) | GPIO 33 |

## MQTT Topics

| Topic | Data |
| :---- | :---- |
| `hospital/medical/heartrate` | Heart rate (BPM) |
| `hospital/medical/spo2` | Blood oxygen saturation (%) |
| `hospital/medical/bodytemp` | Body temperature (°C) |
| `hospital/facility/roomtemp` | Room temperature (°C) |
| `hospital/facility/oxygen` | Ambient oxygen level (%) |
| `hospital/facility/aqi` | Air Quality Index |
| `hospital/alerts` | Threshold-breach alert messages |
| `hospital/summary` | 60-second aggregated averages (JSON) |

Broker used: `broker.hivemq.com` (public test broker, port `1883`).

## Safe Thresholds

| Parameter | Safe Range / Limit |
| :---- | :---- |
| Heart Rate | 60 – 100 BPM |
| SpO₂ | ≥ 94% |
| Body Temperature | ≤ 37.5 °C |
| Room Temperature | ≤ 30.0 °C |
| Oxygen Level | ≥ 19% |
| AQI | ≤ 120 |

Any reading outside these ranges triggers a message on `hospital/alerts`.

## Project Structure

.

├── sketch.ino        \# Main ESP32 firmware

├── diagram.json       \# Wokwi wiring diagram

├── libraries.txt      \# Required Arduino libraries

└── README.md

## Required Libraries

List these in `libraries.txt` (or install via Arduino Library Manager):

PubSubClient

ArduinoJson

DHT sensor library

Adafruit Unified Sensor

DallasTemperature

OneWire

**Note:** `DHT sensor library` depends on `Adafruit Unified Sensor`. Both must be present or the build will fail silently.

## How It Works

1. **WiFi & MQTT connection** — connects to `Wokwi-GUEST` (or your own WiFi credentials on real hardware) and to the MQTT broker, with timeout/retry logic so the device never hangs indefinitely if a connection attempt fails.  
2. **Sensor reading** — every 5 seconds, reads all medical and facility sensors (real where wired, simulated potentiometer values standing in for heart rate/SpO₂/oxygen/AQI sensors).  
3. **Publishing** — pushes medical readings and facility readings to their respective topic groups.  
4. **Alerting** — checks each reading against its safe threshold and publishes a message to `hospital/alerts` for any breach.  
5. **Aggregation** — accumulates running totals and, every 60 seconds, computes averages and publishes a JSON summary to `hospital/summary`, then resets the counters.  
6. **Serial output** — prints all live readings to the Serial Monitor every cycle for local debugging, independent of network status.

## Running the Simulation

1. Open the project in [Wokwi](https://wokwi.com/projects/468167658023070721).  
2. Confirm `libraries.txt` contains all six libraries listed above.  
3. Click **Start Simulation**.  
4. Open the **Serial Monitor** panel and set the baud rate to **115200**.  
5. Use an MQTT client (e.g. [MQTT Explorer](http://mqtt-explorer.com/) or [HiveMQ's public WebSocket client](http://www.hivemq.com/demos/websocket-client/)) to subscribe to `hospital/#` and watch the topic feeds in real time.

## Possible Extensions

- Replace simulated potentiometer inputs with real pulse oximeter / heart-rate sensor modules  
- Add TLS/authenticated MQTT for production use instead of a public test broker  
- Build a web dashboard (e.g. Node-RED, Grafana \+ MQTT bridge) for the two role-based views  
- Persist alert history to a database for audit/compliance logging

## License

MIT — feel free to use, modify, and build on this for your own IoT projects.  
