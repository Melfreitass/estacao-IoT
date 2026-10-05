const MQTT_HOST = "192.168.X.X";

const MQTT_PORT = 9001;

const TOPIC_TEMP = "aulas/professor/temperatura";
const TOPIC_HUM = "aulas/professor/umidade";
const TOPIC_AIR = "aulas/professor/qualidade_ar";

const clientID =
    "WebDash_" + Math.random().toString(16).substring(2, 10);


// Cria cliente MQTT
const client = new Paho.MQTT.Client(
    MQTT_HOST,
    Number(MQTT_PORT),
    clientID
);


// Eventos
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;


// Tenta conectar
conectarMQTT();


// ==========================================
// NAVEGAÇÃO
// ==========================================

function mostrarPagina(pagina) {

    document.querySelectorAll(".pagina").forEach(section => {
        section.classList.remove("ativa");
    });

    document.getElementById(pagina).classList.add("ativa");


    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.remove("active");
    });

    if (pagina === "sobre") {
        document.querySelectorAll(".nav-btn")[0].classList.add("active");
    } else {
        document.querySelectorAll(".nav-btn")[1].classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// MQTT
// ==========================================

function conectarMQTT() {

    atualizarStatus(
        false,
        "Conectando...",
        "Conectando ao Mosquitto..."
    );

    client.connect({
        useSSL: false,

        timeout: 10,

        onSuccess: onConnect,

        onFailure: onFailure
    });
}


function onConnect() {

    atualizarStatus(
        true,
        "Conectado",
        "Conectado ao Mosquitto"
    );

    console.log("MQTT conectado!");

    client.subscribe(TOPIC_TEMP);
    client.subscribe(TOPIC_HUM);
    client.subscribe(TOPIC_AIR);

    console.log("Inscrito nos tópicos MQTT.");
}


function onFailure(responseObject) {

    console.log(
        "Falha na conexão:",
        responseObject.errorMessage
    );

    atualizarStatus(
        false,
        "Desconectado",
        "Falha na conexão"
    );
}


function onConnectionLost(responseObject) {

    if (responseObject.errorCode !== 0) {

        console.log(
            "Conexão perdida:",
            responseObject.errorMessage
        );

        atualizarStatus(
            false,
            "Desconectado",
            "Conexão perdida"
        );

        // Tenta reconectar depois de 5 segundos
        setTimeout(() => {
            conectarMQTT();
        }, 5000);
    }
}


// ==========================================
// RECEBIMENTO DAS MENSAGENS
// ==========================================

function onMessageArrived(message) {

    const topic = message.destinationName;
    const payload = message.payloadString;

    console.log("Mensagem recebida:");
    console.log(topic, payload);


    // TEMPERATURA
    if (topic === TOPIC_TEMP) {

        document.getElementById("temp").textContent = payload;

        const temperatura = Number(payload);

        if (temperatura > 28) {

            document.getElementById("temp-alert").textContent =
                "⚠ Temperatura acima do limite";

        } else {

            document.getElementById("temp-alert").textContent =
                "✓ Temperatura normal";
        }
    }


    // UMIDADE
    else if (topic === TOPIC_HUM) {

        document.getElementById("hum").textContent = payload;

        const umidade = Number(payload);

        if (umidade > 56) {

            document.getElementById("hum-alert").textContent =
                "⚠ Umidade acima do limite";

        } else {

            document.getElementById("hum-alert").textContent =
                "✓ Umidade normal";
        }
    }


    // QUALIDADE DO AR
    else if (topic === TOPIC_AIR) {

        document.getElementById("air").textContent = payload;

        const qualidade = Number(payload);

        if (qualidade > 400) {

            document.getElementById("air-alert").textContent =
                "⚠ Qualidade do ar em alerta";

        } else {

            document.getElementById("air-alert").textContent =
                "✓ Qualidade do ar normal";
        }
    }
}


// ==========================================
// STATUS DO DASHBOARD
// ==========================================

function atualizarStatus(conectado, texto, mqttTexto) {

    const status = document.getElementById("status");
    const mqttStatus = document.getElementById("mqtt-status");

    if (conectado) {

        status.className = "status connected";

        status.innerHTML =
            "<span></span> " + texto;

    } else {

        status.className = "status disconnected";

        status.innerHTML =
            "<span></span> " + texto;
    }

    mqttStatus.textContent = mqttTexto;
}


// ==========================================
// LOCAL STORAGE
// ==========================================

function salvarSenha() {

    const input = document.getElementById("groupPassword");

    const senha = input.value.trim();

    if (senha === "") {

        document.getElementById("password-message").textContent =
            "Digite uma senha.";

        return;
    }


    localStorage.setItem(
        "grupo5_senha",
        senha
    );


    document.getElementById("password-message").textContent =
        "✓ Senha salva neste navegador.";

    input.value = "";
}


// Carrega indicação se já existe senha salva
window.addEventListener("DOMContentLoaded", () => {

    const senhaSalva =
        localStorage.getItem("grupo5_senha");

    if (senhaSalva) {

        document.getElementById("password-message").textContent =
            "✓ Já existe uma senha salva neste navegador.";
    }
});