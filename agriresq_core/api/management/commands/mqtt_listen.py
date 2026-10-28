from django.core.management.base import BaseCommand
import os
import paho.mqtt.client as mqtt
import json
import ssl
from api.models import IoTNode, SensorLog, CropBatch, WholesalerProfile
from django.contrib.auth.models import User

# --- EMQX CLOUD CONFIGURATION ---
# Same credentials as before. Environment variables (if set) override them.
EMQX_HOST = os.environ.get("EMQX_HOST", "ce41d666.ala.asia-southeast1.emqxsl.com")
EMQX_PORT = int(os.environ.get("EMQX_PORT", "8883"))  # secure TLS port
EMQX_USER = os.environ.get("EMQX_USER", "agriresq_node")
EMQX_PASS = os.environ.get("EMQX_PASS", "123qweasd")
TOPIC = os.environ.get("MQTT_TOPIC", "agriresq/telemetry/dht22")


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Successfully connected to EMQX Cloud!")
        client.subscribe(TOPIC)
        print(f"📡 Listening on topic: {TOPIC}")
    else:
        print(f"❌ Failed to connect, return code {rc}")


def on_disconnect(client, userdata, rc):
    print(f"⚠️ Disconnected from EMQX (rc={rc}); will retry automatically")


def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode("utf-8")
        data = json.loads(payload)

        node_id = data.get("node_id")
        temp = data.get("temperature")
        humidity = data.get("humidity")

        # 1. Ensure we have a default Wholesaler
        user, _ = User.objects.get_or_create(username="default_wholesaler")
        wholesaler, _ = WholesalerProfile.objects.get_or_create(
            user=user,
            defaults={'stall_number': '1'}
        )

        # 2. Get or create the Node
        node, created = IoTNode.objects.get_or_create(
            device_token=node_id,
            defaults={
                'wholesaler': wholesaler,
                'stall_location': data.get("location", "Stall 1")
            }
        )

        # 3. Save the log
        SensorLog.objects.create(
            iot_node=node,
            temperature_c=temp,
            humidity_rh=humidity
        )
        print(f"💾 Saved: {node_id} | {temp}°C | {humidity}% RH")

    except Exception as e:
        print(f"❌ Error processing MQTT message: {e}")


class Command(BaseCommand):
    help = 'Starts the Secure MQTT Listener'

    def handle(self, *args, **kwargs):
        # Works with both paho-mqtt 1.x and 2.x
        try:
            client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1)
        except AttributeError:
            client = mqtt.Client()

        client.username_pw_set(EMQX_USER, EMQX_PASS)

        # Encrypt the connection to port 8883
        client.tls_set(cert_reqs=ssl.CERT_NONE)
        client.tls_insecure_set(True)  # Required for EMQX Cloud auto-certs

        client.on_connect = on_connect
        client.on_disconnect = on_disconnect
        client.on_message = on_message

        print(f"🚀 Connecting to EMQX Cloud {EMQX_HOST}:{EMQX_PORT} (SSL)...")
        # connect_async + retry_first_connection: a timeout no longer kills the
        # listener; it keeps retrying in the background.
        client.connect_async(EMQX_HOST, EMQX_PORT, 60)
        client.loop_forever(retry_first_connection=True)