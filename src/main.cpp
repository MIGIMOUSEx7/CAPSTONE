#include "esp_camera.h"
#include <WiFi.h>
#include "esp_http_server.h"
#include <HTTPClient.h>

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
const char* ssid = "Calvinzeus 2.4G";
const char* password = "gulmatico6";

// ⚠️ UPDATE THIS TO YOUR LAPTOP'S IP ADDRESS ⚠️
const char* serverURL = "http://192.168.100.212:8000/api/analyze-freshness/"; 

httpd_handle_t stream_httpd = NULL;

void uploadImageToServer() {
  Serial.println("📷 Capturing image for AI Analysis...");
  
  // Get frame from the second buffer
  camera_fb_t *fb = esp_camera_fb_get();
  
  if (!fb) {
    Serial.println("❌ Camera capture failed");
    return;
  }

  WiFiClient client;
  HTTPClient http;
  
  Serial.println("📤 Uploading to Django Backend...");
  http.begin(client, serverURL);
  http.addHeader("Content-Type", "image/jpeg");
  http.addHeader("X-Crop-Type", "EGGPLANT"); // Set this to CARROT or CUCUMBER as needed
  
  int httpResponseCode = http.POST(fb->buf, fb->len);
  
  if (httpResponseCode > 0) {
    Serial.printf("✅ Server Response (%d): %s\n", httpResponseCode, http.getString().c_str());
  } else {
    Serial.printf("❌ Error: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  
  http.end();
  esp_camera_fb_return(fb); // Release memory
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
    if (!fb) {
      res = ESP_FAIL;
    } else {
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
  
  httpd_uri_t index_uri = {
    .uri       = "/stream",
    .method    = HTTP_GET,
    .handler   = stream_handler,
    .user_ctx  = NULL
  };
  
  if (httpd_start(&stream_httpd, &config) == ESP_OK) {
    httpd_register_uri_handler(stream_httpd, &index_uri);
  }
}

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println("\n🌱 AgriResQ System Booting...");

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM; 
  config.pin_sccb_scl = SIOC_GPIO_NUM; 
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  config.frame_size = FRAMESIZE_VGA;
  config.jpeg_quality = 12;
  config.fb_count = 2; // MAGIC FIX: Using 2 buffers prevents memory crashes

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("❌ Camera init failed: 0x%x\n", err);
    return;
  }
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\n✅ WiFi connected!");
  Serial.print("Lens test ready! Open this link in your browser: http://");
  Serial.print(WiFi.localIP());
  Serial.println("/stream");

  startCameraServer();
  uploadImageToServer();
}

void loop() {
  // Take a fresh AI photo every 15 seconds
  delay(15000); 
  uploadImageToServer();
}