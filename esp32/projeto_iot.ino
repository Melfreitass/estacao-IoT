#include <WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"

const char* WIFI_SSID = "NOME_DO_WIFI";
const char* WIFI_PASSWORD = "SENHA_DO_WIFI";


const char* MQTT_SERVER = "192.168.X.X";

const int MQTT_PORT = 1883;


#define DHTPIN 15
#define DHTTYPE DHT11

#define MQ135_PIN 22


#define LED_UMID 2
#define LED_TEMP 12
#define LED_GAS 20


#define LIMITE_TEMP 28.0
#define LIMITE_UMID 56.0
#define LIMITE_GAS 400


#define TOPIC_TEMP "aulas/professor/temperatura"
#define TOPIC_UMID "aulas/professor/umidade"
#define TOPIC_GAS "aulas/professor/qualidade_ar"



DHT dht(DHTPIN, DHTTYPE);

WiFiClient espClient;

PubSubClient mqttClient(espClient);


void conectarWiFi() {

  Serial.print("Conectando ao Wi-Fi");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);

    Serial.print(".");
  }

  Serial.println();

  Serial.println("Wi-Fi conectado!");

  Serial.print("IP do ESP32: ");

  Serial.println(WiFi.localIP());
}



void conectarMQTT() {

  while (!mqttClient.connected()) {

    Serial.println("Conectando ao Mosquitto...");

    String clientID =
      "ESP32_Grupo5_" + String(random(0xffff), HEX);

    if (mqttClient.connect(clientID.c_str())) {

      Serial.println("MQTT conectado!");

    } else {

      Serial.print("Falha na conexão MQTT. Estado: ");

      Serial.println(mqttClient.state());

      delay(3000);
    }
  }
}



void setup() {

  Serial.begin(115200);

  Serial.println(
    "Iniciando monitoramento ambiental - Grupo 5..."
  );


  dht.begin();


  pinMode(MQ135_PIN, INPUT);


  pinMode(LED_UMID, OUTPUT);
  pinMode(LED_TEMP, OUTPUT);
  pinMode(LED_GAS, OUTPUT);



  digitalWrite(LED_UMID, LOW);
  digitalWrite(LED_TEMP, LOW);
  digitalWrite(LED_GAS, LOW);


  conectarWiFi();


  mqttClient.setServer(
    MQTT_SERVER,
    MQTT_PORT
  );


  conectarMQTT();
}



void loop() {

  if (WiFi.status() != WL_CONNECTED) {

    conectarWiFi();
  }



  if (!mqttClient.connected()) {

    conectarMQTT();
  }

  mqttClient.loop();



  delay(3000);




  float umid = dht.readHumidity();

  float temp = dht.readTemperature();

  int valorGas = analogRead(MQ135_PIN);



  if (isnan(temp) || isnan(umid)) {

    Serial.println(
      "Falha ao ler o sensor DHT11!"
    );

    return;
  }




  Serial.println(
    "------------------------------------------"
  );

  Serial.print("Temperatura: ");

  Serial.print(temp);

  Serial.println(" °C");


  Serial.print("Umidade: ");

  Serial.print(umid);

  Serial.println(" %");


  Serial.print("Qualidade do ar: ");

  Serial.println(valorGas);




  if (umid > LIMITE_UMID) {

    digitalWrite(LED_UMID, HIGH);

    Serial.println(
      "ALERTA: Umidade acima do limite!"
    );

  } else {

    digitalWrite(LED_UMID, LOW);
  }




  if (temp > LIMITE_TEMP) {

    digitalWrite(LED_TEMP, HIGH);

    Serial.println(
      "ALERTA: Temperatura acima do limite!"
    );

  } else {

    digitalWrite(LED_TEMP, LOW);
  }



  if (valorGas > LIMITE_GAS) {

    digitalWrite(LED_GAS, HIGH);

    Serial.println(
      "ALERTA: Qualidade do ar acima do limite!"
    );

  } else {

    digitalWrite(LED_GAS, LOW);
  }




  String temperaturaTexto =
    String(temp, 2);

  String umidadeTexto =
    String(umid, 2);

  String gasTexto =
    String(valorGas);


  mqttClient.publish(
    TOPIC_TEMP,
    temperaturaTexto.c_str()
  );


  mqttClient.publish(
    TOPIC_UMID,
    umidadeTexto.c_str()
  );


  mqttClient.publish(
    TOPIC_GAS,
    gasTexto.c_str()
  );


  Serial.println(
    "Dados enviados para o Mosquitto!"
  );
}