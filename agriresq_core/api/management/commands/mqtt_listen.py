# STREAMING_CHUNK:Importing necessary libraries...
from django.core.management.base import BaseCommand
import paho.mqtt.client as mqtt
import json
import math
import ssl
from api.models import IoTNode, SensorLog, CropBatch

# --- EMQX CLOUD CONFIGURATION ---
EMQX_HOST = "ce41d666.ala.asia-southeast1.emqxsl.com"
EMQX_PORT = 8883
EMQX_USER = "agriresq_node"
EMQX_PASS = "123qweasd"

# Define both topics
TOPIC_DHT = "agriresq/telemetry/dht22"
TOPIC_CAM = "agriresq/telemetry/cam_status"

# STREAMING_CHUNK:Defining the Hybrid Spoilage Classification Engine logic...
def process_environmental_data(batch, temp, rh):
    """
    Mathematical core of the Hybrid Spoilage Classification Engine.
    """
    svp = 0.61078 * math.exp((17.27 * temp) / (temp + 237.3))
    avp = svp * (rh / 100.0)
    vpd = svp - avp

    crop = batch.crop.upper()
    stress_temp = 25.0 
    if "CARROT" in crop: 
        stress_temp = 30.0

    heat_penalty = max(0, (temp - stress_temp) * 5) 
    vpd_penalty = max(0, (vpd - 1.0) * 10) 
    
    freshness_score = 100 - heat_penalty - vpd_penalty
    freshness_score = max(0, min(100, freshness_score))

    if freshness_score >= 80:
        batch.status = "Fresh"
        batch.statusBg = "bg-emerald-100 text-emerald-700"
        batch.statusColor = "bg-emerald-100 text-emerald-700"
        batch.daysColor = "text-emerald-600"
    elif freshness_score >= 50:
        batch.status = "Monitoring"
        batch.statusBg = "bg-amber-100 text-amber-700"
        batch.statusColor = "bg-amber-100 text-amber-700"
        batch.daysColor = "text-amber-500"
    else:
        batch.status = "At-Risk"
        batch.statusBg = "bg-rose-100 text-rose-700"
        batch.statusColor = "bg-rose-100 text-rose-700"
        batch.daysColor = "text-rose-500"
        batch.days = 1 

    batch.temp = f"{temp:.1f}°C"
    batch.rh = f"{rh:.1f}% RH"
    batch.save()
    
    return freshness_score, vpd

# STREAMING_CHUNK:Configuring unified MQTT event handlers...
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Successfully connected to EMQX Cloud!")
        # Subscribe to both topics
        client.subscribe([(TOPIC_DHT, 0), (TOPIC_CAM, 0)])
        print(f"📡 Listening on topics: {TOPIC_DHT}, {TOPIC_CAM}")
    else:
        print(f"❌ Failed to connect, return code {rc}")

def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode("utf-8")
        data = json.loads(payload)
        
        # Route logic based on topic
        if msg.topic == TOPIC_DHT:
            node_id = data.get("node_id")
            temp = data.get("temperature")
            humidity = data.get("humidity")
            
            node, created = IoTNode.objects.get_or_create(
                device_token=node_id,
                defaults={'stall_location': data.get("location", "Unknown"), 'is_active': True}
            )
            
            active_batch = CropBatch.objects.filter(iot_node=node).first()
            
            if active_batch:
                score, vpd = process_environmental_data(active_batch, temp, humidity)
                print(f"🌡️ DHT Update [{active_batch.crop}]: {temp}°C | Freshness: {score:.1f}%")
            else:
                print(f"🌡️ DHT Data: {temp}°C, {humidity}% RH (No linked batch)")

            SensorLog.objects.create(iot_node=node, crop_batch=active_batch, temperature_c=temp, humidity_rh=humidity)

        elif msg.topic == TOPIC_CAM:
            # Handle camera heartbeat
            print(f"📷 Camera Heartbeat Received: {data}")

    except Exception as e:
        print(f"❌ Error processing MQTT message: {e}")

# STREAMING_CHUNK:Defining the management command class...
class Command(BaseCommand):
    help = 'Starts the Unified MQTT Listener'

    def handle(self, *args, **kwargs):
        print("🚀 Starting Unified AgriResQ MQTT Listener...")
        
        client = mqtt.Client(client_id="Django-Backend-Listener")
        client.username_pw_set(EMQX_USER, EMQX_PASS)
        
        # SSL Bypass Fix
        client.tls_set(cert_reqs=ssl.CERT_NONE)
        client.tls_insecure_set(True)
        
        client.on_connect = on_connect
        client.on_message = on_message
        
        try:
            client.connect(EMQX_HOST, EMQX_PORT, 60)
            client.loop_forever()
        except KeyboardInterrupt:
            print("\n🛑 Disconnected from EMQX")
            client.disconnect()