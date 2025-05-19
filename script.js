document.addEventListener("DOMContentLoaded", () => {
    const mapButton = document.getElementById("map");
    const buttonsContainer = document.getElementById("buttons-container");
    const mapContainer = document.getElementById("map-container");
    const homeFooterButton = document.getElementById("footer-home");

    let map;
    let userMarker;

    // Exibe o mapa e oculta os botões ao clicar no botão Mapa
    mapButton.addEventListener("click", () => {
        buttonsContainer.classList.add("hidden");
        mapContainer.classList.remove("hidden");
        initializeMap();
    });

    // Faz os botões reaparecerem ao clicar no ícone de Início no rodapé
    homeFooterButton.addEventListener("click", () => {
        buttonsContainer.classList.remove("hidden");
        mapContainer.classList.add("hidden");
    });

    // Inicializa o mapa com a localização exata do usuário sem criar múltiplos marcadores
    function initializeMap() {
        if (!map) {
            map = L.map('map-container').setView([0, 0], 16);
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
        }
    }

    // Atualiza a localização do usuário no mapa sem criar novos marcadores
    function updateUserLocation(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const userIcon = L.divIcon({
            className: 'custom-marker blue pulse',
            iconSize: [10, 10],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10]
        });

        if (!userMarker) {
            userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(map);
            userMarker.bindPopup("Você está aqui!");
        } else {
            userMarker.setLatLng([lat, lon]); // Apenas atualiza a posição sem criar novos marcadores
        }

        map.setView([lat, lon], 16); // Mantém a visualização centralizada no usuário
    }
});
