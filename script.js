document.addEventListener("DOMContentLoaded", () => {
    const mapBtn = document.getElementById("map-btn");
    const homeBtn = document.getElementById("footer-home");
    const homeScreen = document.getElementById("home-screen");
    const mapScreen = document.getElementById("map-screen");

    mapBtn.addEventListener("click", () => {
        homeScreen.classList.add("hidden");
        mapScreen.classList.remove("hidden");
        mapScreen.innerHTML = "";
        createMapInterface("map-screen");
    });

    homeBtn.addEventListener("click", () => {
        mapScreen.classList.add("hidden");
        mapScreen.innerHTML = "";
        homeScreen.classList.remove("hidden");
    });
});

function createMapInterface(containerId) {
    const container = document.getElementById(containerId);
    container.style.position = "relative";
    container.innerHTML = `
    <div id="leaflet-map" style="height: 100%; width: 100%; position: absolute; top: 0; left: 0;"></div>

    <button id="toggle-form-btn" title="Abrir Formulário">🔐&nbsp;<span class="label">Login</span></button>

        <div class="control-panel" id="form-panel" style="position: absolute;
  top: 80px;
  left: 15px;
  width: calc(100% - 30px);
  max-width: 200px;
  background: rgba(255, 255, 255, 0.2); /* transparência */
  backdrop-filter: blur(1px);           /* desfoque elegante */
  border-radius: 8px;
  padding: 10px;
  z-index: 1000;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);">

      <div class="input-group"><input type="text" id="your_name" placeholder="Seu Nome" /></div>
      <div class="input-group"><input type="text" id="your_id" placeholder="Seu ID" /></div>
      <div class="input-group"><input type="text" id="peer_name" placeholder="Nome do Amigo" /></div>
      <div class="input-group"><input type="text" id="peer_id" placeholder="ID do Amigo" /></div>
      <div class="button-group">
        <button class="conectar" id="connect-button">📡&nbsp;Conectar</button>
        <button class="visualizar" id="show-users-btn">🔍&nbsp;Visualizar Usuários</button>
      </div>
      <ul id="user-list-items" style="display:none;"></ul>
    </div>

    <div id="users-modal" class="modal hidden">
      <div class="modal-content">
        <span class="close" id="close-users-modal">&times;</span>
        <h3>Usuários Conectados:</h3>
        <ul id="modal-user-list-items"></ul>
        <button class="voltar" id="close-users-modal-btn">Voltar ao Mapa</button>
      </div>
    </div>
  `;

    // Estilos dos marcadores inseridos dinamicamente
    const style = document.createElement("style");
    style.textContent = `
    .custom-marker {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      position: relative;
      box-sizing: border-box;
    }
    .custom-marker.blue {
      background-color: #007BFF;
    }
    .custom-marker.red {
      background-color: #FF4136;
    }
    .pulse::after {
      content: "";
      position: absolute;
      top: -15px;
      left: -15px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.3;
      animation: pulse-animation 1.5s infinite;
      z-index: -1;
    }
    @keyframes pulse-animation {
      0% { transform: scale(0.5); opacity: 0.6; }
      70% { transform: scale(1.5); opacity: 0; }
      100% { transform: scale(0.5); opacity: 0; }
    }
  `;
    document.head.appendChild(style);

    const toggleBtn = document.getElementById("toggle-form-btn");
    const formPanel = document.getElementById("form-panel");
    toggleBtn.addEventListener("click", () => {
        formPanel.classList.remove("exit-left");
        formPanel.classList.toggle("visible");
    });

    setTimeout(() => {
        const map = L.map("leaflet-map").setView([0, 0], 2);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 25,
            attribution: "© OpenStreetMap contributors"
        }).addTo(map);

        const userIcon = L.divIcon({
            className: "custom-marker blue pulse",
            iconSize: [15, 15],
            iconAnchor: [10, 20],
            popupAnchor: [0, -20]
        });

        const peerIcon = L.divIcon({
            className: "custom-marker red pulse",
            iconSize: [15, 15],
            iconAnchor: [10, 20],
            popupAnchor: [0, -20]
        });

        const alertSound = new Audio("https://professorrogeriorodrigues.com/audio.mp3");

        let userMarker, peerMarker, userCoords, peerCoords;

        const your_name = document.getElementById("your_name");
        const your_id = document.getElementById("your_id");
        const peer_name = document.getElementById("peer_name");
        const peer_id = document.getElementById("peer_id");

        const userListItems = document.getElementById("user-list-items");
        const modalUserListItems = document.getElementById("modal-user-list-items");

        your_name.addEventListener("input", () => {
            const val = your_name.value.toLowerCase();
            your_name.value = val;
            your_id.value = val;
        });

        peer_name.addEventListener("input", () => {
            const val = peer_name.value.toLowerCase();
            peer_name.value = val;
            peer_id.value = val;
        });

        function updatePosition(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            userCoords = [lat, lon];

            if (!userMarker) {
                userMarker = L.marker(userCoords, { icon: userIcon }).addTo(map);
                userMarker.bindPopup("Você está aqui!").openPopup();
                map.setView(userCoords, 16);
            } else {
                userMarker.setLatLng(userCoords);
            }

            sendLocation(lat, lon);
            updateUserList(your_name.value, lat, lon);

            // Se o peer já está no mapa, calcula distância e dispara alerta
            if (peerCoords) {
                const distancia = map.distance(userCoords, peerCoords);
                if (distancia < 100) alertSound.play();
            }
        }

        function sendLocation(lat, lon) {
            fetch(`https://ppng.io/${your_id.value}-${peer_id.value}`, {
                method: "POST",
                body: JSON.stringify({ lat, lon, name: your_name.value }),
                headers: { "Content-Type": "application/json" }
            });
        }

        function updateUserList(name, lat, lon) {
            let item = document.getElementById("user-" + name);
            if (!item) {
                item = document.createElement("li");
                item.id = "user-" + name;
                userListItems.appendChild(item);
            }
            item.textContent = `${name} - Latitude: ${lat.toFixed(4)}, Longitude: ${lon.toFixed(4)}`;

            let modalItem = document.getElementById("modal-" + name);
            if (!modalItem) {
                modalItem = document.createElement("li");
                modalItem.id = "modal-" + name;
                modalUserListItems.appendChild(modalItem);
            }
            modalItem.textContent = item.textContent;
        }

        function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(updatePosition, console.error, {
                    enableHighAccuracy: true
                });
                navigator.geolocation.watchPosition(updatePosition, null, {
                    enableHighAccuracy: true,
                    maximumAge: 1000
                });
            } else {
                alert("Geolocalização não é suportada por este navegador.");
            }
        }

        function receiveLoop(btn) {
            formPanel.classList.remove("visible");
            formPanel.classList.add("exit-left");

            your_id.disabled = peer_id.disabled = your_name.disabled = peer_name.disabled = btn.disabled = true;

            async function fetchLoop() {
                try {
                    const res = await fetch(`https://ppng.io/${peer_id.value}-${your_id.value}`);
                    const data = await res.json();
                    peerCoords = [data.lat, data.lon];

                    if (!peerMarker) {
                        peerMarker = L.marker(peerCoords, { icon: peerIcon }).addTo(map);
                        peerMarker.bindPopup(peer_name.value).openPopup();
                    } else {
                        peerMarker.setLatLng(peerCoords);
                    }

                    updateUserList(peer_name.value, data.lat, data.lon);

                    // Verifica distância entre peer e usuário
                    if (userCoords) {
                        const distancia = map.distance(userCoords, peerCoords);
                        if (distancia < 100) alertSound.play();
                    }
                } catch (e) {
                    console.error(e);
                }
                setTimeout(fetchLoop, 2000); // continua checando a cada 2 segundos
            }

            fetchLoop(); // inicia o loop contínuo
        }

        // Evento: clique no botão conectar
        document.getElementById("connect-button").addEventListener("click", () =>
            receiveLoop(document.getElementById("connect-button"))
        );

        // Modal: abrir/fechar lista de usuários
        const modal = document.getElementById("users-modal");
        const openModal = document.getElementById("show-users-btn");
        const closeModal = document.getElementById("close-users-modal-btn");
        const closeX = document.getElementById("close-users-modal");

        openModal.onclick = () => modal.classList.remove("hidden");
        closeModal.onclick = () => modal.classList.add("hidden");
        closeX.onclick = () => modal.classList.add("hidden");
        window.onclick = (e) => {
            if (e.target === modal) modal.classList.add("hidden");
        };

        // Inicia geolocalização após carregamento
        getLocation();
    }, 100);
}
//Registro do service worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
        .then(() => console.log("✅ Service Worker registrado!"))
        .catch((err) => console.error("❌ Erro ao registrar SW:", err));
}
