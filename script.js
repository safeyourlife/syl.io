document.addEventListener("DOMContentLoaded", () => {
    const mapButton = document.getElementById("map");
    const buttonsContainer = document.getElementById("buttons-container");
    const mapContainer = document.getElementById("map-container");
    const homeFooterButton = document.getElementById("footer-home");

    let map;
    let userMarker;
    let usersMarkers = {}; // Armazena os marcadores de outros usuários

    const ws = new WebSocket("ws://localhost:8080"); // Conecta ao servidor WebSocket

    const userId = "user_" + Math.floor(Math.random() * 10000); // ID único para cada usuário

    // Exibe o mapa corretamente ao clicar no botão Mapa
    mapButton.addEventListener("click", () => {
        buttonsContainer.classList.add("hidden");
        mapContainer.classList.remove("hidden");
        mapContainer.innerHTML = `<div id="map" style="height: 80vh; width: 100%;"></div>`;

        if (!map) {
            initializeMap();
        }
    });

    // Faz os botões reaparecerem ao clicar no ícone de Início no rodapé
    homeFooterButton.addEventListener("click", () => {
        buttonsContainer.classList.remove("hidden");
        mapContainer.classList.add("hidden");
        mapContainer.innerHTML = "";
    });

    // Inicializa o mapa
    function initializeMap() {
        map = L.map('map').setView([0, 0], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 25,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(updateUserLocation, () => {
                alert("Não foi possível obter a localização.");
            }, {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            });
        } else {
            alert("Geolocalização não é suportada pelo navegador.");
        }

        // Recebe atualização de localização dos outros usuários
        ws.addEventListener("message", (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "usersUpdate") {
                updateOtherUsersLocations(data.users);
            }
        });
    }

    // Atualiza a localização do usuário no mapa e envia para o servidor WebSocket
    function updateUserLocation(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const userIcon = L.divIcon({
            className: 'custom-marker blue pulse',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10]
        });

        if (!userMarker) {
            userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(map);
            userMarker.bindPopup("Você está aqui!");
        } else {
            userMarker.setLatLng([lat, lon]); // Atualiza posição sem criar novos marcadores
        }

        map.setView([lat, lon], 16);

        // Enviar a localização para o servidor WebSocket
        ws.send(JSON.stringify({ type: "updateLocation", userId, lat, lon, name: userId }));
    }

    // Atualiza os marcadores dos outros usuários
    function updateOtherUsersLocations(usersData) {
        Object.keys(usersData).forEach((userId) => {
            const { lat, lon, name } = usersData[userId];

            const userIcon = L.divIcon({
                className: 'custom-marker red pulse',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
                popupAnchor: [0, -10]
            });

            if (!usersMarkers[userId]) {
                usersMarkers[userId] = L.marker([lat, lon], { icon: userIcon }).addTo(map);
                usersMarkers[userId].bindPopup(`${name} está aqui!`);
            } else {
                usersMarkers[userId].setLatLng([lat, lon]); // Apenas atualiza a posição existente
            }
        });
    }
});
