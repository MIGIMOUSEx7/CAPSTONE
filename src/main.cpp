#include "esp_camera.h"
#include <WiFi.h>
#include "esp_http_server.h"
#include <HTTPClient.h>
#include <WiFiClientSecure.h> 
#include <PubSubClient.h>

// AI-THINKER pin configuration
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// Credentials
const char* ssid = "GFiber_2.4_Coverage_65DD3";
const char* password = "BE2745F7";

// EMQX MQTT Credentials
const char* mqtt_server = "ce41d666.ala.asia-southeast1.emqxsl.com";
const int mqtt_port = 8883; 
const char* mqtt_user = "agriresq_node";
const char* mqtt_pass = "123qweasd";

// Backend Server
const char* serverURL = "http://192.168.254.113:8000/api/analyze-freshness/"; 

WiFiClient wifiClient;
WiFiClientSecure secureClient; // Required for port 8883 (SSL/TLS)
PubSubClient mqttClient(secureClient);
httpd_handle_t stream_httpd = NULL;

void sendCamHeartbeat() {
  if (!mqttClient.connected()) {
    // Set secure server configuration
    mqttClient.setServer(mqtt_server, mqtt_port);
    if (mqttClient.connect("CAM_NODE_01", mqtt_user, mqtt_pass)) {
      Serial.println("✅ MQTT Heartbeat Connected Securely");
    }
  }
  if (mqttClient.connected()) {
    String payload = "{\"node_id\": \"CAM_01\", \"status\": \"ONLINE\", \"battery\": \"100%\"}";
    mqttClient.publish("agriresq/telemetry/cam_status", payload.c_str());
    mqttClient.loop();
  }
}

void uploadImageToServer() {
  Serial.println("📷 Capturing image for AI Analysis...");
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) { Serial.println("❌ Camera capture failed"); return; }

  HTTPClient http;
  http.begin(wifiClient, serverURL);
  http.addHeader("Content-Type", "image/jpeg");
  http.addHeader("X-Crop-Type", "EGGPLANT"); 
  
  int httpResponseCode = http.POST(fb->buf, fb->len);
  if (httpResponseCode > 0) {
    Serial.printf("✅ AI Server Response (%d)\n", httpResponseCode);
    sendCamHeartbeat(); 
  } else {
    Serial.printf("❌ Error: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  http.end();
  esp_camera_fb_return(fb);
}

#define PART_BOUNDARY "123456789000000000000987654321"
static const char* _STREAM_CONTENT_TYPE = "multipart/x-mixed-replace;boundary=" PART_BOUNDARY;
static const char* _STREAM_BOUNDARY = "\r\n--" PART_BOUNDARY "\r\n";
static const char* _STREAM_PART = "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n";

esp_err_t stream_handler(httpd_req_t *req) {
  camera_fb_t * fb = NULL;
  esp_err_t res = ESP_OK;
  res = httpd_resp_set_type(req, _STREAM_CONTENT_TYPE);
  if(res != ESP_OK) return res;
  while(true) {
    fb = esp_camera_fb_get();
    if (!fb) { res = ESP_FAIL; } 
    else {
      size_t hlen = snprintf((char *)NULL, 0, _STREAM_PART, fb->len);
      char * part_buf = (char *)malloc(hlen + 1);
      snprintf(part_buf, hlen + 1, _STREAM_PART, fb->len);
      res = httpd_resp_send_chunk(req, part_buf, hlen);
      free(part_buf);
      if(res == ESP_OK) res = httpd_resp_send_chunk(req, (const char *)fb->buf, fb->len);
      if(res == ESP_OK) res = httpd_resp_send_chunk(req, _STREAM_BOUNDARY, strlen(_STREAM_BOUNDARY));
      esp_camera_fb_return(fb);
    }
    if(res != ESP_OK) break;
  }
  return res;
}

void startCameraServer(){
  httpd_config_t config = HTTPD_DEFAULT_CONFIG();
  config.server_port = 80;
  httpd_uri_t index_uri = { .uri = "/stream", .method = HTTP_GET, .handler = stream_handler, .user_ctx = NULL };
  if (httpd_start(&stream_httpd, &config) == ESP_OK) {
    httpd_register_uri_handler(stream_httpd, &index_uri);
  }
}

void setup() {
  Serial.begin(115200);
  
  // Set Insecure to allow secure connection to EMQX without certificates
  secureClient.setInsecure();
  
  camera_config_t config;
  config.pin_d0 = Y2_GPIO_NUM; config.pin_d1 = Y3_GPIO_NUM; config.pin_d2 = Y4_GPIO_NUM; 
  config.pin_d3 = Y5_GPIO_NUM; config.pin_d4 = Y6_GPIO_NUM; config.pin_d5 = Y7_GPIO_NUM; 
  config.pin_d6 = Y8_GPIO_NUM; config.pin_d7 = Y9_GPIO_NUM; config.pin_xclk = XCLK_GPIO_NUM; 
  config.pin_pclk = PCLK_GPIO_NUM; config.pin_vsync = VSYNC_GPIO_NUM; config.pin_href = HREF_GPIO_NUM; 
  config.pin_sscb_sda = SIOD_GPIO_NUM; config.pin_sscb_scl = SIOC_GPIO_NUM; config.pin_pwdn = PWDN_GPIO_NUM; 
  config.pin_reset = RESET_GPIO_NUM; config.xclk_freq_hz = 20000000; config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_VGA; config.jpeg_quality = 12; config.fb_count = 2;

  esp_camera_init(&config);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  
  startCameraServer();
  uploadImageToServer();
}

void loop() {
  delay(15000); 
  uploadImageToServer();
}