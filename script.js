document.addEventListener("DOMContentLoaded", () => {
    const mapButton = document.getElementById("map");
    const buttonsContainer = document.getElementById("buttons-container");
    const mapScreen = document.getElementById("map-screen");
    const homeFooterButton = document.getElementById("footer-home");

    let map;
    let userMarker;
    let controlPanel;
    let mapInitialized = false; // Variável para controlar a criação do mapa

    mapButton.addEventListener("click", () => {
        buttonsContainer.classList.add("hidden");
        mapScreen.style.display = "flex";

        if (!mapInitialized) {
            createMap();
            mapInitialized = true; // Marca que o mapa foi criado
        }

        createForm(); // Mantém a criação do formulário quando necessário
    });

    homeFooterButton.addEventListener("click", () => {
        buttonsContainer.classList.remove("hidden");
        mapScreen.style.display = "none";
    });

    function createMap() {
        const mapDiv = document.createElement("div");
        mapDiv.id = "map";
        mapDiv.style.width = "100%";
        mapDiv.style.height = "80vh";
        mapScreen.appendChild(mapDiv);

        map = L.map(mapDiv).setView([0, 0], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 25,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(updateUserLocation, showError, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        } else {
            alert("Geolocalização não é suportada pelo navegador.");
        }
    }

    function createForm() {
        if (!controlPanel) {
            controlPanel = document.createElement("div");
            controlPanel.className = "control-panel";
            controlPanel.innerHTML = `
                <div class="input-group"><input type="text" id="your_name" placeholder="Seu Nome"></div>
                <div class="input-group"><input type="text" id="your_id" placeholder="Seu ID"></div>
                <div class="input-group"><input type="text" id="peer_name" placeholder="Nome do Amigo"></div>
                <div class="input-group"><input type="text" id="peer_id" placeholder="ID do Amigo"></div>
                <div class="button-group">
                    <button class="conectar" onclick="receiveLoop(this)"><i class="fa fa-user-circle"></i> Conectar</button>
                    <button class="visualizar" id="show-users-btn"><i class="fa fa-users"></i> Visualizar Usuários</button>
                </div>
            `;
            mapScreen.appendChild(controlPanel);
        }
    }

    function updateUserLocation(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Criando marcador com efeito de pulsação azul diretamente no JavaScript
        const customMarkerHtml = `
            <div style="
                width: 10px;
                height: 10px;
                background-color: blue;
                border-radius: 50%;
                border: 3px solid white;
                position: relative;
                animation: pulse-animation 1.5s infinite ease-in-out;">
            </div>
            <style>
                @keyframes pulse-animation {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
            </style>
        `;

        const userIcon = L.divIcon({
            className: '',
            html: customMarkerHtml, // Aplicação do estilo diretamente no HTML
            iconSize: [10, 10],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10]
        });

        if (!userMarker) {
            userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(map);
            userMarker.bindPopup("Você está aqui!");
        } else {
            userMarker.setLatLng([lat, lon]);
        }

        map.setView([lat, lon], 16, { animate: true, duration: 1.5 });
    }

    function showError(error) {
        console.error("Erro ao obter localização:", error.message);
        alert("Erro ao obter localização: " + error.message);
    }
});
